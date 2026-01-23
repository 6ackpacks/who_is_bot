// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'who-is-the-bot-backe-1ba5b1c4a6d',
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
