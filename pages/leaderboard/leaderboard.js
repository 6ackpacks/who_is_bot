// pages/leaderboard/leaderboard.js
const { MOCK_LEADERBOARD } = require('../../utils/mockData.js');

Page({
  data: {
    activeType: 'all',
    leaderboardData: [],
    filteredData: []
  },

  onLoad() {
    this.setData({
      leaderboardData: MOCK_LEADERBOARD,
      filteredData: MOCK_LEADERBOARD
    });
  },

  // 切换类型筛选
  handleTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    let filtered = this.data.leaderboardData;

    if (type !== 'all') {
      filtered = this.data.leaderboardData.filter(item => item.type === type);
    }

    // 按欺骗率排序
    filtered = filtered.sort((a, b) => b.deceptionRate - a.deceptionRate);

    this.setData({
      activeType: type,
      filteredData: filtered
    });
  },

  // 格式化数字
  formatNumber(num) {
    return num.toLocaleString();
  },

  // 获取类型中文名
  getTypeName(type) {
    const typeMap = {
      'image': '图像',
      'text': '文本',
      'video': '视频'
    };
    return typeMap[type] || type;
  }
});
