// pages/login/login.js
const api = require('../../utils/api.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    loading: false,
    // 登录主流程状态
    showProfileSetup: false, // 是否显示完善信息区块（首次登录时展示）
    // 完善信息区块使用的字段
    avatarUrl: '',    // 用户选择的头像临时路径
    nickname: '',     // 用户输入的昵称
    // 临时保存登录后返回的用户信息，供 confirmProfile 使用
    _pendingUser: null
  },

  onLoad(options) {
    // 检查是否已登录
    if (auth.isLoggedIn()) {
      this.redirectToHome();
    }

    // 获取重定向路径
    this.redirectUrl = options.redirect || '/pages/feed/feed';
  },

  // ──────────────────────────────────────────────────────────────
  // 主登录按钮：直接调微信登录，不依赖头像/昵称
  // ──────────────────────────────────────────────────────────────
  handleWxLogin() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          console.error('获取登录码失败:', loginRes.errMsg);
          this.setData({ loading: false });
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          return;
        }

        console.log('获取登录码成功:', loginRes.code);

        // 静默登录：昵称和头像传空，让后端用默认值创建用户
        api.wxLogin(loginRes.code, { nickName: '微信用户', avatarUrl: '' })
          .then(res => {
            console.log('微信登录响应:', res);

            if (!res.success || !res.data) {
              throw new Error('登录失败');
            }

            const user = res.data;

            // 确定最终头像
            const avatar = user.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.nickname || 'User')}`;

            // 保存登录信息到本地
            auth.saveLoginInfo({
              token: user.accessToken,
              userId: user.id,
              userInfo: { ...user, avatar }
            });

            this.setData({ loading: false });

            // 判断是否首次登录（nickname 为空或是后端默认值）
            const isFirstLogin = !user.nickname ||
              user.nickname === '微信用户' ||
              user.nickname === 'User' ||
              user.nickname === 'WeiXin User';

            if (isFirstLogin) {
              // 首次登录：显示完善信息区块，不跳转
              this.setData({
                showProfileSetup: true,
                _pendingUser: { ...user, avatar }
              });
            } else {
              // 老用户：直接进入主页
              wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
              setTimeout(() => this.redirectToHome(), 1500);
            }
          })
          .catch(err => {
            console.error('微信登录失败:', err);
            this.setData({ loading: false });
            wx.showToast({
              title: err.message || '登录失败，请重试',
              icon: 'none',
              duration: 2000
            });
          });
      },
      fail: (err) => {
        console.error('wx.login 调用失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    });
  },

  // ──────────────────────────────────────────────────────────────
  // 完善信息区块回调
  // ──────────────────────────────────────────────────────────────

  /**
   * 用户点击 open-type="chooseAvatar" 按钮后的回调
   * 微信官方自 2022 年起的唯一有效头像获取方式
   */
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    console.log('选择头像成功，临时路径:', avatarUrl);
    this.setData({ avatarUrl });
  },

  /**
   * 昵称输入框回调（type="nickname" 会弹出微信昵称键盘）
   */
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value || '' });
  },

  /**
   * 确认完善信息，更新后端并跳转主页
   */
  confirmProfile() {
    const { avatarUrl, nickname } = this.data;

    if (!nickname || nickname.trim().length < 2) {
      wx.showToast({ title: '昵称至少需要2个字符', icon: 'none', duration: 2000 });
      return;
    }

    const trimmedNickname = nickname.trim();

    wx.showLoading({ title: '保存中...', mask: true });

    const userId = auth.getUserId();

    // 调用更新用户接口
    api.updateProfile({ avatar: avatarUrl, nickname: trimmedNickname })
      .then(() => {
        // 更新本地存储的用户信息
        auth.updateUserInfo({
          avatar: avatarUrl || this.data._pendingUser?.avatar || '',
          nickname: trimmedNickname
        });

        wx.hideLoading();
        wx.showToast({ title: '设置成功', icon: 'success', duration: 1500 });
        setTimeout(() => this.redirectToHome(), 1500);
      })
      .catch(err => {
        wx.hideLoading();
        console.error('更新用户信息失败:', err);
        // 即使后端更新失败，也先在本地保存，不阻断流程
        auth.updateUserInfo({
          avatar: avatarUrl || this.data._pendingUser?.avatar || '',
          nickname: trimmedNickname
        });
        wx.showToast({ title: '保存成功', icon: 'success', duration: 1500 });
        setTimeout(() => this.redirectToHome(), 1500);
      });
  },

  // ──────────────────────────────────────────────────────────────
  // 工具方法
  // ──────────────────────────────────────────────────────────────

  // 跳转到首页
  redirectToHome() {
    wx.reLaunch({
      url: this.redirectUrl || '/pages/feed/feed'
    });
  },

  // 跳过登录（游客模式）
  handleSkip() {
    wx.showModal({
      title: '提示',
      content: '未登录将无法保存判定记录和查看个人统计数据，确定要跳过吗？',
      confirmText: '确定跳过',
      cancelText: '去登录',
      success: (res) => {
        if (res.confirm) {
          auth.setGuestMode(true);
          this.redirectToHome();
        }
      }
    });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '用户协议与隐私政策',
      content: '我们重视您的隐私保护，请仔细阅读《用户协议》和《隐私政策》的全部内容。',
      confirmText: '我知道了',
      showCancel: false
    });
  }
});
