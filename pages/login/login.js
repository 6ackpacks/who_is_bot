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

  // 模拟登录
  handleWxLogin() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    // 使用模拟登录
    const mockUser = {
      nickname: '测试用户' + Math.floor(Math.random() * 1000),
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'
    };

    api.mockLogin(mockUser)
      .then(res => {
        console.log('模拟登录成功:', res);

        if (res.success && res.data) {
          // 保存用户信息
          auth.saveLoginInfo({
            token: 'mock_token_' + Date.now(),
            userId: res.data.id,
            userInfo: res.data
          });

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
        console.error('登录失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
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
