// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    userInfo: {
      nickname: '鉴伪专家_007',
      uid: '8940201',
      level: 5,
      avatar: 'https://picsum.photos/200'
    },
    stats: {
      accuracy: 78,
      totalJudged: 124,
      streak: 12
    },
    achievements: [
      {
        id: 'a1',
        icon: '🏆',
        name: '火眼金睛',
        description: '连续正确识别 50 张 AI 图片。',
        progress: 34,
        total: 50,
        bgColor: '#fef3c7',
        iconColor: '#d97706'
      },
      {
        id: 'a2',
        icon: '⬡',
        name: '贡献者',
        description: '向实验室上传 5 个样本。',
        progress: 1,
        total: 5,
        bgColor: '#f3e8ff',
        iconColor: '#9333ea'
      }
    ]
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

  // 分享主页
  handleShare() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 设置
  handleSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  }
});
