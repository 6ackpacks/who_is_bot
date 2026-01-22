// pages/publish/publish.js
Page({
  data: {},

  // 返回首页
  handleBack() {
    wx.switchTab({
      url: '/pages/feed/feed'
    });
  }
});
