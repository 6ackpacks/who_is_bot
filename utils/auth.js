// utils/auth.js - 用户认证管理

const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER_ID: 'user_id',
  USER_INFO: 'user_info',
  GUEST_MODE: 'guest_mode',
  GUEST_ID: 'guest_id',
  LOGIN_TIME: 'login_time'
};

/**
 * 保存登录信息
 */
function saveLoginInfo(data) {
  try {
    const { token, userId, userInfo } = data;

    wx.setStorageSync(STORAGE_KEYS.TOKEN, token);
    wx.setStorageSync(STORAGE_KEYS.USER_ID, userId);
    wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
    wx.setStorageSync(STORAGE_KEYS.LOGIN_TIME, Date.now());
    wx.removeStorageSync(STORAGE_KEYS.GUEST_MODE);

    console.log('登录信息已保存');
    return true;
  } catch (err) {
    console.error('保存登录信息失败:', err);
    return false;
  }
}

/**
 * 获取 Token
 */
function getToken() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.TOKEN) || '';
  } catch (err) {
    console.error('获取 Token 失败:', err);
    return '';
  }
}

/**
 * 获取用户 ID
 */
function getUserId() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.USER_ID) || '';
  } catch (err) {
    console.error('获取用户 ID 失败:', err);
    return '';
  }
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null;
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return null;
  }
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  const token = getToken();
  const userId = getUserId();

  if (!token || !userId) {
    return false;
  }

  // 检查登录是否过期（7天）
  const loginTime = wx.getStorageSync(STORAGE_KEYS.LOGIN_TIME);
  if (loginTime) {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (now - loginTime > sevenDays) {
      console.log('登录已过期');
      clearLoginInfo();
      return false;
    }
  }

  return true;
}

/**
 * 检查是否为游客模式
 */
function isGuestMode() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.GUEST_MODE) === true;
  } catch (err) {
    return false;
  }
}

/**
 * 设置游客模式
 */
function setGuestMode(isGuest) {
  try {
    if (isGuest) {
      wx.setStorageSync(STORAGE_KEYS.GUEST_MODE, true);
    } else {
      wx.removeStorageSync(STORAGE_KEYS.GUEST_MODE);
    }
  } catch (err) {
    console.error('设置游客模式失败:', err);
  }
}

/**
 * 清除登录信息
 */
function clearLoginInfo() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.TOKEN);
    wx.removeStorageSync(STORAGE_KEYS.USER_ID);
    wx.removeStorageSync(STORAGE_KEYS.USER_INFO);
    wx.removeStorageSync(STORAGE_KEYS.LOGIN_TIME);
    wx.removeStorageSync(STORAGE_KEYS.GUEST_MODE);

    console.log('登录信息已清除');
    return true;
  } catch (err) {
    console.error('清除登录信息失败:', err);
    return false;
  }
}

/**
 * 退出登录
 */
function logout() {
  clearLoginInfo();

  // 跳转到登录页
  wx.reLaunch({
    url: '/pages/login/login'
  });
}

/**
 * 检查登录状态，未登录则跳转到登录页
 */
function checkLogin(redirectUrl) {
  if (!isLoggedIn() && !isGuestMode()) {
    wx.showModal({
      title: '提示',
      content: '请先登录以使用完整功能',
      confirmText: '去登录',
      cancelText: '游客模式',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/login/login?redirect=${encodeURIComponent(redirectUrl || '')}`
          });
        } else {
          setGuestMode(true);
        }
      }
    });
    return false;
  }
  return true;
}

/**
 * 更新用户信息
 */
function updateUserInfo(userInfo) {
  try {
    const currentInfo = getUserInfo() || {};
    const newInfo = { ...currentInfo, ...userInfo };
    wx.setStorageSync(STORAGE_KEYS.USER_INFO, newInfo);
    return true;
  } catch (err) {
    console.error('更新用户信息失败:', err);
    return false;
  }
}

/**
 * 获取或创建游客ID
 */
function getOrCreateGuestId() {
  try {
    let guestId = wx.getStorageSync(STORAGE_KEYS.GUEST_ID);
    if (!guestId) {
      // 生成唯一的游客ID
      guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync(STORAGE_KEYS.GUEST_ID, guestId);
      console.log('创建新的游客ID:', guestId);
    }
    return guestId;
  } catch (err) {
    console.error('获取游客ID失败:', err);
    return 'guest_' + Date.now();
  }
}

/**
 * 刷新 Token
 */
function refreshToken() {
  // TODO: 实现 Token 刷新逻辑
  console.log('刷新 Token');
}

module.exports = {
  saveLoginInfo,
  getToken,
  getUserId,
  getUserInfo,
  isLoggedIn,
  isGuestMode,
  setGuestMode,
  clearLoginInfo,
  logout,
  checkLogin,
  updateUserInfo,
  refreshToken,
  getOrCreateGuestId
};
