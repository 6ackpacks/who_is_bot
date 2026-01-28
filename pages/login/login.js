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

        // 2. 获取用户信息成功后，再调用微信登录获取 code
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              console.log('获取微信 code 成功:', loginRes.code);

              // 3. 调用后端登录接口
              this.loginToBackend(loginRes.code, profileRes.userInfo);
            } else {
              console.error('获取微信 code 失败:', loginRes.errMsg);
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
              title: '登录失败',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        this.setData({ loading: false });

        // 用户拒绝授权，提示用户
        wx.showModal({
          title: '提示',
          content: '需要获取您的昵称和头像，以便为您提供更好的服务',
          confirmText: '重新授权',
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 用户点击重新授权，再次调用登录
              this.handleWxLogin();
            }
          }
        });
      }
    });
  },

  // 调用后端登录接口
  loginToBackend(code, userInfo) {
    api.wxLogin(code, userInfo)
      .then(res => {
        console.log('后端登录成功:', res);

        if (res.success && res.data) {
          // 4. 保存登录信息
          auth.saveLoginInfo({
            token: res.data.token,
            userId: res.data.userId,
            userInfo: res.data.userInfo || userInfo
          });

          this.setData({ loading: false });

          // 5. 显示登录成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });

          // 6. 延迟跳转到首页
          setTimeout(() => {
            this.redirectToHome();
          }, 1500);
        } else {
          throw new Error(res.message || '登录失败');
        }
      })
      .catch(err => {
        console.error('后端登录失败:', err);
        this.setData({ loading: false });

        wx.showToast({
          title: err.message || '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
      });
  },

  // 跳转到首页
  redirectToHome() {
    wx.reLaunch({
      url: this.redirectUrl || '/pages/feed/feed'
    });
  },

  // 跳过登录
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
