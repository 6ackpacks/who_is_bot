// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('小程序启动');
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
