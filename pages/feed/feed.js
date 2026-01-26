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
    judgeButtonDisabled: false, // 防止重复点击
    videoPlaying: true // 视频播放状态
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
        console.log('Title value:', res.data[0] ? res.data[0].title : 'no title'); // 查看title值
        console.log('URL value:', res.data[0] ? res.data[0].url : 'no url'); // 查看url值

        if (res.data && res.data.length > 0) {
          // 直接使用后端返回的数据，不添加测试数据
          console.log('Setting data with items:', res.data.length);
          console.log('First item:', res.data[0]);

          this.setData({
            items: res.data,
            currentItem: res.data[0],
            loading: false
          }, () => {
            console.log('Data set complete. Current item:', this.data.currentItem);
            console.log('Current item title:', this.data.currentItem.title);
            console.log('Current item url:', this.data.currentItem.url);
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
  },

  // Swiper 切换事件
  onSwiperChange(e) {
    const newIndex = e.detail.current;
    console.log('Swiper changed to index:', newIndex);
    this.setData({
      currentIndex: newIndex,
      currentItem: this.data.items[newIndex],
      viewState: 'judging',  // 切换到新内容时重置为判定状态
      userChoice: null,
      isCorrect: false,
      videoPlaying: true  // 重置视频播放状态
    });
  },

  // 视频播放事件
  onVideoPlay() {
    this.setData({ videoPlaying: true });
  },

  // 视频暂停事件
  onVideoPause() {
    this.setData({ videoPlaying: false });
  },

  // 切换视频播放/暂停
  toggleVideoPlay(e) {
    const index = e.currentTarget.dataset.index;
    const videoContext = wx.createVideoContext(`video-${index}`, this);

    if (this.data.videoPlaying) {
      videoContext.pause();
    } else {
      videoContext.play();
    }
  }
});
