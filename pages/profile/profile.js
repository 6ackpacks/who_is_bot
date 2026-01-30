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
    currentTheme: 'dark',
    activeTab: 'achievements', // 当前激活的 Tab，默认显示成就
    showMore: false, // 是否显示更多菜单

    // 最近判定记录（示例数据）
    recentJudgments: [
      {
        id: 1,
        contentType: 'text',
        isCorrect: true,
        time: '2小时前'
      },
      {
        id: 2,
        contentType: 'image',
        isCorrect: true,
        time: '5小时前'
      },
      {
        id: 3,
        contentType: 'video',
        isCorrect: false,
        time: '1天前'
      }
    ],

    // 成就列表
    achievements: [
      {
        id: 1,
        name: '火眼金睛',
        description: '连续准确率达到 90%',
        iconType: 'check-circle',
        unlocked: true
      },
      {
        id: 2,
        name: '百战老将',
        description: '完成 100 次判定',
        iconType: 'trophy',
        unlocked: true
      },
      {
        id: 3,
        name: '闪电判官',
        description: '1分钟内完成10次正确判定',
        iconType: 'check-circle',
        unlocked: false
      },
      {
        id: 4,
        name: '完美侦探',
        description: '连续50次判定全部正确',
        iconType: 'trophy',
        unlocked: false
      }
    ]
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
      this.loadRecentJudgments();
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

  // 加载最近判定记录
  loadRecentJudgments() {
    const userId = auth.getUserId();
    if (!userId) return;

    api.getUserJudgments(userId, 1, 5)
      .then(res => {
        if (res.success && res.data && res.data.list) {
          const judgments = res.data.list.map(item => ({
            id: item.id,
            contentType: item.contentType || 'text',
            isCorrect: item.isCorrect,
            time: this.formatTime(item.createdAt)
          }));
          this.setData({ recentJudgments: judgments });
        }
      })
      .catch(err => {
        console.error('获取判定记录失败:', err);
      });
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  },

  // 获取下一等级
  getNextLevel(currentLevel) {
    const levels = ['AI小白', '胜似人机', '人机杀手', '硅谷天才'];
    return levels[currentLevel] || '已满级';
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 滚动到成就区域
  scrollToAchievements() {
    this.setData({ activeTab: 'achievements' });
  },

  // 跳转到判定历史页面
  goToHistory() {
    if (!auth.isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看判定历史',
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

    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 跳转到排行榜
  goToLeaderboard() {
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    });
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 显示更多菜单
  showMoreMenu() {
    this.setData({ showMore: true });
  },

  // 隐藏更多菜单
  hideMoreMenu() {
    this.setData({ showMore: false });
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止事件冒泡到 overlay
  },

  // 跳转到设置页面
  goToSettings() {
    this.hideMoreMenu();
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  },

  // 跳转到关于页面
  goToAbout() {
    this.hideMoreMenu();
    wx.showToast({
      title: '关于功能开发中',
      icon: 'none'
    });
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
      confirmColor: '#FF6B6B',
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
    this.setData({
      currentTheme: newTheme,
      showMore: false // 关闭更多菜单
    });

    // 更新全局主题
    app.globalData.theme = newTheme;

    // 显示提示
    wx.showToast({
      title: newTheme === 'dark' ? '已切换到暗色模式' : '已切换到亮色模式',
      icon: 'success',
      duration: 1500
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
