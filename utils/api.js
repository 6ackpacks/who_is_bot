// utils/api.js - API 服务层
const { MOCK_FEED, MOCK_USER_RANKINGS } = require('./mockData.js');
const auth = require('./auth.js');

/**
 * 环境配置
 *
 * 开发环境设置：
 * - USE_LOCAL_API: true (使用本地开发服务器)
 * - LOCAL_API_URL: 'http://YOUR_LOCAL_IP:3000' (替换为你的本地IP)
 *
 * 生产环境设置：
 * - USE_LOCAL_API: false (使用微信云托管)
 * - CLOUD_ENV: 你的云环境ID
 * - CLOUD_SERVICE: 你的云服务名称
 */
const ENV_CONFIG = {
  // 是否使用本地开发服务器（开发时设为 true，生产时设为 false）
  USE_LOCAL_API: false,  // 使用云托管

  // 本地开发服务器地址（仅在 USE_LOCAL_API = true 时使用）
  // 格式：http://YOUR_LOCAL_IP:PORT 或 http://localhost:PORT
  LOCAL_API_URL: 'http://172.16.41.100:80',

  // 微信云托管配置（生产环境使用）
  CLOUD_ENV: 'prod-3ge8ht6pded7ed77',
  CLOUD_SERVICE: 'who-is-the-bot-api2',

  // 是否使用 Mock 数据（调试用）
  USE_MOCK: false,

  // 请求超时时间（毫秒）
  TIMEOUT: 30000
};

