// utils/api.js - API 服务层
const { MOCK_FEED, MOCK_USER_RANKINGS } = require('./mockData.js');
const auth = require('./auth.js');

// API 配置
const API_CONFIG = {
  baseURL: 'https://your-api-domain.com',
  timeout: 10000, // 10秒超时
  useMock: true, // 开发模式使用 Mock 数据
  cloudConfig: {
    env: 'prod-3ge8ht6pded7ed77',
    service: 'who-is-the-bot-api2'
  }
};

/**
 * 统一的网络请求方法
 * @param {Object} options - 请求配置
 * @returns {Promise} 请求结果
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    timeout = API_CONFIG.timeout,
    showLoading = false,
    loadingText = '加载中...',
    needAuth = false // 是否需要认证
  } = options;

  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      });
    }

    // 如果需要认证，添加 Token
    const requestHeader = { ...header };
    if (needAuth) {
      const token = auth.getToken();
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`;
      }
    }

    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          if (showLoading) wx.hideLoading();
          wx.showToast({
            title: '网络未连接',
            icon: 'none',
            duration: 2000
          });
          reject(new Error('网络未连接'));
          return;
        }

        // 发起请求
        const requestTask = wx.request({
          url: `${API_CONFIG.baseURL}${url}`,
          method,
          data,
          header: {
            'content-type': 'application/json',
            ...requestHeader
          },
          timeout,
          success: (res) => {
            if (showLoading) wx.hideLoading();

            // 处理响应
            if (res.statusCode === 200) {
              resolve(res.data);
            } else if (res.statusCode === 401) {
              // 未授权，清除登录信息并跳转到登录页
              auth.clearLoginInfo();
              wx.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              });
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/login/login'
                });
              }, 1500);
              reject(new Error('未授权'));
            } else if (res.statusCode === 404) {
              wx.showToast({
                title: '请求的资源不存在',
                icon: 'none'
              });
              reject(new Error('资源不存在'));
            } else {
              wx.showToast({
                title: '请求失败',
                icon: 'none'
              });
              reject(new Error(`请求失败: ${res.statusCode}`));
            }
          },
          fail: (err) => {
            if (showLoading) wx.hideLoading();

            console.error('请求失败:', err);

            // 超时处理
            if (err.errMsg.includes('timeout')) {
              wx.showToast({
                title: '请求超时，请重试',
                icon: 'none',
                duration: 2000
              });
              reject(new Error('请求超时'));
            } else {
              wx.showToast({
                title: '网络请求失败',
                icon: 'none',
                duration: 2000
              });
              reject(err);
            }
          }
        });

        // 设置超时
        setTimeout(() => {
          requestTask.abort();
        }, timeout);
      },
      fail: () => {
        if (showLoading) wx.hideLoading();
        reject(new Error('获取网络状态失败'));
      }
    });
  });
}

/**
 * 云托管请求方法
 */
function cloudRequest(options) {
  const {
    path,
    method = 'GET',
    data = {},
    showLoading = false,
    loadingText = '加载中...'
  } = options;

  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      });
    }

    wx.cloud.callContainer({
      config: {
        env: API_CONFIG.cloudConfig.env
      },
      path,
      header: {
        'X-WX-SERVICE': API_CONFIG.cloudConfig.service,
        'content-type': 'application/json'
      },
      method,
      data,
      success: (res) => {
        if (showLoading) wx.hideLoading();
        resolve(res.data);
      },
      fail: (err) => {
        if (showLoading) wx.hideLoading();
        console.error('云托管请求失败:', err);
        reject(err);
      }
    });
  });
}

// ==================== API 接口 ====================

/**
 * 获取内容列表
 */
function getFeed(params = {}) {
  if (API_CONFIG.useMock) {
    // 使用 Mock 数据
    return Promise.resolve({
      success: true,
      data: MOCK_FEED,
      total: MOCK_FEED.length
    });
  }

  return cloudRequest({
    path: '/content/feed',
    method: 'GET',
    data: {
      limit: params.limit || 10,
      offset: params.offset || 0,
      category: params.category
    }
  }).catch(err => {
    console.error('获取内容失败，使用 Mock 数据:', err);
    return {
      success: true,
      data: MOCK_FEED,
      total: MOCK_FEED.length
    };
  });
}

/**
 * 提交判定结果
 */
function submitJudgment(data) {
  if (API_CONFIG.useMock) {
    // Mock 模式直接返回成功
    return Promise.resolve({
      success: true,
      message: '判定已记录'
    });
  }

  return cloudRequest({
    path: '/judgment/submit',
    method: 'POST',
    data: {
      contentId: data.contentId,
      userChoice: data.userChoice,
      isCorrect: data.isCorrect,
      timestamp: Date.now()
    },
    showLoading: false
  });
}

/**
 * 获取用户统计数据
 */
function getUserStats(userId) {
  if (API_CONFIG.useMock) {
    // 返回 Mock 统计数据
    return Promise.resolve({
      success: true,
      data: {
        totalJudged: 850,
        accuracy: 89.4,
        streak: 12,
        maxStreak: 45,
        level: 3,
        levelName: '人机杀手'
      }
    });
  }

  return cloudRequest({
    path: `/user/${userId}/stats`,
    method: 'GET'
  });
}

/**
 * 获取排行榜
 */
function getLeaderboard(params = {}) {
  if (API_CONFIG.useMock) {
    return Promise.resolve({
      success: true,
      data: MOCK_USER_RANKINGS
    });
  }

  return cloudRequest({
    path: '/leaderboard',
    method: 'GET',
    data: {
      limit: params.limit || 50,
      type: params.type || 'weekly'
    }
  });
}

/**
 * 微信登录
 */
function wxLogin(code, userInfo) {
  if (API_CONFIG.useMock) {
    // Mock 模式返回模拟数据
    return Promise.resolve({
      success: true,
      data: {
        token: 'mock_token_' + Date.now(),
        userId: 'mock_user_' + Date.now(),
        userInfo: {
          nickname: userInfo?.nickName || 'Cyber_Detective',
          avatar: userInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser',
          level: 1,
          levelName: 'AI小白'
        }
      },
      message: '登录成功'
    });
  }

  return cloudRequest({
    path: '/auth/wx-login',
    method: 'POST',
    data: {
      code,
      userInfo: {
        nickName: userInfo?.nickName,
        avatarUrl: userInfo?.avatarUrl,
        gender: userInfo?.gender,
        country: userInfo?.country,
        province: userInfo?.province,
        city: userInfo?.city
      }
    },
    showLoading: true,
    loadingText: '登录中...'
  });
}

/**
 * 获取用户信息
 */
function getUserInfo(userId) {
  if (API_CONFIG.useMock) {
    return Promise.resolve({
      success: true,
      data: {
        id: userId,
        nickname: 'Cyber_Detective',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUser',
        level: 3,
        levelName: '人机杀手'
      }
    });
  }

  return cloudRequest({
    path: `/user/${userId}`,
    method: 'GET'
  });
}

/**
 * 更新用户信息
 */
function updateUserInfo(userId, data) {
  return cloudRequest({
    path: `/user/${userId}`,
    method: 'PUT',
    data,
    showLoading: true,
    loadingText: '保存中...'
  });
}

module.exports = {
  request,
  cloudRequest,
  getFeed,
  submitJudgment,
  getUserStats,
  getLeaderboard,
  wxLogin,
  getUserInfo,
  updateUserInfo,
  API_CONFIG
};
