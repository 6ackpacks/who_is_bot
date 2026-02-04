// pages/feed/feed.js
const api = require('../../utils/api.js');
const theme = require('../../utils/theme.js');

Page({
  data: {
    items: [],
    displayItems: [], // 根据分类过滤后的内容
    currentIndex: 0,
    currentItem: null,
    activeCategory: 'recommended', // 'recommended' or 'hardest'
    viewState: 'judging', // 'judging', 'revealed'
    showDetails: false, // 控制详情抽屉显示
    userChoice: null, // 'ai' or 'human'
    isCorrect: false,
    showAnimation: false,
    loading: false,
    error: null, // 错误信息
    judgeButtonDisabled: false, // 防止重复点击
    videoPlaying: true, // 视频播放状态
    cardSwipeClass: '', // 卡片滑动动画类
    // 评论相关
    comments: [],
    commentInput: '',
    replyingTo: null,
    userId: null,
    guestId: null,
    currentTheme: 'dark', // 当前主题
    // 性能优化相关
    videoContextCache: {}, // 视频上下文缓存，避免重复创建
    urlConversionRequestId: 0, // URL转换请求ID，用于追踪和取消过期请求
    // 新增：评论/结果页面相关
    analysisExpanded: false, // 解析卡片展开状态
    likedComments: [], // 已点赞的评论ID列表，防止重复点赞
    // 已判断题目功能
    judgedItems: [], // 已判断的题目ID数组
    userChoices: {} // 用户选择记录对象 {contentId: 'ai' | 'human'}
  },

  onLoad() {
    this.initTheme();
    this.loadJudgedItems(); // 加载已判断记录
    this.loadFeedData();
    this.loadUserInfo();
  },

  onUnload() {
    // 清理视频上下文缓存，防止内存泄漏
    this.cleanupVideoContexts();
  },

  onShow() {
    // 每次显示页面时重新加载主题
    this.initTheme();

    // 更新自定义 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected('pages/feed/feed');
    }
  },

  // 初始化主题
  initTheme() {
    const currentTheme = theme.getTheme();
    this.setData({ currentTheme });
  },

  // 加载用户信息
  loadUserInfo() {
    const auth = require('../../utils/auth.js');
    const userId = auth.getUserId();
    const guestId = auth.getOrCreateGuestId();

    this.setData({
      userId: userId || null,
      guestId: guestId
    });

    console.log('用户信息已加载:', { userId, guestId });
  },

  // ==================== 已判断题目功能 ====================

  // 从本地存储加载已判断记录
  loadJudgedItems() {
    try {
      const judgedItems = wx.getStorageSync('judgedItems') || [];
      const userChoices = wx.getStorageSync('userChoices') || {};
      this.setData({
        judgedItems: judgedItems,
        userChoices: userChoices
      });
      console.log('已判断记录加载成功:', { judgedItems, userChoices });
    } catch (err) {
      console.error('加载已判断记录失败:', err);
    }
  },

  // 检查题目是否已判断
  isItemJudged(contentId) {
    return this.data.judgedItems.includes(contentId);
  },

  // 获取用户之前的选择
  getUserChoice(contentId) {
    return this.data.userChoices[contentId] || null;
  },

  // 保存判断记录到本地存储
  saveJudgment(contentId, choice) {
    try {
      const { judgedItems, userChoices } = this.data;

      // 添加到已判断列表（避免重复）
      if (!judgedItems.includes(contentId)) {
        judgedItems.push(contentId);
      }

      // 记录用户选择
      userChoices[contentId] = choice;

      // 保存到本地存储
      wx.setStorageSync('judgedItems', judgedItems);
      wx.setStorageSync('userChoices', userChoices);

      // 更新状态
      this.setData({
        judgedItems: judgedItems,
        userChoices: userChoices
      });

      console.log('判断记录已保存:', { contentId, choice });
    } catch (err) {
      console.error('保存判断记录失败:', err);
    }
  },

  // 查看解析（已判断题目）
  viewAnalysis() {
    // 震动反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 直接进入解析界面
    this.setData({
      viewState: 'revealed'
    });

    // 加载评论
    this.loadComments();
  },

  // 从后端加载数据
  loadFeedData() {
    this.setData({
      loading: true,
      error: null
    });

    api.getFeed({ limit: 20 })
      .then(res => {
        console.log('获取内容成功', res);

        // 处理两种响应格式：
        // 1. 直接返回数组: [{...}, {...}]
        // 2. 包装格式: {success: true, data: [{...}]}
        let items = [];

        if (Array.isArray(res)) {
          // 直接是数组
          items = res;
        } else if (res.success && res.data) {
          // 包装格式
          items = res.data;
        } else if (res.data && Array.isArray(res.data)) {
          // 云函数返回格式: {data: [...]}
          items = res.data;
        }

        if (items.length > 0) {
          // 转换云存储URL为HTTPS URL
          return this.convertCloudUrls(items);
        } else {
          throw new Error('数据为空');
        }
      })
      .then(items => {
        this.setData({
          items: items,
          loading: false
        }, () => {
          this.filterItemsByCategory();
        });
      })
      .catch(err => {
        console.error('获取内容失败', err);
        this.setData({
          loading: false,
          error: '加载失败，请下拉刷新重试'
        });

        // 显示错误提示
        wx.showToast({
          title: err.message || '加载失败',
          icon: 'none',
          duration: 2000
        });
      });
  },

  // 转换云存储URL为HTTPS URL（带竞态条件保护）
  convertCloudUrls(items) {
    return new Promise((resolve, reject) => {
      // 生成新的请求ID，用于追踪当前请求
      const currentRequestId = ++this.data.urlConversionRequestId;
      this.setData({ urlConversionRequestId: currentRequestId });

      // 收集所有需要转换的云存储URL
      const cloudFileIds = [];
      items.forEach(item => {
        if (item.url && item.url.startsWith('cloud://')) {
          cloudFileIds.push(item.url);
          console.log('发现云存储URL:', item.url, '类型:', item.type);
        }
      });

      // 如果没有云存储URL，直接返回
      if (cloudFileIds.length === 0) {
        console.log('没有需要转换的云存储URL');
        resolve(items);
        return;
      }

      console.log('需要转换的云存储URL数量:', cloudFileIds.length);
      console.log('云存储URL列表:', cloudFileIds);
      console.log('当前请求ID:', currentRequestId);

      // 批量获取临时链接
      wx.cloud.getTempFileURL({
        fileList: cloudFileIds,
        success: res => {
          // 检查请求是否仍然有效（防止竞态条件）
          if (currentRequestId !== this.data.urlConversionRequestId) {
            console.log('URL转换请求已过期，忽略结果。当前ID:', currentRequestId, '最新ID:', this.data.urlConversionRequestId);
            return; // 忽略过期的请求结果
          }

          console.log('云存储URL转换成功，结果:', res);

          // 创建URL映射表
          const urlMap = {};
          res.fileList.forEach(file => {
            if (file.status === 0) {
              // 转换成功
              urlMap[file.fileID] = file.tempFileURL;
              console.log('URL转换成功:', file.fileID, '->', file.tempFileURL);
            } else {
              console.error('URL转换失败:', file.fileID, file.errMsg);
            }
          });

          // 替换items中的URL
          items.forEach(item => {
            if (item.url && urlMap[item.url]) {
              const oldUrl = item.url;
              item.url = urlMap[item.url];
              console.log('替换URL:', oldUrl, '->', item.url);
            }
          });

          console.log('所有URL转换完成，最终items:', items);
          resolve(items);
        },
        fail: err => {
          // 检查请求是否仍然有效
          if (currentRequestId !== this.data.urlConversionRequestId) {
            console.log('URL转换请求已过期，忽略错误。当前ID:', currentRequestId, '最新ID:', this.data.urlConversionRequestId);
            return;
          }

          console.error('获取临时链接失败，错误详情:', err);

          // 显示用户友好的错误提示
          wx.showToast({
            title: '部分资源加载失败',
            icon: 'none',
            duration: 2000
          });

          // 即使失败也返回原始数据，让用户看到其他内容
          resolve(items);
        }
      });
    });
  },

  // 根据分类过滤内容
  filterItemsByCategory() {
    const { items, activeCategory } = this.data;

    // 暂时不使用分类过滤，因为数据库中没有category字段
    // 可以根据 deceptionRate 来区分难度
    let displayItems = items;

    if (activeCategory === 'hardest') {
      // 按欺骗率排序，显示最难的（欺骗率最高的）
      displayItems = [...items].sort((a, b) => b.deceptionRate - a.deceptionRate);
    } else {
      // 推荐模式：随机排序
      displayItems = [...items].sort(() => Math.random() - 0.5);
    }

    // 确保有数据
    if (displayItems.length === 0) {
      console.error('没有可显示的内容');
      this.setData({
        error: '暂无内容',
        loading: false
      });
      return;
    }

    this.setData({
      displayItems: displayItems,
      currentItem: displayItems[0],
      currentIndex: 0
    });
  },

  // 切换分类
  handleCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      viewState: 'judging',
      showDetails: false,
      userChoice: null
    }, () => {
      this.filterItemsByCategory();
    });
  },

  // 用户做出判断
  handleJudge(e) {
    // 防止重复点击
    if (this.data.judgeButtonDisabled) {
      return;
    }

    const choice = e.currentTarget.dataset.choice;
    const contentId = this.data.currentItem.id;

    // 检查是否已经判断过
    if (this.isItemJudged(contentId)) {
      // 震动反馈
      wx.vibrateShort({
        type: 'light'
      });

      // 显示提示
      wx.showToast({
        title: '您已经判断过这道题啦 👀',
        icon: 'none',
        mask: true,
        duration: 1500
      });

      // 1.5秒后进入解析界面
      setTimeout(() => {
        this.viewAnalysis();
      }, 1500);

      return;
    }

    const isCorrect = choice === 'ai' ? this.data.currentItem.isAi : !this.data.currentItem.isAi;

    // 震动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    // 卡片滑动动画
    this.triggerCardSwipeAnimation(choice);

    // 禁用按钮并添加视觉反馈
    this.setData({
      judgeButtonDisabled: true,
      userChoice: choice
    });

    // 保存判断记录
    this.saveJudgment(contentId, choice);

    // 提交判定结果到后端（改进错误处理）
    api.submitJudgment({
      contentId: this.data.currentItem.id,
      userChoice: choice,
      isCorrect: isCorrect
    }).then(res => {
      console.log('判定结果已提交', res);

      // 检查是否已经判定过
      if (!res.success && res.code === 'ALREADY_JUDGED') {
        wx.showToast({
          title: '已判定过，自动跳转',
          icon: 'none',
          duration: 1500
        });
        // 1.5秒后自动跳到下一题
        setTimeout(() => {
          this.handleNext();
        }, 1500);
        return;
      }

      // 更新当前内容的统计数据
      if (res.success && res.stats) {
        this.setData({
          'currentItem.aiPercentage': res.stats.aiPercentage,
          'currentItem.humanPercentage': res.stats.humanPercentage,
          'currentItem.correctPercentage': res.stats.correctPercentage,
          'currentItem.totalVotes': res.stats.totalVotes
        });
      } else {
        // 如果没有统计数据，生成随机占比
        this.updateRandomStats();
      }
    }).catch(err => {
      console.error('提交判定失败', err);

      // 显示用户友好的错误提示
      const errorMsg = this.getErrorMessage(err);
      if (errorMsg !== '网络异常') {
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      }

      // 即使提交失败也显示随机统计数据
      this.updateRandomStats();
    });

    // 短暂延迟后显示结果，增强反馈感
    setTimeout(() => {
      this.setData({
        viewState: 'revealed',
        isCorrect: isCorrect,
        showAnimation: true
      });

      // 加载评论
      this.loadComments();

      // 动画结束后重置
      setTimeout(() => {
        this.setData({
          showAnimation: false,
          judgeButtonDisabled: false
        });
      }, 300);
    }, 200);
  },

  // 切换详情抽屉
  toggleDetails() {
    this.setData({
      showDetails: !this.data.showDetails
    });
  },

  // 查看详情（已废弃，使用toggleDetails）
  handleViewDetails() {
    this.setData({
      showDetails: true
    });
  },

  // 下一题
  handleNext() {
    const nextIndex = (this.data.currentIndex + 1) % this.data.displayItems.length;

    // 添加卡片重置动画
    this.setData({
      cardSwipeClass: 'card-reset'
    });

    setTimeout(() => {
      this.setData({
        currentIndex: nextIndex,
        currentItem: this.data.displayItems[nextIndex],
        viewState: 'judging',
        showDetails: false,
        userChoice: null,
        isCorrect: false,
        judgeButtonDisabled: false,
        cardSwipeClass: '',
        likedComments: [] // 重置已点赞列表
      });
    }, 100);
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
    console.error('Current item type:', this.data.currentItem?.type);
    console.error('Current item full data:', this.data.currentItem);
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
      currentItem: this.data.displayItems[newIndex],
      viewState: 'judging',  // 切换到新内容时重置为判定状态
      showDetails: false,
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

  // 切换视频播放/暂停（带缓存优化）
  toggleVideoPlay(e) {
    const index = e.currentTarget.dataset.index;
    const videoId = `video-${index}`;

    // 从缓存中获取或创建视频上下文
    let videoContext = this.data.videoContextCache[videoId];
    if (!videoContext) {
      videoContext = wx.createVideoContext(videoId, this);
      // 缓存视频上下文，避免重复创建
      this.data.videoContextCache[videoId] = videoContext;
      console.log('创建并缓存视频上下文:', videoId);
    }

    if (this.data.videoPlaying) {
      videoContext.pause();
    } else {
      videoContext.play();
    }
  },

  // 清理视频上下文缓存
  cleanupVideoContexts() {
    console.log('清理视频上下文缓存');
    // 清空缓存对象
    this.data.videoContextCache = {};
  },

  // 返回主页
  goHome() {
    // 重新加载当前页面，回到判定状态
    this.setData({
      currentIndex: 0,
      currentItem: this.data.displayItems[0],
      viewState: 'judging',
      showDetails: false,
      userChoice: null,
      isCorrect: false,
      judgeButtonDisabled: false,
      comments: [],
      commentInput: '',
      replyingTo: null,
      likedComments: [] // 重置已点赞列表
    });
  },

  // 阻止事件冒泡（用于按钮和文字区域）
  preventTap(e) {
    // 阻止事件冒泡到视频容器
    return false;
  },

  // ==================== 评论功能 ====================

  // 加载评论列表（改进错误处理）
  loadComments() {
    if (!this.data.currentItem || !this.data.currentItem.id) {
      return;
    }

    api.getComments({ contentId: this.data.currentItem.id })
      .then(res => {
        console.log('获取评论成功', res);
        if (res.success && res.data) {
          // 格式化评论时间
          const timeUtil = require('../../utils/time.js');
          const comments = res.data.comments.map(comment => ({
            ...comment,
            createdAt: timeUtil.formatRelativeTime(comment.createdAt),
            replies: comment.replies ? comment.replies.map(reply => ({
              ...reply,
              createdAt: timeUtil.formatRelativeTime(reply.createdAt)
            })) : []
          }));

          this.setData({
            comments: comments
          });
        }
      })
      .catch(err => {
        console.error('获取评论失败', err);

        // 显示用户友好的错误提示
        const errorMsg = this.getErrorMessage(err);
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      });
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({
      commentInput: e.detail.value
    });
  },

  // 发表评论
  submitComment() {
    const { commentInput, currentItem, userId, guestId, replyingTo } = this.data;

    if (!commentInput.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    if (!userId && !guestId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const commentData = {
      contentId: currentItem.id,
      content: commentInput.trim()
    };

    if (userId) {
      commentData.userId = userId;
    } else {
      commentData.guestId = guestId;
    }

    if (replyingTo) {
      commentData.parentId = replyingTo.id;
    }

    api.createComment(commentData)
      .then(res => {
        console.log('评论成功', res);
        wx.showToast({
          title: '评论成功',
          icon: 'success'
        });

        this.setData({
          commentInput: '',
          replyingTo: null
        });

        // 刷新评论列表
        this.loadComments();
      })
      .catch(err => {
        console.error('评论失败', err);
        wx.showToast({
          title: err.message || '评论失败',
          icon: 'none'
        });
      });
  },

  // 点赞评论 - 防止重复点赞
  onLikeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    const { likedComments } = this.data;

    // 检查是否已经点赞过
    if (likedComments.includes(commentId)) {
      wx.showToast({
        title: '已经点赞过了',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    api.likeComment(commentId)
      .then(res => {
        console.log('点赞成功', res);

        // 添加到已点赞列表
        this.setData({
          likedComments: [...likedComments, commentId]
        });

        // 刷新评论列表
        this.loadComments();

        wx.showToast({
          title: '点赞成功',
          icon: 'success',
          duration: 1000
        });
      })
      .catch(err => {
        console.error('点赞失败', err);
        wx.showToast({
          title: '点赞失败',
          icon: 'none',
          duration: 1500
        });
      });
  },

  // 回复评论
  onReplyComment(e) {
    const comment = e.currentTarget.dataset.comment;
    this.setData({
      replyingTo: comment
    });

    // 聚焦输入框
    wx.showToast({
      title: '回复 ' + (comment.user ? comment.user.nickname : '游客'),
      icon: 'none',
      duration: 1000
    });
  },

  // 删除评论
  onDeleteComment(e) {
    const commentId = e.currentTarget.dataset.id;
    const { userId, guestId } = this.data;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          const deleteData = { commentId };
          if (userId) {
            deleteData.userId = userId;
          } else if (guestId) {
            deleteData.guestId = guestId;
          }

          api.deleteComment(deleteData)
            .then(res => {
              console.log('删除成功', res);
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });

              // 刷新评论列表
              this.loadComments();
            })
            .catch(err => {
              console.error('删除失败', err);

              // 显示用户友好的错误提示
              const errorMsg = this.getErrorMessage(err);
              wx.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
              });
            });
        }
      }
    });
  },

  // ==================== 工具函数 ====================

  // 切换解析卡片展开/收起
  toggleAnalysis() {
    this.setData({
      analysisExpanded: !this.data.analysisExpanded
    });
  },

  // Sort mode removed as per requirements

  // 更新随机统计数据（提取公共逻辑）
  updateRandomStats() {
    const randomAiPercentage = Math.floor(Math.random() * 60) + 20; // 20-80%
    this.setData({
      'currentItem.aiPercentage': randomAiPercentage,
      'currentItem.humanPercentage': 100 - randomAiPercentage,
      'currentItem.correctPercentage': Math.floor(Math.random() * 40) + 40, // 40-80%
      'currentItem.totalVotes': Math.floor(Math.random() * 500) + 100 // 100-600
    });
  },

  // 获取用户友好的错误信息
  getErrorMessage(err) {
    if (!err) {
      return '操作失败';
    }

    // 处理超时错误
    if (err.message && err.message.includes('超时')) {
      return '请求超时，请检查网络';
    }

    // 处理网络错误
    if (err.errMsg && (err.errMsg.includes('fail') || err.errMsg.includes('timeout'))) {
      return '网络异常，请稍后重试';
    }

    // 返回具体错误信息或默认信息
    return err.message || err.errMsg || '操作失败';
  },

  // 触发卡片滑动动画
  triggerCardSwipeAnimation(choice) {
    const query = this.createSelectorQuery();
    query.select('.content-card').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        const card = res[0];
        const rotation = choice === 'ai' ? -10 : 10;
        const translateX = choice === 'ai' ? -50 : 50;

        // 使用 WXSS 动画类
        this.setData({
          cardSwipeClass: choice === 'ai' ? 'card-swipe-left' : 'card-swipe-right'
        });

        // 400ms 后重置
        setTimeout(() => {
          this.setData({
            cardSwipeClass: ''
          });
        }, 400);
      }
    });
  }
});
