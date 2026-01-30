// pages/history/history.js
const auth = require('../../utils/auth.js');
const api = require('../../utils/api.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    judgmentHistory: [],
    loading: true,
    error: '',
    currentTheme: 'dark'
  },

  onLoad() {
    this.initTheme();
    this.loadHistory();
  },

  onShow() {
    this.initTheme();
  },

  initTheme() {
    const currentTheme = theme.getTheme();
    this.setData({ currentTheme });
  },

  // 加载判定历史
  loadHistory() {
    this.setData({
      loading: true,
      error: ''
    });

    const userId = auth.getUserId();
    if (!userId) {
      this.setData({
        loading: false,
        error: '请先登录'
      });
      return;
    }

    api.getUserJudgments(userId)
      .then(res => {
        console.log('获取判定历史成功:', res);
        let history = [];

        if (res.success && res.data) {
          history = res.data;
        } else if (Array.isArray(res)) {
          history = res;
        }

        // 格式化时间
        const timeUtil = require('../../utils/time.js');
        const formattedHistory = history.map(item => ({
          ...item,
          createdAt: timeUtil.formatRelativeTime(item.createdAt)
        }));

        this.setData({
          judgmentHistory: formattedHistory,
          loading: false
        });
      })
      .catch(err => {
        console.error('获取判定历史失败:', err);
        this.setData({
          loading: false,
          error: '加载失败，请重试'
        });
      });
  },

  // 点击记录，跳转到内容详情
  goToDetail(e) {
    const contentId = e.currentTarget.dataset.contentId;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${contentId}`
    });
  },

  // 重新加载
  handleRetry() {
    this.loadHistory();
  }
});
