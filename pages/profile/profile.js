// pages/profile/profile.js
const app = getApp();
const auth = require('../../utils/auth.js');
const api = require('../../utils/api.js');
const theme = require('../../utils/theme.js');

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
    },
    isLoggedIn: false,
    currentTheme: 'dark' // 当前主题
  },

  onLoad() {
    this.initTheme();
    this.checkLoginAndLoadData();
  },

  onShow() {
    // 每次显示页面时检查登录状态和主题
    this.initTheme();
    this.checkLoginAndLoadData();
  },

  // 初始化主题
  initTheme() {
    const currentTheme = theme.getTheme();
    this.setData({ currentTheme });
  },

  // 检查登录状态并加载数据
  checkLoginAndLoadData() {
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      // 已登录，加载用户数据
      this.loadUserData();
    } else {
      // 未登录，显示默认数据
      const globalStats = app.globalData.userStats;
      if (globalStats) {
        this.setData({
          'stats.accuracy': globalStats.accuracy,
          'stats.totalJudged': globalStats.totalJudged,
          'stats.streak': globalStats.streak
        });
      }
    }
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = auth.getUserInfo();
    if (userInfo) {
      this.setData({
        userInfo: {
          nickname: userInfo.nickname || 'Cyber_Detective',
          avatar: userInfo.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser',
          level: userInfo.level || 1,
          levelName: userInfo.levelName || 'AI小白',
          nextLevel: this.getNextLevel(userInfo.level || 1),
          progress: userInfo.progress || 0,
          remaining: userInfo.remaining || 100
        }
      });
    }

    // 获取统计数据
    const userId = auth.getUserId();
    if (userId) {
      api.getUserStats(userId)
        .then(res => {
          if (res.success && res.data) {
            this.setData({
              'stats.totalJudged': res.data.totalJudged || 0,
              'stats.accuracy': res.data.accuracy || 0,
              'stats.streak': res.data.maxStreak || 0
            });
          }
        })
        .catch(err => {
          console.error('获取统计数据失败:', err);
        });
    }
  },

  // 跳转到判定历史页面
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 获取下一等级
  getNextLevel(currentLevel) {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[currentLevel] || '已满级';
  },

  // 分享侦探名片
  handleShare() {
    if (!auth.isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再分享',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login?redirect=/pages/profile/profile'
            });
          }
        }
      });
      return;
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将无法保存判定记录，确定要退出吗？',
      confirmText: '确定退出',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
        }
      }
    });
  },

  // 切换主题
  handleThemeToggle() {
    const newTheme = theme.toggleTheme();
    this.setData({ currentTheme: newTheme });

    // 更新全局主题
    app.globalData.theme = newTheme;

    // 显示提示
    wx.showToast({
      title: newTheme === 'dark' ? '已切换到暗色模式' : '已切换到亮色模式',
      icon: 'success',
      duration: 1500
    });

    // 触发页面重新渲染
    // 注意：其他页面需要在 onShow 时重新加载主题
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
