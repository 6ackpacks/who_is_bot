// pages/profile/profile.js
const app = getApp();
const auth = require('../../utils/auth.js');
const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {
      nickname: 'Cyber_Detective',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser',
      bio: '',
      tags: []
    },
    isLoggedIn: false,
    activeTab: 'judgments', // 当前激活的标签页
    tabIndicatorLeft: 0, // 标签页指示器位置（百分比）
    tabIndicatorWidth: 33.33, // 标签页指示器宽度（百分比）

    // 用户排名
    userRank: null,

    // 判断统计
    judgmentStats: {
      total: 0,
      correct: 0,
      accuracy: 0
    },

    // 评论统计
    commentStats: {
      totalComments: 0,
      totalLikes: 0
    },

    // 关注数据（mock数据）
    followingCount: 7,
    followersCount: 11,

    // 判定记录
    judgments: [],

    // 评论列表
    comments: [],

    // 编辑资料弹窗
    showEditModal: false,
    editForm: {
      avatar: '',
      nickname: '',
      bio: ''
    },

    // 申请提交表单
    contentTypes: [
      { value: 'text', label: '文本' },
      { value: 'image', label: '图片' },
      { value: 'video', label: '视频' }
    ],
    submitForm: {
      typeIndex: 0,
      url: '',
      description: ''
    }
  },

  onLoad() {
    this.checkLoginAndLoadData();
  },

  onShow() {
    // 页面显示时滚动到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });

    // 每次显示页面时检查登录状态
    this.checkLoginAndLoadData();

    // 更新自定义 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected('pages/profile/profile');
    }
  },

  // 检查登录状态并加载数据
  checkLoginAndLoadData() {
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      // 已登录，加载用户数据
      this.loadUserData();
      this.loadUserRank();
      // TODO: 暂时禁用评论统计API调用，等待后端路由修复
      // this.loadCommentStats();
      // 使用默认值
      this.setData({
        commentStats: { totalComments: 0, totalLikes: 0 }
      });
      this.loadJudgments();
      this.loadComments();
    } else {
      // 未登录，显示提示
      const guestAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest';
      this.setData({
        userInfo: {
          nickname: '未登录',
          avatar: guestAvatar,
          bio: '登录后查看更多功能',
          tags: []
        },
        userRank: null,
        commentStats: { totalComments: 0, totalLikes: 0 },
        judgments: [],
        comments: []
      });
    }
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = auth.getUserInfo();
    const userId = auth.getUserId();

    if (userInfo) {
      // 先用本地缓存信息快速渲染
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userInfo.nickname || 'User')}`;
      const avatar = userInfo.avatar || defaultAvatar;

      this.setData({
        userInfo: {
          nickname: userInfo.nickname || 'Cyber_Detective',
          avatar: avatar,
          bio: userInfo.bio || '',
          tags: (() => { try { return userInfo.tags ? JSON.parse(userInfo.tags) : []; } catch(e) { return []; } })()
        }
      });
    }

    // 从后端获取实时统计数据（totalJudged、accuracy 等）
    if (userId) {
      api.getUserProfile(userId)
        .then(res => {
          if (res && res.success && res.data) {
            const profile = res.data;

            // 用后端返回的头像和昵称覆盖（如果有）
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.nickname || 'User')}`;
            const avatar = profile.avatar || defaultAvatar;

            let parsedTags = [];
            try { parsedTags = profile.tags ? JSON.parse(profile.tags) : []; } catch(e) {}
            this.setData({
              userInfo: {
                nickname: profile.nickname || this.data.userInfo.nickname,
                avatar: avatar,
                bio: profile.bio || this.data.userInfo.bio || '',
                tags: parsedTags
              },
              judgmentStats: {
                total: profile.totalJudged || 0,
                correct: Math.round(((profile.accuracy || 0) * (profile.totalJudged || 0)) / 100),
                accuracy: Math.round((profile.accuracy || 0) * 10) / 10
              },
              commentStats: {
                totalComments: profile.totalComments || 0,
                totalLikes: profile.totalLikes || 0
              }
            });
          }
        })
        .catch(() => {
          // 静默处理，已用本地缓存数据显示
        });
    }
  },

  // 加载用户排名
  loadUserRank() {
    const userId = auth.getUserId();
    if (!userId) return;

    api.getUserRank(userId)
      .then(res => {
        if (res.success && res.data) {
          // 处理数字排名和字符串"未上榜"
          const rank = res.data.rank;
          if (typeof rank === 'number' && rank > 0) {
            this.setData({ userRank: rank });
          } else if (typeof rank === 'string') {
            this.setData({ userRank: rank });
          } else {
            this.setData({ userRank: null });
          }
        } else {
          this.setData({ userRank: null });
        }
      })
      .catch(err => {
        // 静默处理错误，不显示console.error
        this.setData({ userRank: null });
      });
  },

  // 加载评论统计
  loadCommentStats() {
    const userId = auth.getUserId();
    if (!userId) return;

    api.getUserCommentStats(userId)
      .then(res => {
        if (res.success && res.data) {
          this.setData({
            commentStats: {
              totalComments: res.data.totalComments || 0,
              totalLikes: res.data.totalLikes || 0
            }
          });
        }
      })
      .catch(err => {
        // 静默处理错误，不显示console.error
        // 设置默认值，避免显示错误
        this.setData({
          commentStats: {
            totalComments: 0,
            totalLikes: 0
          }
        });
      });
  },

  // 加载判定记录
  loadJudgments() {
    const userId = auth.getUserId();
    if (!userId) return;

    api.getUserJudgments(userId)
      .then(res => {
        // 后端 GET /judgment/history 直接返回数组
        const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);

        if (rawList.length > 0) {
          const judgments = rawList.map(item => {
            const validTypes = ['text', 'image', 'video'];
            const contentType = validTypes.includes(item.contentType) ? item.contentType : 'text';
            const title = item.contentTitle || '未知内容';

            // 缩略图逻辑：
            // - 文字：textSnippet 显示文字预览，thumbnail 不使用
            // - 图片：thumbnail 使用 contentUrl（实际图片地址）
            // - 视频：使用本地占位图 /images/video-thumb.png
            const thumbnail = contentType === 'image' ? (item.contentUrl || '') : '';
            const textSnippet = contentType === 'text' ? title : '';

            return {
              id: item.id,
              contentId: item.contentId,
              contentType: contentType,
              isCorrect: item.isCorrect,
              time: this.formatTime(item.createdAt),
              title: title,
              thumbnail: thumbnail,
              textSnippet: textSnippet
            };
          });
          this.setData({ judgments });

          // 仅当 profile 接口未提供统计时用列表数据兜底
          if (this.data.judgmentStats.total === 0) {
            const total = judgments.length;
            const correct = judgments.filter(j => j.isCorrect).length;
            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
            this.setData({
              judgmentStats: { total, correct, accuracy }
            });
          }
        }
      })
      .catch(() => {
        this.setData({
          judgments: [],
        });
      });
  },

  // 加载评论列表
  loadComments() {
    const userId = auth.getUserId();
    if (!userId) return;

    api.getComments({ userId })
      .then(res => {
        if (res.success && res.data && Array.isArray(res.data.comments)) {
          const comments = res.data.comments.map(item => ({
            id: item.id,
            contentId: item.contentId,
            content: item.content,
            likes: item.likes || 0,
            time: this.formatTime(item.createdAt),
            // 后端返回 contentItem 对象包含关联内容信息
            contentTitle: (item.contentItem && item.contentItem.title) || '未知内容'
          }));
          this.setData({ comments });
        }
      })
      .catch(() => {
        this.setData({ comments: [] });
      });
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '未知时间';

    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;

    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    const tabIndex = tab === 'judgments' ? 0 : tab === 'comments' ? 1 : 2;
    const tabIndicatorLeft = tabIndex * 33.33;

    this.setData({
      activeTab: tab,
      tabIndicatorLeft: tabIndicatorLeft,
      tabIndicatorWidth: 33.33
    });
  },

  // 统计数据点击事件
  handleStatClick(e) {
    const type = e.currentTarget.dataset.type;

    if (type === 'judgments') {
      // 切换到判定记录标签页
      this.setData({
        activeTab: 'judgments',
        tabIndicatorLeft: 0,
        tabIndicatorWidth: 33.33
      });
    } else if (type === 'accuracy') {
      wx.showToast({
        title: '正确率详情功能开发中',
        icon: 'none'
      });
    } else if (type === 'liked-comments') {
      // 切换到评论标签页
      this.setData({
        activeTab: 'comments',
        tabIndicatorLeft: 33.33,
        tabIndicatorWidth: 33.33
      });
    }
  },

  // 跳转到排行榜
  goToLeaderboard() {
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    });
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 登录/编辑资料
  handleEditProfile() {
    if (!auth.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/profile/profile'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    });
  },

  // 关闭编辑资料弹窗
  closeEditModal() {
    this.setData({
      showEditModal: false
    });
  },

  // 更换头像
  handleChangeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // TODO: 上传到服务器
        this.setData({
          'editForm.avatar': tempFilePath
        });
        wx.showToast({
          title: '头像已选择',
          icon: 'success'
        });
      }
    });
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({
      'editForm.nickname': e.detail.value
    });
  },

  // 简介输入
  onBioInput(e) {
    this.setData({
      'editForm.bio': e.detail.value
    });
  },

  // 保存资料
  handleSaveProfile() {
    const { nickname, bio, avatar } = this.data.editForm;

    if (!nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    // 更新本地数据
    const userInfo = auth.getUserInfo();
    const updatedUserInfo = {
      ...userInfo,
      nickname: nickname.trim(),
      bio: bio.trim(),
      avatar: avatar
    };

    // 保存到本地存储
    wx.setStorageSync('userInfo', updatedUserInfo);

    // 更新页面数据
    this.setData({
      userInfo: updatedUserInfo,
      showEditModal: false
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    // TODO: 同步到服务器
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将无法保存判定记录，确定要退出吗？',
      confirmText: '确定退出',
      confirmColor: '#D97757',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          this.checkLoginAndLoadData();
        }
      }
    });
  },

  // 内容类型选择
  onContentTypeChange(e) {
    this.setData({
      'submitForm.typeIndex': e.detail.value
    });
  },

  // URL 输入
  onUrlInput(e) {
    this.setData({
      'submitForm.url': e.detail.value
    });
  },

  // 说明输入
  onDescriptionInput(e) {
    this.setData({
      'submitForm.description': e.detail.value
    });
  },

  // 提交内容申请
  handleSubmitContent() {
    if (!auth.isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再提交申请',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login?redirect=/pages/profile/profile'
            });
          }
        }
      });
      return;
    }

    const { typeIndex, url, description } = this.data.submitForm;
    const contentType = this.data.contentTypes[typeIndex].value;

    // 验证表单
    if (!url.trim()) {
      wx.showToast({
        title: '请输入内容链接',
        icon: 'none'
      });
      return;
    }

    if (!description.trim()) {
      wx.showToast({
        title: '请输入说明',
        icon: 'none'
      });
      return;
    }

    // 显示提交成功提示
    wx.showModal({
      title: '提交成功',
      content: '感谢您的提交！我们会尽快审核您的内容。',
      showCancel: false,
      success: () => {
        // 清空表单
        this.setData({
          'submitForm.typeIndex': 0,
          'submitForm.url': '',
          'submitForm.description': ''
        });
      }
    });

    // TODO: 实际提交到后端
    console.log('提交内容申请:', {
      contentType,
      url,
      description
    });
  },

  // 页面分享配置
  onShareAppMessage() {
    const nickname = this.data.userInfo.nickname;
    return {
      title: `我是${nickname}，一起来找人机吧！`,
      path: '/pages/feed/feed',
      imageUrl: this.data.userInfo.avatar
    };
  },

  // 头像加载错误处理
  handleAvatarError(e) {
    console.log('========== 个人主页头像加载失败 ==========');
    console.log('错误事件:', e);
    console.log('当前头像 URL:', this.data.userInfo.avatar);

    const nickname = this.data.userInfo.nickname || 'User';
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname)}`;

    console.log('切换到默认头像:', defaultAvatar);
    console.log('========================================');

    this.setData({
      'userInfo.avatar': defaultAvatar
    });
  }
});
