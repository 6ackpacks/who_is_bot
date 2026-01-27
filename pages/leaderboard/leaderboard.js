// pages/leaderboard/leaderboard.js
const { MOCK_USER_RANKINGS } = require('../../utils/mockData.js');

Page({
  data: {
    users: []
  },

  onLoad() {
    this.loadLeaderboard();
  },

  // 加载排行榜数据
  loadLeaderboard() {
    // 等级映射
    const levelMap = {
      '硅谷天才': 'level-4',
      '人机杀手': 'level-3',
      '胜似人机': 'level-2',
      'AI小白': 'level-1'
    };

    // 按 bustedCount 排序并添加 levelClass
    const sortedUsers = [...MOCK_USER_RANKINGS]
      .sort((a, b) => b.bustedCount - a.bustedCount)
      .map(user => ({
        ...user,
        levelClass: levelMap[user.level] || 'level-1'
      }));

    this.setData({
      users: sortedUsers
    });
  }
});
