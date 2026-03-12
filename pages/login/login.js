// pages/login/login.js
const api = require('../../utils/api.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    loading: false,
    avatarUrl: '',    // 用户选择的头像临时路径
    nickname: '',     // 用户输入的昵称
    canLogin: false   // 是否满足登录条件（昵称至少2字符）
  },

  onLoad(options) {
    // 检查是否已登录
    if (auth.isLoggedIn()) {
      // 已登录，跳转到首页
      this.redirectToHome();
    }

    // 获取重定向路径
    this.redirectUrl = options.redirect || '/pages/feed/feed';
  },

  /**
   * 用户点击 open-type="chooseAvatar" 按钮后的回调
   * 微信官方自 2022 年起的唯一有效头像获取方式
   * e.detail.avatarUrl 为临时路径，需上传到服务器持久化
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
    const nickname = e.detail.value || '';
    // 昵称至少 2 个字符才能登录（与后端 MinLength(2) 校验对齐）
    this.setData({
      nickname,
      canLogin: nickname.trim().length >= 2
    });
  },

  // 微信登录
  handleWxLogin() {
    if (this.data.loading) return;

    const nickname = this.data.nickname.trim();
    if (nickname.length < 2) {
      wx.showToast({
        title: '请先输入昵称（至少2个字符）',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({ loading: true });

    // 调用 wx.login 获取登录码，头像和昵称已在用户主动操作时获取
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          console.log('获取登录码成功:', loginRes.code);

          // 构造 userInfo，与原 wx.getUserProfile 返回格式兼容
          const userInfo = {
            nickName: nickname,
            avatarUrl: this.data.avatarUrl || ''
          };

          // 调用后端微信登录接口
          api.wxLogin(loginRes.code, userInfo)
            .then(res => {
              console.log('微信登录成功:', res);

              if (res.success && res.data) {
                console.log('========== 登录成功 ==========');
                console.log('后端返回的完整数据:', res.data);
                console.log('后端返回的头像字段:', res.data.avatar);

                // 确保头像字段存在，优先级：后端 > 本地选择 > 默认生成
                const avatar = res.data.avatar ||
                               this.data.avatarUrl ||
                               `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(res.data.nickname || 'User')}`;

                console.log('最终使用的头像:', avatar);

                // 保存用户信息和 token
                const savedUserInfo = {
                  ...res.data,
                  avatar: avatar
                };

                auth.saveLoginInfo({
                  token: res.data.accessToken,
                  userId: res.data.id,
                  userInfo: savedUserInfo
                });

                // 验证保存的数据
                const savedInfo = auth.getUserInfo();
                console.log('保存后的用户信息:', savedInfo);
                console.log('保存后的头像字段:', savedInfo?.avatar);
                console.log('================================');

                this.setData({ loading: false });

                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1500
                });

                // 延迟跳转，让用户看到成功提示
                setTimeout(() => {
                  this.redirectToHome();
                }, 1500);
              } else {
                throw new Error('登录失败');
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
        } else {
          console.error('获取登录码失败:', loginRes.errMsg);
          this.setData({ loading: false });
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('wx.login 调用失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    });
  },

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
          // 标记为游客模式
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
