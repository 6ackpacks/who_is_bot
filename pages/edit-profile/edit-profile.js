// pages/edit-profile/edit-profile.js
const api = require('../../utils/api.js');
const auth = require('../../utils/auth.js');

const RECOMMENDED_TAGS = ['AI爱好者', '吃瓜群众', '科技宅', '设计狗', '打工人', '火眼金睛', '懒人侦探', '理工男', '艺术家', '二次元'];

Page({
  data: {
    form: {
      avatar: '',
      nickname: '',
      bio: '',
      tags: []
    },
    selectedTagsMap: {},
    customTagInput: '',
    saving: false,
    recommendedTags: RECOMMENDED_TAGS
  },

  onLoad(options) {
    // 从本地缓存读取现有数据
    const userInfo = auth.getUserInfo();
    if (userInfo) {
      let tags = [];
      try {
        tags = userInfo.tags ? JSON.parse(userInfo.tags) : [];
      } catch (e) {
        tags = [];
      }
      this.setData({
        form: {
          avatar: userInfo.avatar || '',
          nickname: userInfo.nickname || '',
          bio: userInfo.bio || '',
          tags: Array.isArray(tags) ? tags : []
        }
      });
      this._updateTagsMap();
    }
  },

  // 返回
  handleBack() {
    wx.navigateBack({ delta: 1 });
  },

  // 保存
  handleSave() {
    const { nickname, bio, avatar, tags } = this.data.form;

    if (!nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    const payload = {
      nickname: nickname.trim(),
      bio: bio.trim(),
      avatar,
      tags: JSON.stringify(tags)
    };

    api.updateProfile(payload)
      .then(res => {
        if (res && res.success) {
          // 更新本地缓存 - 关键：保持 tags 为 JSON 字符串格式以匹配后端返回格式
          const existing = auth.getUserInfo() || {};
          const updated = {
            ...existing,
            nickname: nickname.trim(),
            bio: bio.trim(),
            avatar: avatar,
            tags: JSON.stringify(tags)  // 保持字符串格式
          };
          wx.setStorageSync('userInfo', updated);

          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack({ delta: 1 });
          }, 800);
        } else {
          wx.showToast({ title: res && res.message ? res.message : '保存失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ saving: false });
      });
  },

  // 更换头像
  handleChangeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ 'form.avatar': tempFilePath });
      }
    });
  },

  onNicknameInput(e) {
    this.setData({ 'form.nickname': e.detail.value });
  },

  onBioInput(e) {
    this.setData({ 'form.bio': e.detail.value });
  },

  onCustomTagInput(e) {
    this.setData({ customTagInput: e.detail.value });
  },

  // 添加自定义标签（回车确认）
  addCustomTag() {
    const tag = this.data.customTagInput.trim();
    if (!tag) return;
    const tags = this.data.form.tags;
    if (tags.length >= 8) {
      wx.showToast({ title: '最多添加8个标签', icon: 'none' });
      return;
    }
    if (tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    this.setData({
      'form.tags': [...tags, tag],
      customTagInput: ''
    });
    this._updateTagsMap();
  },

  // 移除标签
  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.form.tags];
    tags.splice(index, 1);
    this.setData({ 'form.tags': tags });
    this._updateTagsMap();
  },

  // 切换推荐标签
  toggleRecommendedTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const tags = [...this.data.form.tags];
    const idx = tags.indexOf(tag);
    if (idx > -1) {
      tags.splice(idx, 1);
    } else {
      if (tags.length >= 8) {
        wx.showToast({ title: '最多添加8个标签', icon: 'none' });
        return;
      }
      tags.push(tag);
    }
    this.setData({ 'form.tags': tags });
    this._updateTagsMap();
  },

  // 头像加载失败
  handleAvatarError() {
    const nickname = this.data.form.nickname || 'User';
    this.setData({
      'form.avatar': `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname)}`
    });
  },

  // Helper：每次 tags 变化后同步更新 selectedTagsMap
  _updateTagsMap() {
    const map = {};
    this.data.form.tags.forEach(tag => { map[tag] = true; });
    this.setData({ selectedTagsMap: map });
  }
});
