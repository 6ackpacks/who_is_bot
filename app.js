// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'prod-3ge8ht6pded7ed77',
      traceUser: true
    });
    console.log('云开发环境初始化完成');
  },

  globalData: {
    userInfo: null,
    userStats: {
      accuracy: 78,
      totalJudged: 124,
      streak: 12
    }
  }
});
