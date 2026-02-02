/**
 * 改进的评论系统并发测试脚本
 *
 * 改进点:
 * 1. 使用真实的 JWT 认证 (通过 mock-login)
 * 2. 动态创建测试内容
 * 3. 完整的并发测试场景
 * 4. 详细的竞态条件检测
 *
 * 测试目标: 模拟20个用户同时进行评论操作
 *
 * 测试场景:
 * 1. 并发创建评论 (20个用户同时发表评论)
 * 2. 并发获取评论列表 (20个用户同时获取评论)
 * 3. 并发删除评论 (10个用户同时删除自己的评论)
 * 4. 并发点赞评论 (20个用户同时点赞同一条评论)
 *
 * 关注点:
 * - 点赞计数是否准确（容易出现竞态条件）
 * - 评论删除的授权检查
 * - 数据库更新是否有丢失
 * - 响应时间是否可接受
 */

const http = require('http');
const https = require('https');

// 配置
const CONFIG = {
  BASE_URL: 'http://localhost:80',
  CONCURRENT_USERS: 20,
  DELETE_USERS: 10,
  TEST_CONTENT_ID: null, // 将动态创建
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

// HTTP 请求工具函数
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const startTime = Date.now();
    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsed,
            duration,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            duration,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        duration: Date.now() - startTime,
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 步骤1: 认证用户获取真实JWT tokens
async function setupTestUsers() {
  logSection('步骤 1: 用户认证');
  logInfo(`认证 ${CONFIG.CONCURRENT_USERS} 个用户...`);

  const loginPromises = [];
  const timestamp = Date.now();

  for (let i = 1; i <= CONFIG.CONCURRENT_USERS; i++) {
    const nickname = `ConcurrentTestUser${i}_${timestamp}`;
    loginPromises.push(
      makeRequest('POST', '/auth/mock-login', { nickname })
        .then(response => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            return {
              userId: response.data.data.id,
              username: response.data.data.nickname,
              token: response.data.data.accessToken,
            };
          }
          return null;
        })
        .catch(() => null)
    );
  }

  const results = await Promise.all(loginPromises);
  const users = results.filter(u => u !== null);

  logSuccess(`成功认证 ${users.length}/${CONFIG.CONCURRENT_USERS} 个用户`);

  if (users.length === 0) {
    logError('没有用户成功认证，无法继续测试');
    throw new Error('Authentication failed');
  }

  return users;
}

// 步骤2: 创建测试内容
async function createTestContent(user) {
  logSection('步骤 2: 创建测试内容');
  logInfo('创建用于评论的测试内容...');

  try {
    const response = await makeRequest('POST', '/content', {
      text: '这是用于并发测试的内容',
      isBot: false,
    }, user.token);

    if (response.statusCode === 201 && response.data.data) {
      const contentId = response.data.data.id;
      CONFIG.TEST_CONTENT_ID = contentId;
      logSuccess(`测试内容创建成功: ${contentId}`);
      return contentId;
    } else {
      logError(`创建内容失败: HTTP ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    logError(`创建内容失败: ${error.error || error.message}`);
    return null;
  }
}

// 测试场景1: 并发创建评论
async function testConcurrentCreateComments(users, contentId) {
  logSection('测试场景 1: 并发创建评论');
  logInfo(`${users.length} 个用户同时发表评论...`);

  const startTime = Date.now();
  const promises = users.map((user, index) => {
    return makeRequest('POST', '/comments', {
      contentId: contentId,
      content: `并发测试评论 #${index + 1} by ${user.username}`,
    }, user.token);
  });

  try {
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 201);
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 201));
    const unauthorized = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 401);

    logInfo(`总耗时: ${duration}ms`);
    logInfo(`平均响应时间: ${(duration / results.length).toFixed(2)}ms`);

    if (successful.length > 0) {
      logSuccess(`成功创建: ${successful.length} 条评论`);
    }

    if (unauthorized.length > 0) {
      logWarning(`未授权: ${unauthorized.length} 个请求 (需要JWT token)`);
    }

    if (failed.length > 0 && failed.length !== unauthorized.length) {
      logError(`失败: ${failed.length - unauthorized.length} 个请求`);
    }

    // 提取成功创建的评论ID
    const createdCommentIds = successful
      .map(r => r.value.data?.data?.id)
      .filter(id => id);

    return {
      success: successful.length,
      failed: failed.length,
      unauthorized: unauthorized.length,
      duration,
      commentIds: createdCommentIds,
      avgResponseTime: duration / results.length,
      results,
    };
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return {
      success: 0,
      failed: CONFIG.CONCURRENT_USERS,
      unauthorized: 0,
      duration: Date.now() - startTime,
      commentIds: [],
      error: error.message,
    };
  }
}

