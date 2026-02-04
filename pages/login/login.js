// pages/login/login.js
const api = require('../../utils/api.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    loading: false
  },

  onLoad(options) {
    // 检查是否已登录
    if (auth.isLoggedIn()) {
      // 已登录，跳转到首页
      this.redirectToHome();
    }

    // 获取重定向路径
    this.redirectUrl = options.redirect || '/pages/feed/feed';
  },

  // 微信登录
  handleWxLogin() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    // 1. 先获取用户信息（必须在用户点击事件中直接调用）
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        console.log('获取用户信息成功:', profileRes.userInfo);

        // 2. 获取用户信息成功后，再调用 wx.login 获取登录码
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              console.log('获取登录码成功:', loginRes.code);

              // 3. 调用后端微信登录接口
              api.wxLogin(loginRes.code, profileRes.userInfo)
                .then(res => {
                  console.log('微信登录成功:', res);

                  if (res.success && res.data) {
                    console.log('后端返回的完整数据:', res.data);
                    console.log('用户头像:', res.data.avatar);

                    // 保存用户信息和 token
                    auth.saveLoginInfo({
                      token: res.data.accessToken,
                      userId: res.data.id,
                      userInfo: res.data
                    });

                    // 验证保存的数据
                    console.log('保存后的用户信息:', auth.getUserInfo());

                    this.setData({ loading: false });

                    wx.showToast({
                      title: '登录成功',
                      icon: 'success',
                      duration: 1500
                    });

                    // 延迟跳转，让用户看到成功提示
                    setTimeout(() => {
                      this.redirectToHome();
                    }, 1500);
                  } else {
                    throw new Error('登录失败');
                  }
                })
                .catch(err => {
                  console.error('微信登录失败:', err);
                  this.setData({ loading: false });
                  wx.showToast({
                    title: err.message || '登录失败，请重试',
                    icon: 'none',
                    duration: 2000
                  });
                });
            } else {
              console.error('获取登录码失败:', loginRes.errMsg);
              this.setData({ loading: false });
              wx.showToast({
                title: '登录失败，请重试',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('wx.login 调用失败:', err);
            this.setData({ loading: false });
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '需要授权才能登录',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 跳转到首页
  redirectToHome() {
    wx.reLaunch({
      url: this.redirectUrl || '/pages/feed/feed'
    });
  },

  // 跳过登录（游客模式）
  handleSkip() {
    wx.showModal({
      title: '提示',
      content: '未登录将无法保存判定记录和查看个人统计数据，确定要跳过吗？',
      confirmText: '确定跳过',
      cancelText: '去登录',
      success: (res) => {
        if (res.confirm) {
          // 标记为游客模式
          auth.setGuestMode(true);
          this.redirectToHome();
        }
      }
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '用户协议与隐私政策',
      content: '我们重视您的隐私保护，请仔细阅读《用户协议》和《隐私政策》的全部内容。',
      confirmText: '我知道了',
      showCancel: false
    });
  }
});
