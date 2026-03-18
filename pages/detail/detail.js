// pages/detail/detail.js
const api = require('../../utils/api.js');
const theme = require('../../utils/theme.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    contentId: null,
    content: null,
    loading: true,
    error: '',
    currentTheme: 'dark',

    // Judgment result state
    userChoice: null,   // 'ai' | 'human' | null
    isCorrect: false,

    // Comments
    comments: [],
    commentInput: '',
    replyingTo: null,
    userId: null,
    guestId: null,
    likedComments: [],

    // Stats animation
    displayPercentage: 0,
    animationTimer: null,

    // Analysis card
    analysisExpanded: true
  },

  onLoad(options) {
    this.initTheme();
    this.loadUserInfo();

    // Support both `contentId` (from profile) and legacy `id` param
    const contentId = options.contentId || options.id;
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

  onUnload() {
    if (this.data.animationTimer) {
      clearTimeout(this.data.animationTimer);
    }
  },

  onShow() {
    this.initTheme();
  },

  initTheme() {
    const currentTheme = theme.getTheme();
    this.setData({ currentTheme });
  },

  loadUserInfo() {
    const userId = auth.getUserId();
    const guestId = auth.getOrCreateGuestId();
    this.setData({
      userId: userId || null,
      guestId: guestId
    });
  },

  // Load content detail and determine the user's historical judgment result
  loadContentDetail(contentId) {
    this.setData({ loading: true, error: '' });

    // Read historical choice from local storage before the API call
    const userChoices = wx.getStorageSync('userChoices') || {};
    const userChoice = userChoices[contentId] || null;

    api.getContentById(contentId)
      .then(res => {
        let content = null;
        if (res && res.success && res.data) {
          content = res.data;
        } else if (res && res.id) {
          content = res;
        }

        if (!content) {
          this.setData({ loading: false, error: '内容不存在或已被删除' });
          return;
        }

        // Normalise isAi field (API may return isAi or isAI)
        const isAi = content.isAi !== undefined ? content.isAi : content.isAI;
        content.isAi = isAi;

        // Determine correctness
        const isCorrect = userChoice
          ? (userChoice === 'ai' ? isAi : !isAi)
          : false;

        // Compute display percentages if the API didn't return them
        if (content.displayAiPercent === undefined || content.displayAiPercent === null) {
          const aiVotes = content.aiVotes || 0;
          const humanVotes = content.humanVotes || 0;
          const total = aiVotes + humanVotes;
          content.displayAiPercent = total > 0 ? Math.round((aiVotes / total) * 100) : 0;
          content.displayHumanPercent = 100 - content.displayAiPercent;
          content.displayTotalVotes = total;
        }

        if (content.displayTotalVotes === undefined || content.displayTotalVotes === null) {
          content.displayTotalVotes = content.totalVotes || 0;
        }

        this.setData({
          content,
          loading: false,
          userChoice,
          isCorrect,
          displayPercentage: 0
        });

        this.loadComments();
        this.animatePercentage(content.displayAiPercent || 0);
      })
      .catch(err => {
        console.error('获取内容详情失败:', err);
        this.setData({ loading: false, error: '加载失败，请重试' });
      });
  },

  // Retry after error
  handleRetry() {
    if (this.data.contentId) {
      this.loadContentDetail(this.data.contentId);
    }
  },

  // Back button - navigateBack is available because this is a regular page
  handleBack() {
    wx.navigateBack();
  },

  // ==================== Percentage animation ====================

  animatePercentage(targetValue) {
    if (this.data.animationTimer) {
      clearTimeout(this.data.animationTimer);
    }

    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(targetValue * easeProgress);

      this.setData({ displayPercentage: currentValue });

      if (progress < 1) {
        const timerId = setTimeout(animate, 16);
        this.setData({ animationTimer: timerId });
      } else {
        this.setData({ animationTimer: null });
      }
    };

    const timerId = setTimeout(animate, 16);
    this.setData({ animationTimer: timerId });
  },

  // ==================== Analysis card toggle ====================

  toggleAnalysis() {
    this.setData({ analysisExpanded: !this.data.analysisExpanded });
  },

  // ==================== Comments ====================

  loadComments() {
    const { content } = this.data;
    if (!content || !content.id) return;

    api.getComments({ contentId: content.id })
      .then(res => {
        if (res.success && res.data) {
          const timeUtil = require('../../utils/time.js');
          const comments = res.data.comments.map(comment => ({
            ...comment,
            createdAt: timeUtil.formatRelativeTime(comment.createdAt),
            replies: comment.replies ? comment.replies.map(reply => ({
              ...reply,
              createdAt: timeUtil.formatRelativeTime(reply.createdAt)
            })) : []
          }));
          this.setData({ comments });
        }
      })
      .catch(err => {
        console.error('获取评论失败:', err);
      });
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },

  submitComment() {
    const { commentInput, content, userId, guestId, replyingTo } = this.data;

    if (!commentInput.trim()) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    if (!userId && !guestId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!content || !content.id) {
      wx.showToast({ title: '内容加载中，请稍后再试', icon: 'none' });
      return;
    }

    const commentData = {
      contentId: content.id,
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
      .then(() => {
        wx.showToast({ title: '评论成功', icon: 'success' });
        this.setData({ commentInput: '', replyingTo: null });
        this.loadComments();
      })
      .catch(err => {
        wx.showToast({ title: err.message || '评论失败', icon: 'none' });
      });
  },

  onLikeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    const { likedComments } = this.data;

    if (likedComments.includes(commentId)) {
      wx.showToast({ title: '已经点赞过了', icon: 'none', duration: 1500 });
      return;
    }

    api.likeComment(commentId)
      .then(() => {
        this.setData({ likedComments: [...likedComments, commentId] });
        this.loadComments();
        wx.showToast({ title: '点赞成功', icon: 'success', duration: 1000 });
      })
      .catch(() => {
        wx.showToast({ title: '点赞失败', icon: 'none', duration: 1500 });
      });
  },

  onReplyComment(e) {
    const comment = e.currentTarget.dataset.comment;
    this.setData({ replyingTo: comment });
    wx.showToast({
      title: '回复 ' + (comment.user ? comment.user.nickname : '游客'),
      icon: 'none',
      duration: 1000
    });
  },

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
            .then(() => {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.loadComments();
            })
            .catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  handleAvatarError(e) {
    const index = e.currentTarget.dataset.index;
    if (index !== undefined && this.data.comments[index]) {
      const comment = this.data.comments[index];
      const nickname = comment.user && comment.user.nickname ? comment.user.nickname : 'User';
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname)}`;
      this.setData({ [`comments[${index}].user.avatar`]: defaultAvatar });
    }
  }
});
