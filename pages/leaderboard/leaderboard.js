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
    // 页面显示时滚动到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0  // 立即滚动，无动画
    });

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
    console.log('========== 排行榜数据处理 ==========');
    console.log('原始用户数量:', users.length);

    // 等级映射
    const levelMap = {
      '硅谷天才': 'level-4',
      '人机杀手': 'level-3',
      '胜似人机': 'level-2',
      'AI小白': 'level-1'
    };

    // 处理数据并添加 levelClass
    const processedUsers = users.map((user, index) => {
      const username = user.username || user.nickname || '匿名用户';
      // 生成默认头像，使用用户名作为种子
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

      const avatar = user.avatar || defaultAvatar;

      // 只为前3名打印详细信息
      if (index < 3) {
        console.log(`\n用户 ${index + 1}:`);
        console.log('  用户名:', username);
        console.log('  原始头像:', user.avatar);
        console.log('  最终头像:', avatar);
        console.log('  头像来源:', user.avatar ? '后端' : 'DiceBear默认');
      }

      return {
        ...user,
        levelClass: levelMap[user.level] || 'level-1',
        // 确保所有必需字段都存在
        username: username,
        avatar: avatar,
        accuracy: Math.round((user.accuracy || 0) * 10) / 10, // 保留一位小数
        weeklyAccuracy: user.weeklyAccuracy || 0,
        totalJudged: user.totalJudged || 0
      };
    });

    console.log('\n处理完成，用户数量:', processedUsers.length);
    console.log('====================================');

    return processedUsers;
  },

  // 重新加载
  handleRetry() {
    this.loadLeaderboard();
  },

  // 头像加载错误处理
  handleAvatarError(e) {
    const index = e.currentTarget.dataset.index;
    console.log('========== 排行榜头像加载失败 ==========');
    console.log('错误索引:', index);
    console.log('错误事件:', e);

    if (index !== undefined && this.data.users[index]) {
      const user = this.data.users[index];
      const username = user.username || '匿名用户';
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

      console.log('用户名:', username);
      console.log('失败的头像 URL:', user.avatar);
      console.log('切换到默认头像:', defaultAvatar);

      // 更新头像为默认头像
      const updatePath = `users[${index}].avatar`;
      this.setData({
        [updatePath]: defaultAvatar
      });

      console.log('头像已更新');
    } else {
      console.log('未找到对应的用户数据');
    }
    console.log('======================================');
  }
});
