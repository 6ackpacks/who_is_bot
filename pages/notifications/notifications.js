// pages/notifications/notifications.js
const auth = require('../../utils/auth.js');

Page({
  data: {
    notifications: [],
    loading: true,
    // 分段列表
    likeNotifications: [],
    replyNotifications: [],
    systemNotifications: [],
    // 筛选后的通知
    filteredNotifications: [],
    // 当前展开的分区
    activeSection: 'all'
  },

  onLoad() {
    this.loadNotifications();
  },

  onShow() {
    this.loadNotifications();
  },

  loadNotifications() {
    this.setData({ loading: true });

    // TODO: 当后端通知 API 就绪后，替换此处为真实请求
    // 目前使用空数据展示空状态界面
    // 示例结构（供后端对接参考）：
    // api.getNotifications().then(res => {
    //   const all = res.data || [];
    //   this.processNotifications(all);
    // });

    setTimeout(() => {
      this.processNotifications([]);
    }, 300);
  },

  processNotifications(list) {
    const likeNotifications = list.filter(n => n.type === 'like');
    const replyNotifications = list.filter(n => n.type === 'reply');
    const systemNotifications = list.filter(n => n.type === 'system');

    this.setData({
      notifications: list,
      likeNotifications,
      replyNotifications,
      systemNotifications,
      filteredNotifications: list,
      loading: false
    });
  },

  // 点击通知跳转到对应内容详情
  goToDetail(e) {
    const contentId = e.currentTarget.dataset.contentId;
    if (!contentId) return;

    wx.navigateTo({
      url: `/pages/detail/detail?id=${contentId}`
    });
  },

  // 切换展示分区
  switchSection(e) {
    const section = e.currentTarget.dataset.section;
    let filtered;
    if (section === 'all') {
      filtered = this.data.notifications;
    } else if (section === 'like') {
      filtered = this.data.likeNotifications;
    } else if (section === 'reply') {
      filtered = this.data.replyNotifications;
    } else {
      filtered = this.data.systemNotifications;
    }
    this.setData({ activeSection: section, filteredNotifications: filtered });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadNotifications();
    wx.stopPullDownRefresh();
  }
});
