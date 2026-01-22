// pages/feed/feed.js
const { MOCK_FEED } = require('../../utils/mockData.js');

Page({
  data: {
    items: [],
    currentIndex: 0,
    currentItem: null,
    viewState: 'judging', // 'judging', 'revealed', 'details'
    userChoice: null, // 'ai' or 'human'
    isCorrect: false,
    showAnimation: false
  },

  onLoad() {
    this.setData({
      items: MOCK_FEED,
      currentItem: MOCK_FEED[0]
    });
  },

  // 用户做出判断
  handleJudge(e) {
    const choice = e.currentTarget.dataset.choice;
    const isCorrect = choice === 'ai' ? this.data.currentItem.isAi : !this.data.currentItem.isAi;

    this.setData({
      userChoice: choice,
      viewState: 'revealed',
      isCorrect: isCorrect,
      showAnimation: true
    });

    // 动画结束后重置
    setTimeout(() => {
      this.setData({ showAnimation: false });
    }, 300);
  },

  // 查看详情
  handleViewDetails() {
    this.setData({
      viewState: 'details'
    });
  },

  // 下一题
  handleNext() {
    const nextIndex = (this.data.currentIndex + 1) % this.data.items.length;
    this.setData({
      currentIndex: nextIndex,
      currentItem: this.data.items[nextIndex],
      viewState: 'judging',
      userChoice: null,
      isCorrect: false
    });
  },

  // 返回到结果页
  handleBackToResult() {
    this.setData({
      viewState: 'revealed'
    });
  },

  // 返回到判定页
  handleBackToJudging() {
    this.setData({
      viewState: 'judging',
      userChoice: null
    });
  },

  // 格式化数字
  formatNumber(num) {
    return num.toLocaleString();
  }
});
