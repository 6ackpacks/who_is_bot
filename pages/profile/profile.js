// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    userInfo: {
      nickname: 'Cyber_Detective',
      level: 3,
      levelName: '人机杀手',
      nextLevel: '硅谷天才',
      progress: 72,
      remaining: 28,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser'
    },
    stats: {
      totalJudged: 850,
      accuracy: 89.4,
      streak: 12
    }
  },

  onLoad() {
    // 可以从全局数据或服务器加载用户信息
    const globalStats = app.globalData.userStats;
    if (globalStats) {
      this.setData({
        'stats.accuracy': globalStats.accuracy,
        'stats.totalJudged': globalStats.totalJudged,
        'stats.streak': globalStats.streak
      });
    }
  },

  // 分享侦探名片
  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  // 页面分享配置
  onShareAppMessage() {
    return {
      title: `我是${this.data.userInfo.levelName}！准确率${this.data.stats.accuracy}%`,
      path: '/pages/feed/feed',
      imageUrl: this.data.userInfo.avatar
    };
  }
});
