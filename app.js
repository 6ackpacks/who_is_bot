// app.js
const auth = require('./utils/auth.js');
const theme = require('./utils/theme.js');

App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'prod-3ge8ht6pded7ed77',
      traceUser: true
    });
    console.log('云开发环境初始化完成');

    // 初始化主题
    this.initTheme();

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 初始化主题
  initTheme() {
    const currentTheme = theme.getTheme();
    this.globalData.theme = currentTheme;
    console.log('当前主题:', currentTheme);
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = auth.isLoggedIn();
    const isGuest = auth.isGuestMode();

    console.log('登录状态:', isLoggedIn ? '已登录' : '未登录');
    console.log('游客模式:', isGuest ? '是' : '否');

    if (isLoggedIn) {
      // 已登录，加载用户信息
      const userInfo = auth.getUserInfo();
      this.globalData.userInfo = userInfo;
      console.log('用户信息:', userInfo);
    } else if (!isGuest) {
      // 未登录且非游客模式，跳转到登录页
      console.log('未登录，跳转到登录页');
      // 延迟跳转，确保页面加载完成
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login'
        });
      }, 500);
    }
  },

  globalData: {
    userInfo: null,
    userStats: {
      accuracy: 78,
      totalJudged: 124,
      streak: 12
    },
    theme: 'dark' // 默认暗色主题
  }
});
