const api = require('../../utils/api.js');

Page({
  data: {
    userId: null,
    userInfo: { nickname: '', avatar: '', bio: '', tags: [] },
    judgmentStats: { total: 0, correct: 0, accuracy: 0 },
    userRank: null,
    // Judgment records with progressive loading
    judgments: [],
    allJudgments: [],
    judgmentPage: 1,
    judgmentPageSize: 10,
    hasMoreJudgments: true,
    loadingMore: false,
    loading: true
  },

  onLoad(options) {
    if (!options.userId) {
      wx.showToast({ title: '用户不存在', icon: 'none' });
      return;
    }
    this.setData({ userId: options.userId });
    this.loadUserData();
  },

  loadUserData() {
    this.setData({ loading: true });
    const userId = this.data.userId;

    api.getUserProfile(userId).then(res => {
      if (res && res.success && res.data) {
        const profile = res.data;
        const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.nickname || 'User')}`;
        let parsedTags = [];
        try { parsedTags = profile.tags ? JSON.parse(profile.tags) : []; } catch(e) {}

        // Set navigation bar title to the user's nickname
        wx.setNavigationBarTitle({ title: profile.nickname || '用户主页' });

        this.setData({
          userInfo: {
            nickname: profile.nickname || '用户',
            avatar: profile.avatar || defaultAvatar,
            bio: profile.bio || '',
            tags: parsedTags
          },
          judgmentStats: {
            total: profile.totalJudged || 0,
            correct: Math.round(((profile.accuracy || 0) * (profile.totalJudged || 0)) / 100),
            accuracy: Math.round((profile.accuracy || 0) * 10) / 10
          },
          loading: false
        });
      }
    }).catch(err => {
      console.error('加载用户资料失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });

    this.loadJudgments();
    this.loadUserRank();
  },

  loadUserRank() {
    api.getUserRank(this.data.userId).then(res => {
      if (res.success && res.data) {
        const rank = res.data.rank;
        this.setData({ userRank: (typeof rank === 'number' && rank > 0) ? rank : (typeof rank === 'string' ? rank : null) });
      }
    }).catch(() => { this.setData({ userRank: null }); });
  },

  loadJudgments() {
    const userId = this.data.userId;
    if (!userId) return;

    api.getUserJudgments(userId).then(res => {
      const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      const allJudgments = rawList.map(item => this.formatJudgment(item));

      // Progressive loading: show first 10
      const pageSize = this.data.judgmentPageSize;
      this.setData({
        allJudgments: allJudgments,
        judgments: allJudgments.slice(0, pageSize),
        hasMoreJudgments: allJudgments.length > pageSize,
        judgmentPage: 1
      });

      // Fallback stats
      if (this.data.judgmentStats.total === 0 && allJudgments.length > 0) {
        const total = allJudgments.length;
        const correct = allJudgments.filter(j => j.isCorrect).length;
        this.setData({
          judgmentStats: { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 }
        });
      }
    }).catch(() => { this.setData({ judgments: [] }); });
  },

  loadMoreJudgments() {
    if (!this.data.hasMoreJudgments || this.data.loadingMore) return;
    this.setData({ loadingMore: true });

    const nextPage = this.data.judgmentPage + 1;
    const pageSize = this.data.judgmentPageSize;
    const allJudgments = this.data.allJudgments || [];
    const newSlice = allJudgments.slice(0, nextPage * pageSize);

    this.setData({
      judgments: newSlice,
      judgmentPage: nextPage,
      hasMoreJudgments: newSlice.length < allJudgments.length,
      loadingMore: false
    });
  },

  formatJudgment(item) {
    const validTypes = ['text', 'image', 'video'];
    const contentType = validTypes.includes(item.contentType) ? item.contentType : 'text';
    const title = item.contentTitle || '未知内容';
    return {
      id: item.id,
      contentId: item.contentId,
      contentType: contentType,
      isCorrect: item.isCorrect,
      time: this.formatTime(item.createdAt),
      title: title,
      thumbnail: contentType === 'image' ? (item.contentUrl || '') : '',
      textSnippet: contentType === 'text' ? title : ''
    };
  },

  formatTime(timestamp) {
    if (!timestamp) return '未知时间';
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  handleAvatarError() {
    const nickname = this.data.userInfo.nickname || 'User';
    this.setData({
      'userInfo.avatar': `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname)}`
    });
  }
});