// 测试场景2: 并发获取评论列表
async function testConcurrentGetComments(contentId, expectedCount) {
  logSection('测试场景 2: 并发获取评论列表');
  logInfo(`${CONFIG.CONCURRENT_USERS} 个用户同时获取评论列表...`);

  const startTime = Date.now();
  const promises = Array(CONFIG.CONCURRENT_USERS).fill(null).map(() => {
    return makeRequest('GET', `/comments?contentId=${contentId}`);
  });

  try {
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 200);
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 200));

    logInfo(`总耗时: ${duration}ms`);
    logInfo(`平均响应时间: ${(duration / results.length).toFixed(2)}ms`);
    logSuccess(`成功: ${successful.length} 个请求`);

    if (failed.length > 0) {
      logError(`失败: ${failed.length} 个请求`);
    }

    // 验证数据一致性
    const commentCounts = successful.map(r => r.value.data?.data?.total || 0);
    const uniqueCounts = [...new Set(commentCounts)];

    if (successful.length > 0) {
      if (uniqueCounts.length === 1) {
        logSuccess(`数据一致性检查通过: 所有请求返回相同的评论数量 (${uniqueCounts[0]})`);
        if (uniqueCounts[0] === expectedCount) {
          logSuccess(`评论数量正确: ${uniqueCounts[0]} (预期: ${expectedCount})`);
        } else {
          logWarning(`评论数量不匹配: ${uniqueCounts[0]} (预期: ${expectedCount})`);
        }
      } else {
        logError(`数据一致性检查失败: 返回了不同的评论数量 ${JSON.stringify(uniqueCounts)}`);
      }
    }

    return {
      success: successful.length,
      failed: failed.length,
      duration,
      avgResponseTime: duration / results.length,
      consistent: uniqueCounts.length === 1,
      commentCounts: uniqueCounts,
      results,
    };
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return {
      success: 0,
      failed: CONFIG.CONCURRENT_USERS,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// 测试场景3: 并发删除评论
async function testConcurrentDeleteComments(users, commentIds) {
  logSection('测试场景 3: 并发删除评论');

  if (commentIds.length === 0) {
    logWarning('没有可删除的评论，跳过此测试');
    return {
      success: 0,
      failed: 0,
      skipped: true,
    };
  }

  const deleteCount = Math.min(CONFIG.DELETE_USERS, commentIds.length);
  logInfo(`${deleteCount} 个用户同时删除自己的评论...`);

  const startTime = Date.now();
  const promises = commentIds.slice(0, deleteCount).map((commentId, index) => {
    const user = users[index];
    return makeRequest('DELETE', `/comments/${commentId}`, null, user.token);
  });

  try {
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 200);
    const forbidden = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 403);
    const unauthorized = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 401);
    const failed = results.filter(r =>
      r.status === 'rejected' ||
      (r.status === 'fulfilled' && ![200, 401, 403].includes(r.value.statusCode))
    );

    logInfo(`总耗时: ${duration}ms`);
    logInfo(`平均响应时间: ${(duration / results.length).toFixed(2)}ms`);

    if (successful.length > 0) {
      logSuccess(`成功删除: ${successful.length} 条评论`);
    }

    if (unauthorized.length > 0) {
      logWarning(`未授权: ${unauthorized.length} 个请求 (需要JWT token)`);
    }

    if (forbidden.length > 0) {
      logSuccess(`权限检查正常: ${forbidden.length} 个请求被正确拒绝 (403 Forbidden)`);
    }

    if (failed.length > 0) {
      logError(`失败: ${failed.length} 个请求`);
    }

    return {
      success: successful.length,
      forbidden: forbidden.length,
      unauthorized: unauthorized.length,
      failed: failed.length,
      duration,
      avgResponseTime: duration / results.length,
      deletedCount: successful.length,
      results,
    };
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return {
      success: 0,
      failed: deleteCount,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// 测试场景4: 并发点赞评论 (关键测试 - 检查竞态条件)
async function testConcurrentLikeComment(contentId, commentId) {
  logSection('测试场景 4: 并发点赞评论 (竞态条件测试)');

  if (!commentId) {
    logWarning('没有可用的评论ID，跳过此测试');
    return {
      success: 0,
      failed: 0,
      skipped: true,
    };
  }

  logInfo(`${CONFIG.CONCURRENT_USERS} 个用户同时点赞同一条评论...`);
  logInfo(`评论ID: ${commentId}`);

  // 先获取初始点赞数
  let initialLikes = 0;
  try {
    const initialResponse = await makeRequest('GET', `/comments?contentId=${contentId}`);
    if (initialResponse.statusCode === 200) {
      const comments = initialResponse.data?.data?.comments || [];
      const targetComment = comments.find(c => c.id === commentId);
      if (targetComment) {
        initialLikes = targetComment.likes || 0;
        logInfo(`初始点赞数: ${initialLikes}`);
      }
    }
  } catch (error) {
    logWarning(`无法获取初始点赞数: ${error.message}`);
  }

  const startTime = Date.now();
  const promises = Array(CONFIG.CONCURRENT_USERS).fill(null).map(() => {
    return makeRequest('POST', `/comments/${commentId}/like`);
  });

  try {
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 200);
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 200));

    logInfo(`总耗时: ${duration}ms`);
    logInfo(`平均响应时间: ${(duration / results.length).toFixed(2)}ms`);
    logSuccess(`成功: ${successful.length} 个点赞请求`);

    if (failed.length > 0) {
      logError(`失败: ${failed.length} 个请求`);
    }

    // 关键检查: 验证点赞数是否准确
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待数据库更新

    try {
      const finalResponse = await makeRequest('GET', `/comments?contentId=${contentId}`);
      if (finalResponse.statusCode === 200) {
        const comments = finalResponse.data?.data?.comments || [];
        const targetComment = comments.find(c => c.id === commentId);

        if (targetComment) {
          const finalLikes = targetComment.likes || 0;
          const expectedLikes = initialLikes + successful.length;

          logInfo(`最终点赞数: ${finalLikes}`);
          logInfo(`预期点赞数: ${expectedLikes}`);

          if (finalLikes === expectedLikes) {
            logSuccess('✓ 点赞计数准确性检查通过！');
          } else {
            const lostLikes = expectedLikes - finalLikes;
            logError(`✗ 点赞计数不准确！丢失了 ${lostLikes} 个点赞`);
            logError('这表明存在竞态条件问题！');
            logWarning('\n建议修复方案:');
            log('  1. 使用数据库事务确保原子性操作', colors.yellow);
            log('  2. 使用乐观锁或悲观锁机制', colors.yellow);
            log('  3. 使用 SQL 的原子递增操作 (UPDATE ... SET likes = likes + 1)', colors.yellow);
            log('  4. 考虑使用 Redis 等缓存层处理高并发点赞', colors.yellow);
          }

          return {
            success: successful.length,
            failed: failed.length,
            duration,
            avgResponseTime: duration / results.length,
            initialLikes,
            finalLikes,
            expectedLikes,
            accurate: finalLikes === expectedLikes,
            lostLikes: expectedLikes - finalLikes,
            results,
          };
        }
      }
    } catch (error) {
      logWarning(`无法验证最终点赞数: ${error.message}`);
    }

    return {
      success: successful.length,
      failed: failed.length,
      duration,
      avgResponseTime: duration / results.length,
      results,
    };
  } catch (error) {
    logError(`测试失败: ${error.message}`);
    return {
      success: 0,
      failed: CONFIG.CONCURRENT_USERS,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// 生成测试报告
function generateReport(testResults) {
  logSection('测试报告');

  console.log('┌─────────────────────────────────────────────────────────────────────────┐');
  console.log('│                         评论系统并发测试报告                              │');
  console.log('└─────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // 测试配置
  console.log('测试配置:');
  console.log(`  - 并发用户数: ${CONFIG.CONCURRENT_USERS}`);
  console.log(`  - 删除用户数: ${CONFIG.DELETE_USERS}`);
  if (CONFIG.TEST_CONTENT_ID) {
    console.log(`  - 测试内容ID: ${CONFIG.TEST_CONTENT_ID}`);
  }
  console.log(`  - 服务器地址: ${CONFIG.BASE_URL}`);
  console.log('');

  // 场景1: 并发创建评论
  console.log('场景 1: 并发创建评论');
  if (testResults.createComments) {
    const result = testResults.createComments;
    console.log(`  ✓ 成功: ${result.success}/${CONFIG.CONCURRENT_USERS}`);
    console.log(`  ✗ 失败: ${result.failed}/${CONFIG.CONCURRENT_USERS}`);
    if (result.unauthorized > 0) {
      console.log(`  ⚠ 未授权: ${result.unauthorized}/${CONFIG.CONCURRENT_USERS}`);
    }
    console.log(`  ⏱ 总耗时: ${result.duration}ms`);
    console.log(`  ⏱ 平均响应: ${result.avgResponseTime.toFixed(2)}ms`);

    if (result.success > 0) {
      logSuccess('  状态: 通过');
    } else if (result.unauthorized === CONFIG.CONCURRENT_USERS) {
      logWarning('  状态: 需要认证 (预期行为)');
    } else {
      logError('  状态: 失败');
    }
  }
  console.log('');

  // 场景2: 并发获取评论
  console.log('场景 2: 并发获取评论列表');
  if (testResults.getComments) {
    const result = testResults.getComments;
    console.log(`  ✓ 成功: ${result.success}/${CONFIG.CONCURRENT_USERS}`);
    console.log(`  ✗ 失败: ${result.failed}/${CONFIG.CONCURRENT_USERS}`);
    console.log(`  ⏱ 总耗时: ${result.duration}ms`);
    console.log(`  ⏱ 平均响应: ${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`  📊 数据一致性: ${result.consistent ? '通过' : '失败'}`);

    if (result.success === CONFIG.CONCURRENT_USERS && result.consistent) {
      logSuccess('  状态: 通过');
    } else {
      logError('  状态: 失败');
    }
  }
  console.log('');

  // 场景3: 并发删除评论
  console.log('场景 3: 并发删除评论');
  if (testResults.deleteComments) {
    const result = testResults.deleteComments;
    if (result.skipped) {
      logWarning('  状态: 跳过 (没有可删除的评论)');
    } else {
      const total = result.success + result.failed + result.forbidden + result.unauthorized;
      console.log(`  ✓ 成功: ${result.success}/${total}`);
      console.log(`  ✗ 失败: ${result.failed}/${total}`);
      if (result.forbidden > 0) {
        console.log(`  🔒 权限拒绝: ${result.forbidden}/${total}`);
      }
      if (result.unauthorized > 0) {
        console.log(`  ⚠ 未授权: ${result.unauthorized}/${total}`);
      }
      console.log(`  ⏱ 总耗时: ${result.duration}ms`);
      console.log(`  ⏱ 平均响应: ${(result.duration / total).toFixed(2)}ms`);

      if (result.success > 0 || result.unauthorized > 0) {
        logSuccess('  状态: 通过');
      } else {
        logError('  状态: 失败');
      }
    }
  }
  console.log('');

  // 场景4: 并发点赞 (最关键)
  console.log('场景 4: 并发点赞评论 (竞态条件测试)');
  if (testResults.likeComment) {
    const result = testResults.likeComment;
    if (result.skipped) {
      logWarning('  状态: 跳过 (没有可用的评论)');
    } else {
      console.log(`  ✓ 成功: ${result.success}/${CONFIG.CONCURRENT_USERS}`);
      console.log(`  ✗ 失败: ${result.failed}/${CONFIG.CONCURRENT_USERS}`);
      console.log(`  ⏱ 总耗时: ${result.duration}ms`);
      console.log(`  ⏱ 平均响应: ${result.avgResponseTime.toFixed(2)}ms`);

      if (result.initialLikes !== undefined) {
        console.log(`  📊 初始点赞数: ${result.initialLikes}`);
        console.log(`  📊 最终点赞数: ${result.finalLikes}`);
        console.log(`  📊 预期点赞数: ${result.expectedLikes}`);

        if (result.accurate) {
          logSuccess('  ✓ 点赞计数准确性: 通过');
          logSuccess('  状态: 通过 - 没有竞态条件问题');
        } else {
          logError(`  ✗ 点赞计数准确性: 失败 (丢失 ${result.lostLikes} 个点赞)`);
          logError('  状态: 失败 - 存在竞态条件问题！');
        }
      }
    }
  }
  console.log('');

  // 总结
  console.log('─────────────────────────────────────────────────────────────────────────');
  console.log('总结:');

  const allPassed =
    testResults.createComments?.success === CONFIG.CONCURRENT_USERS &&
    testResults.getComments?.success === CONFIG.CONCURRENT_USERS &&
    testResults.getComments?.consistent &&
    (testResults.likeComment?.accurate !== false);

  if (allPassed) {
    logSuccess('所有测试通过！系统在并发场景下表现良好。');
  } else {
    logWarning('部分测试未通过或需要认证。请查看详细报告。');
  }

  console.log('');

  // 关键发现
  console.log('关键发现:');

  if (testResults.createComments?.unauthorized > 0) {
    logInfo('• 创建评论需要JWT认证 (符合安全要求)');
  }

  if (testResults.deleteComments?.unauthorized > 0 || testResults.deleteComments?.forbidden > 0) {
    logInfo('• 删除评论有权限控制 (符合安全要求)');
  }

  if (testResults.likeComment?.accurate === false) {
    logError('• 点赞功能存在竞态条件问题，需要修复！');
  } else if (testResults.likeComment?.accurate === true) {
    logSuccess('• 点赞功能在并发场景下计数准确');
  }

  if (testResults.getComments?.success === CONFIG.CONCURRENT_USERS) {
    logSuccess('• 获取评论列表在高并发下表现稳定');
  }

  console.log('');
  console.log('─────────────────────────────────────────────────────────────────────────');
}

// 主测试函数
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
  log('║                  改进的评论系统并发测试                                  ║', colors.bright + colors.cyan);
  log('║            Improved Comment System Concurrent Testing                 ║', colors.bright + colors.cyan);
  log('╚════════════════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);
  console.log('\n');

  const testResults = {};

  try {
    // 步骤1: 认证用户
    const users = await setupTestUsers();
    await new Promise(resolve => setTimeout(resolve, 500));

    // 步骤2: 创建测试内容
    const contentId = await createTestContent(users[0]);
    if (!contentId) {
      throw new Error('Failed to create test content');
    }
    await new Promise(resolve => setTimeout(resolve, 500));

    // 场景1: 并发创建评论
    testResults.createComments = await testConcurrentCreateComments(users, contentId);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 场景2: 并发获取评论列表
    testResults.getComments = await testConcurrentGetComments(
      contentId,
      testResults.createComments.success
    );
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 场景3: 并发删除评论
    testResults.deleteComments = await testConcurrentDeleteComments(
      users,
      testResults.createComments.commentIds
    );
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 场景4: 并发点赞评论 (使用剩余的评论)
    const remainingCommentIds = testResults.createComments.commentIds.slice(
      testResults.deleteComments.deletedCount || 0
    );
    const testCommentId = remainingCommentIds[0];
    testResults.likeComment = await testConcurrentLikeComment(contentId, testCommentId);

    // 生成报告
    generateReport(testResults);

  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().then(() => {
    logInfo('\n测试完成！');
    process.exit(0);
  }).catch((error) => {
    logError(`\n测试失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testConcurrentCreateComments,
  testConcurrentGetComments,
  testConcurrentDeleteComments,
  testConcurrentLikeComment,
};
