// pages/leaderboard/leaderboard.js
const api = require('../../utils/api.js');
const auth = require('../../utils/auth.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    users: [],
    loading: true,
    error: '',
    currentTheme: 'dark',
    scrollY: 0,
    currentUserLevel: 3,
    currentUserRank: 128
  },

  onLoad() {
    this.initTheme();
    this.loadLeaderboard();
    this.loadCurrentUserRank();
  },

  onShow() {
    // 每次显示页面时刷新数据和主题
    this.initTheme();
    this.loadLeaderboard();
    this.loadCurrentUserRank();

    // 更新自定义 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected('pages/leaderboard/leaderboard');
    }
  },

  initTheme() {
    const currentTheme = theme.getTheme();
    this.setData({ currentTheme });
  },

  // 加载当前用户排名
  loadCurrentUserRank() {
    const userId = auth.getUserId();
    if (!userId) {
      // 未登录用户显示默认值
      this.setData({
        currentUserLevel: 1,
        currentUserRank: '未上榜'
      });
      return;
    }

    const userInfo = auth.getUserInfo();
    if (userInfo) {
      this.setData({
        currentUserLevel: userInfo.level || 1
      });
    }

    // 获取用户排名
    api.getUserRank(userId)
      .then(res => {
        if (res.success && res.data) {
          this.setData({
            currentUserRank: res.data.rank || '未上榜'
          });
        }
      })
      .catch(err => {
        console.error('获取用户排名失败:', err);
      });
  },

  // 处理滚动事件 - 用于视差效果
  handleScroll(e) {
    this.setData({
      scrollY: e.detail.scrollTop
    });
  },

  // 加载排行榜数据
  loadLeaderboard() {
    this.setData({
      loading: true,
      error: ''
    });

    api.getLeaderboard({ limit: 50, type: 'weekly' })
      .then(res => {
        console.log('排行榜数据:', res);

        let users = [];
        if (res.success && res.data) {
          users = res.data;
        } else if (Array.isArray(res)) {
          users = res;
        }

        // 处理数据格式
        const processedUsers = this.processLeaderboardData(users);

        this.setData({
          users: processedUsers,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载排行榜失败:', err);
        this.setData({
          loading: false,
          error: '加载失败，请重试'
        });
      });
  },

  // 处理排行榜数据
  processLeaderboardData(users) {
    // 等级映射
    const levelMap = {
      '硅谷天才': 'level-4',
      '人机杀手': 'level-3',
      '胜似人机': 'level-2',
      'AI小白': 'level-1'
    };

    // 处理数据并添加 levelClass
    return users.map(user => ({
      ...user,
      levelClass: levelMap[user.level] || 'level-1',
      // 确保所有必需字段都存在
      username: user.username || user.nickname || '匿名用户',
      avatar: user.avatar || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
      weeklyAccuracy: user.weeklyAccuracy || user.accuracy || 0,
      accuracy: Math.round((user.accuracy || 0) * 10) / 10, // 保留一位小数
      totalJudged: user.totalJudged || 0
    }));
  },

  // 重新加载
  handleRetry() {
    this.loadLeaderboard();
  }
});
