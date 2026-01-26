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
    showAnimation: false,
    loading: false,
    judgeButtonDisabled: false // 防止重复点击
  },

  onLoad() {
    this.loadFeedData();
  },

  // 从云托管后端加载数据
  loadFeedData() {
    this.setData({ loading: true });

    wx.cloud.callContainer({
      config: {
        env: 'prod-3ge8ht6pded7ed77'
      },
      path: '/content/feed',
      header: {
        'X-WX-SERVICE': 'who-is-the-bot-api2',
        'content-type': 'application/json'
      },
      method: 'GET',
      data: {
        limit: 10
      },
      success: res => {
        console.log('获取内容成功', res);
        console.log('Raw Data Item:', res.data[0]); // 详细查看第一条数据
        console.log('Data keys:', res.data[0] ? Object.keys(res.data[0]) : 'no data'); // 查看所有字段名

        if (res.data && res.data.length > 0) {
          // 添加测试数据：使用公开可播放的视频
          const testData = [{
            id: 'test-1',
            type: 'video',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            title: '测试视频 - Big Buck Bunny',
            text: '',
            isAi: true,
            modelTag: 'Test',
            provider: '测试用户',
            deceptionRate: 50,
            explanation: '这是一个测试视频，用于验证视频播放功能是否正常。',
            comments: []
          }];

          // 将测试数据添加到返回数据的开头
          const allData = [...testData, ...res.data];

          console.log('Setting data with items:', allData.length);
          console.log('First item:', allData[0]);

          this.setData({
            items: allData,
            currentItem: allData[0],
            loading: false
          }, () => {
            console.log('Data set complete. Current item:', this.data.currentItem);
          });
        } else {
          // 如果后端没有数据，使用 mock 数据
          console.log('后端无数据，使用 mock 数据');
          this.setData({
            items: MOCK_FEED,
            currentItem: MOCK_FEED[0],
            loading: false
          });
        }
      },
      fail: err => {
        console.error('获取内容失败', err);
        // 失败时使用 mock 数据
        wx.showToast({
          title: '加载失败，使用本地数据',
          icon: 'none'
        });
        this.setData({
          items: MOCK_FEED,
          currentItem: MOCK_FEED[0],
          loading: false
        });
      }
    });
  },

  // 用户做出判断
  handleJudge(e) {
    // 防止重复点击
    if (this.data.judgeButtonDisabled) {
      return;
    }

    const choice = e.currentTarget.dataset.choice;
    const isCorrect = choice === 'ai' ? this.data.currentItem.isAi : !this.data.currentItem.isAi;

    // 禁用按钮并添加视觉反馈
    this.setData({
      judgeButtonDisabled: true,
      userChoice: choice
    });

    // 短暂延迟后显示结果，增强反馈感
    setTimeout(() => {
      this.setData({
        viewState: 'revealed',
        isCorrect: isCorrect,
        showAnimation: true
      });

      // 动画结束后重置
      setTimeout(() => {
        this.setData({
          showAnimation: false,
          judgeButtonDisabled: false
        });
      }, 300);
    }, 200);
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
      isCorrect: false,
      judgeButtonDisabled: false
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
      userChoice: null,
      judgeButtonDisabled: false
    });
  },

  // 格式化数字
  formatNumber(num) {
    return num.toLocaleString();
  },

  // 视频错误处理
  onVideoError(e) {
    console.error('Video Error Details:', e.detail);
    console.error('Video Error Message:', e.detail.errMsg);
    console.error('Current video URL:', this.data.currentItem?.url);
    wx.showToast({
      title: '视频加载失败',
      icon: 'none',
      duration: 2000
    });
  }
});
