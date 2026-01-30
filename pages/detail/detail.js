// pages/detail/detail.js
const api = require('../../utils/api.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    contentId: null,
    content: null,
    loading: true,
    error: '',
    currentTheme: 'dark'
  },

  onLoad(options) {
    this.initTheme();
    const contentId = options.id;
    if (contentId) {
      this.setData({ contentId });
      this.loadContentDetail(contentId);
    } else {
      this.setData({
        loading: false,
        error: '内容ID不存在'
      });
    }
  },

  onShow() {
    this.initTheme();
  },

  initTheme() {
    const currentTheme = theme.getTheme();
    this.setData({ currentTheme });
  },

  // 加载内容详情
  loadContentDetail(contentId) {
    this.setData({
      loading: true,
      error: ''
    });

    api.getContentById(contentId)
      .then(res => {
        console.log('获取内容详情成功:', res);

        let content = null;
        if (res.success && res.data) {
          content = res.data;
        } else if (res.id) {
          content = res;
        }

        if (content) {
          this.setData({
            content,
            loading: false
          });
        } else {
          this.setData({
            loading: false,
            error: '内容不存在或已被删除'
          });
        }
      })
      .catch(err => {
        console.error('获取内容详情失败:', err);
        this.setData({
          loading: false,
          error: '加载失败，请重试'
        });
      });
  },

  // 重新加载
  handleRetry() {
    if (this.data.contentId) {
      this.loadContentDetail(this.data.contentId);
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/feed/feed'
    });
  }
});