// API 配置（向后兼容）
const API_CONFIG = {
  baseURL: ENV_CONFIG.USE_LOCAL_API ? ENV_CONFIG.LOCAL_API_URL : '',
  timeout: ENV_CONFIG.TIMEOUT,
  useMock: ENV_CONFIG.USE_MOCK,
  useLocal: ENV_CONFIG.USE_LOCAL_API,
  localURL: ENV_CONFIG.LOCAL_API_URL,
  cloudConfig: {
    env: ENV_CONFIG.CLOUD_ENV,
    service: ENV_CONFIG.CLOUD_SERVICE
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
        wx.request({
          url: `${API_CONFIG.baseURL}${url}`,
          method,
          data,
          header: {
            'content-type': 'application/json',
            ...requestHeader
          },
          timeout, // 使用内置的 timeout 参数，避免双重超时处理
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
            if (err.errMsg && err.errMsg.includes('timeout')) {
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
    loadingText = '加载中...',
    needAuth = false
  } = options;

  // 如果使用本地服务器，直接使用 wx.request
  if (API_CONFIG.useLocal) {
    return new Promise((resolve, reject) => {
      if (showLoading) {
        wx.showLoading({
          title: loadingText,
          mask: true
        });
      }

      // 构建URL，GET请求将data作为查询参数
      let url = API_CONFIG.localURL + path;
      let requestData = data;

      if (method === 'GET' && Object.keys(data).length > 0) {
        // 手动构建查询字符串（微信小程序不支持URLSearchParams）
        const params = Object.keys(data)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
          .join('&');
        url = `${url}?${params}`;
        requestData = undefined;
      }

      // 构建请求头
      const headers = {
        'content-type': 'application/json'
      };

      // 如果需要认证，添加 Authorization header
      if (needAuth) {
        const token = auth.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      wx.request({
        url,
        method,
        data: requestData,
        header: headers,
        timeout: API_CONFIG.timeout,
        success: (res) => {
          if (showLoading) wx.hideLoading();
          // 接受所有 2xx 状态码作为成功
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            console.error('本地请求失败:', res);
            wx.showToast({
              title: `请求失败: ${res.statusCode}`,
              icon: 'none'
            });
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          if (showLoading) wx.hideLoading();
          console.error('本地请求失败:', err);
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }

  // 否则使用云托管
  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      });
    }

    // 构建请求头
    const headers = {
      'X-WX-SERVICE': API_CONFIG.cloudConfig.service,
      'content-type': 'application/json'
    };

    // 如果需要认证，添加 Authorization header
    if (needAuth) {
      const token = auth.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    wx.cloud.callContainer({
      config: {
        env: API_CONFIG.cloudConfig.env
      },
      path,
      header: headers,
      method,
      data,
      success: (res) => {
        if (showLoading) wx.hideLoading();

        // 检查响应中的 success 字段
        if (res.data && res.data.success === false) {
          // 后端返回错误，拒绝 Promise
          const errorMsg = res.data.message || res.data.error || '请求失败';
          console.error('云托管请求失败:', res.data);
          reject(new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg));
        } else {
          // 成功响应
          resolve(res.data);
        }
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
 * 模拟登录
 */
function mockLogin(data) {
  return cloudRequest({
    path: '/auth/mock-login',
    method: 'POST',
    data: {
      nickname: data.nickname,
      avatar: data.avatar
    }
  });
}

/**
 * 获取用户信息
 */
function getUserInfo(uid) {
  return cloudRequest({
    path: '/auth/user',
    method: 'GET',
    data: { uid }
  });
}

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

  // 获取用户ID或游客ID
  const auth = require('./auth.js');
  const userId = auth.getUserId();
  const guestId = userId ? null : auth.getOrCreateGuestId();

  return cloudRequest({
    path: '/judgment/submit',
    method: 'POST',
    data: {
      contentId: data.contentId,
      userChoice: data.userChoice,
      isCorrect: data.isCorrect,
      userId: userId || null,
      guestId: guestId || null
      // 移除 timestamp 字段，后端不接受
    },
    showLoading: false,
    needAuth: true  // 添加认证要求
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
 * 获取用户判定历史
 */
function getUserJudgments(userId) {
  if (API_CONFIG.useMock) {
    // 返回 Mock 判定历史
    return Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          contentId: 'content_001',
          contentTitle: '这是一段关于AI的文字...',
          contentType: 'text',
          userChoice: 'ai',
          isCorrect: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          contentId: 'content_002',
          contentTitle: '一段视频内容',
          contentType: 'video',
          userChoice: 'human',
          isCorrect: false,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    });
  }

  return cloudRequest({
    path: '/judgment/history',
    method: 'GET',
    needAuth: true
  });
}

/**
 * 根据ID获取内容详情
 */
function getContentById(contentId) {
  if (API_CONFIG.useMock) {
    // 返回 Mock 内容详情
    return Promise.resolve({
      success: true,
      data: {
        id: contentId,
        title: '示例内容标题',
        type: 'text',
        content: '这是一段示例文本内容，用于展示内容详情页面的效果。',
        url: '',
        isAI: true,
        aiVotes: 65,
        humanVotes: 35,
        explanation: '这段内容具有明显的AI生成特征，包括规整的句式结构和缺乏个人情感表达。',
        createdAt: new Date().toISOString()
      }
    });
  }

  return cloudRequest({
    path: `/content/${contentId}`,
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
 * 获取用户排名
 */
function getUserRank(userId) {
  if (API_CONFIG.useMock) {
    return Promise.resolve({
      success: true,
      data: {
        rank: Math.floor(Math.random() * 200) + 1
      }
    });
  }

  // 获取排行榜数据，然后找到用户的排名
  return getLeaderboard({ limit: 100, type: 'weekly' })
    .then(res => {
      if (res.success && res.data) {
        const users = res.data;
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex !== -1) {
          return {
            success: true,
            data: {
              rank: userIndex + 1
            }
          };
        } else {
          return {
            success: true,
            data: {
              rank: '未上榜'
            }
          };
        }
      }

      return {
        success: false,
        message: '获取排名失败'
      };
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
      nickName: userInfo?.nickName,
      avatarUrl: userInfo?.avatarUrl,
      gender: userInfo?.gender,
      country: userInfo?.country,
      province: userInfo?.province,
      city: userInfo?.city
    },
    showLoading: true,
    loadingText: '登录中...'
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

/**
 * 获取评论列表
 */
function getComments(params) {
  return cloudRequest({
    path: '/comments',
    method: 'GET',
    data: {
      contentId: params.contentId
    }
  });
}

/**
 * 创建评论
 */
function createComment(data) {
  return cloudRequest({
    path: '/comments',
    method: 'POST',
    data: {
      contentId: data.contentId,
      userId: data.userId,
      guestId: data.guestId,
      content: data.content,
      parentId: data.parentId
    },
    needAuth: true  // 添加认证要求
  });
}

/**
 * 点赞评论
 */
function likeComment(commentId) {
  return cloudRequest({
    path: `/comments/${commentId}/like`,
    method: 'POST'
  });
}

/**
 * 删除评论
 */
function deleteComment(data) {
  return cloudRequest({
    path: `/comments/${data.commentId}`,
    method: 'DELETE',
    data: {
      userId: data.userId,
      guestId: data.guestId
    }
  });
}

module.exports = {
  request,
  cloudRequest,
  getFeed,
  submitJudgment,
  getUserStats,
  getUserJudgments,
  getUserRank,
  getContentById,
  getLeaderboard,
  wxLogin,
  mockLogin,
  getUserInfo,
  updateUserInfo,
  getComments,
  createComment,
  likeComment,
  deleteComment,
  API_CONFIG
};
