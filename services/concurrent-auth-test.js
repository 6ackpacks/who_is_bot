/**
 * 并发认证和用户管理测试脚本
 *
 * 测试目标: 模拟20个用户同时进行认证和用户操作
 *
 * 测试场景:
 * 1. 并发登录测试 (20个用户同时登录)
 * 2. 并发获取用户信息 (20个用户同时获取自己的信息)
 * 3. 并发更新用户统计 (20个用户同时更新统计)
 */

const http = require('http');

// 配置
const CONFIG = {
  BASE_URL: 'localhost',
  PORT: 80,
  CONCURRENT_USERS: 20,
  TIMEOUT: 10000, // 10秒超时
};

// 测试结果统计
const testResults = {
  login: {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    responseTimes: [],
    tokens: new Set(),
    userIds: new Set(),
  },
  getMe: {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    responseTimes: [],
    userDataMismatches: [],
  },
  updateStats: {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    responseTimes: [],
    conflicts: [],
  },
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

// HTTP 请求封装
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: CONFIG.BASE_URL,
      port: CONFIG.PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: CONFIG.TIMEOUT,
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;

        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            body: jsonBody,
            responseTime,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body,
            responseTime,
            headers: res.headers,
            parseError: e.message,
          });
        }
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      reject({
        error: error.message,
        responseTime,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        responseTime: CONFIG.TIMEOUT,
      });
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// 测试1: 并发登录
async function testConcurrentLogin() {
  logSection('测试1: 并发登录测试 (20个用户同时登录)');

  const loginPromises = [];

  for (let i = 1; i <= CONFIG.CONCURRENT_USERS; i++) {
    const nickname = `TestUser${i}`;
    const promise = makeRequest('POST', '/auth/mock-login', { nickname })
      .then((response) => {
        testResults.login.total++;
        testResults.login.responseTimes.push(response.responseTime);

        if (response.statusCode === 201 || response.statusCode === 200) {
          testResults.login.success++;

          // 检查响应数据
          if (response.body.data && response.body.data.accessToken) {
            const token = response.body.data.accessToken;
            const userId = response.body.data.id;

            // 检查 token 是否重复
            if (testResults.login.tokens.has(token)) {
              testResults.login.errors.push({
                user: nickname,
                error: 'Token collision detected!',
                token: token.substring(0, 20) + '...',
              });
            } else {
              testResults.login.tokens.add(token);
            }

            // 检查 userId 是否重复
            if (testResults.login.userIds.has(userId)) {
              testResults.login.errors.push({
                user: nickname,
                error: 'User ID collision detected!',
                userId,
              });
            } else {
              testResults.login.userIds.add(userId);
            }

            return {
              nickname,
              token,
              userId,
              responseTime: response.responseTime,
            };
          } else {
            testResults.login.errors.push({
              user: nickname,
              error: 'Missing accessToken in response',
              body: response.body,
            });
          }
        } else {
          testResults.login.failed++;
          testResults.login.errors.push({
            user: nickname,
            error: `HTTP ${response.statusCode}`,
            body: response.body,
          });
        }

        return null;
      })
      .catch((error) => {
        testResults.login.total++;
        testResults.login.failed++;
        testResults.login.errors.push({
          user: nickname,
          error: error.error || error.message,
        });
        return null;
      });

    loginPromises.push(promise);
  }

  log(`发起 ${CONFIG.CONCURRENT_USERS} 个并发登录请求...`, colors.blue);
  const results = await Promise.all(loginPromises);

  // 过滤出成功的用户
  const successfulUsers = results.filter(r => r !== null);

  // 打印结果
  printLoginResults();

  return successfulUsers;
}

// 测试2: 并发获取用户信息
async function testConcurrentGetMe(users) {
  logSection('测试2: 并发获取用户信息 (20个用户同时获取自己的信息)');

  if (users.length === 0) {
    log('没有可用的用户进行测试', colors.red);
    return;
  }

  const getMePromises = users.map((user) => {
    return makeRequest('GET', '/auth/me', null, user.token)
      .then((response) => {
        testResults.getMe.total++;
        testResults.getMe.responseTimes.push(response.responseTime);

        if (response.statusCode === 200) {
          testResults.getMe.success++;

          // 验证返回的用户信息是否正确
          if (response.body.data) {
            const returnedNickname = response.body.data.nickname;
            const returnedUserId = response.body.data.id;

            if (returnedNickname !== user.nickname) {
              testResults.getMe.userDataMismatches.push({
                expected: user.nickname,
                received: returnedNickname,
                error: 'Nickname mismatch - possible data leak!',
              });
            }

            if (returnedUserId !== user.userId) {
              testResults.getMe.userDataMismatches.push({
                expected: user.userId,
                received: returnedUserId,
                error: 'User ID mismatch - possible data leak!',
              });
            }
          }
        } else {
          testResults.getMe.failed++;
          testResults.getMe.errors.push({
            user: user.nickname,
            error: `HTTP ${response.statusCode}`,
            body: response.body,
          });
        }
      })
      .catch((error) => {
        testResults.getMe.total++;
        testResults.getMe.failed++;
        testResults.getMe.errors.push({
          user: user.nickname,
          error: error.error || error.message,
        });
      });
  });

  log(`发起 ${users.length} 个并发获取用户信息请求...`, colors.blue);
  await Promise.all(getMePromises);

  printGetMeResults();
}

// 测试3: 并发更新用户统计
async function testConcurrentUpdateStats(users) {
  logSection('测试3: 并发更新用户统计 (20个用户同时更新统计)');

  if (users.length === 0) {
    log('没有可用的用户进行测试', colors.red);
    return;
  }

  const updatePromises = users.map((user, index) => {
    const statsData = {
      accuracy: 75.5 + index,
      totalJudged: 100 + index * 10,
      streak: 5 + index,
    };

    return makeRequest('PATCH', `/user/${user.userId}/stats`, statsData, user.token)
      .then((response) => {
        testResults.updateStats.total++;
        testResults.updateStats.responseTimes.push(response.responseTime);

        if (response.statusCode === 200) {
          testResults.updateStats.success++;

          // 验证更新后的数据
          if (response.body) {
            const returned = response.body;

            // 检查数据是否正确更新
            if (returned.accuracy !== undefined && Math.abs(returned.accuracy - statsData.accuracy) > 0.1) {
              testResults.updateStats.conflicts.push({
                user: user.nickname,
                expected: statsData.accuracy,
                received: returned.accuracy,
                field: 'accuracy',
              });
            }
          }
        } else {
          testResults.updateStats.failed++;
          testResults.updateStats.errors.push({
            user: user.nickname,
            error: `HTTP ${response.statusCode}`,
            body: response.body,
          });
        }
      })
      .catch((error) => {
        testResults.updateStats.total++;
        testResults.updateStats.failed++;
        testResults.updateStats.errors.push({
          user: user.nickname,
          error: error.error || error.message,
        });
      });
  });

  log(`发起 ${users.length} 个并发更新统计请求...`, colors.blue);
  await Promise.all(updatePromises);

  printUpdateStatsResults();
}

// 打印登录测试结果
function printLoginResults() {
  console.log('\n' + '-'.repeat(80));
  log('登录测试结果:', colors.bright);
  console.log('-'.repeat(80));

  log(`总请求数: ${testResults.login.total}`, colors.blue);
  log(`成功: ${testResults.login.success}`, colors.green);
  log(`失败: ${testResults.login.failed}`, testResults.login.failed > 0 ? colors.red : colors.green);
  log(`成功率: ${((testResults.login.success / testResults.login.total) * 100).toFixed(2)}%`,
      testResults.login.success === testResults.login.total ? colors.green : colors.yellow);

  if (testResults.login.responseTimes.length > 0) {
    const avgTime = testResults.login.responseTimes.reduce((a, b) => a + b, 0) / testResults.login.responseTimes.length;
    const maxTime = Math.max(...testResults.login.responseTimes);
    const minTime = Math.min(...testResults.login.responseTimes);

    console.log('\n响应时间统计:');
    log(`  平均: ${avgTime.toFixed(2)}ms`, avgTime < 1000 ? colors.green : colors.yellow);
    log(`  最大: ${maxTime.toFixed(2)}ms`, maxTime < 1000 ? colors.green : colors.yellow);
    log(`  最小: ${minTime.toFixed(2)}ms`, colors.green);
  }

  console.log('\nToken 唯一性检查:');
  log(`  生成的唯一 Token 数: ${testResults.login.tokens.size}`, colors.blue);
  log(`  Token 冲突: ${testResults.login.success - testResults.login.tokens.size}`,
      testResults.login.tokens.size === testResults.login.success ? colors.green : colors.red);

  console.log('\nUser ID 唯一性检查:');
  log(`  生成的唯一 User ID 数: ${testResults.login.userIds.size}`, colors.blue);
  log(`  User ID 冲突: ${testResults.login.success - testResults.login.userIds.size}`,
      testResults.login.userIds.size === testResults.login.success ? colors.green : colors.red);

  if (testResults.login.errors.length > 0) {
    console.log('\n错误详情:');
    testResults.login.errors.slice(0, 5).forEach((err, idx) => {
      log(`  ${idx + 1}. ${err.user}: ${err.error}`, colors.red);
      if (err.body) {
        console.log(`     响应: ${JSON.stringify(err.body).substring(0, 100)}`);
      }
    });
    if (testResults.login.errors.length > 5) {
      log(`  ... 还有 ${testResults.login.errors.length - 5} 个错误`, colors.yellow);
    }
  }
}

// 打印获取用户信息测试结果
function printGetMeResults() {
  console.log('\n' + '-'.repeat(80));
  log('获取用户信息测试结果:', colors.bright);
  console.log('-'.repeat(80));

  log(`总请求数: ${testResults.getMe.total}`, colors.blue);
  log(`成功: ${testResults.getMe.success}`, colors.green);
  log(`失败: ${testResults.getMe.failed}`, testResults.getMe.failed > 0 ? colors.red : colors.green);
  log(`成功率: ${((testResults.getMe.success / testResults.getMe.total) * 100).toFixed(2)}%`,
      testResults.getMe.success === testResults.getMe.total ? colors.green : colors.yellow);

  if (testResults.getMe.responseTimes.length > 0) {
    const avgTime = testResults.getMe.responseTimes.reduce((a, b) => a + b, 0) / testResults.getMe.responseTimes.length;
    const maxTime = Math.max(...testResults.getMe.responseTimes);
    const minTime = Math.min(...testResults.getMe.responseTimes);

    console.log('\n响应时间统计:');
    log(`  平均: ${avgTime.toFixed(2)}ms`, avgTime < 1000 ? colors.green : colors.yellow);
    log(`  最大: ${maxTime.toFixed(2)}ms`, maxTime < 1000 ? colors.green : colors.yellow);
    log(`  最小: ${minTime.toFixed(2)}ms`, colors.green);
  }

  console.log('\n数据一致性检查:');
  log(`  数据不匹配数: ${testResults.getMe.userDataMismatches.length}`,
      testResults.getMe.userDataMismatches.length === 0 ? colors.green : colors.red);

  if (testResults.getMe.userDataMismatches.length > 0) {
    console.log('\n数据不匹配详情 (严重安全问题!):');
    testResults.getMe.userDataMismatches.forEach((mismatch, idx) => {
      log(`  ${idx + 1}. ${mismatch.error}`, colors.red);
      log(`     期望: ${mismatch.expected}`, colors.yellow);
      log(`     实际: ${mismatch.received}`, colors.yellow);
    });
  }

  if (testResults.getMe.errors.length > 0) {
    console.log('\n错误详情:');
    testResults.getMe.errors.slice(0, 5).forEach((err, idx) => {
      log(`  ${idx + 1}. ${err.user}: ${err.error}`, colors.red);
    });
    if (testResults.getMe.errors.length > 5) {
      log(`  ... 还有 ${testResults.getMe.errors.length - 5} 个错误`, colors.yellow);
    }
  }
}

// 打印更新统计测试结果
function printUpdateStatsResults() {
  console.log('\n' + '-'.repeat(80));
  log('更新用户统计测试结果:', colors.bright);
  console.log('-'.repeat(80));

  log(`总请求数: ${testResults.updateStats.total}`, colors.blue);
  log(`成功: ${testResults.updateStats.success}`, colors.green);
  log(`失败: ${testResults.updateStats.failed}`, testResults.updateStats.failed > 0 ? colors.red : colors.green);
  log(`成功率: ${((testResults.updateStats.success / testResults.updateStats.total) * 100).toFixed(2)}%`,
      testResults.updateStats.success === testResults.updateStats.total ? colors.green : colors.yellow);

  if (testResults.updateStats.responseTimes.length > 0) {
    const avgTime = testResults.updateStats.responseTimes.reduce((a, b) => a + b, 0) / testResults.updateStats.responseTimes.length;
    const maxTime = Math.max(...testResults.updateStats.responseTimes);
    const minTime = Math.min(...testResults.updateStats.responseTimes);

    console.log('\n响应时间统计:');
    log(`  平均: ${avgTime.toFixed(2)}ms`, avgTime < 1000 ? colors.green : colors.yellow);
    log(`  最大: ${maxTime.toFixed(2)}ms`, maxTime < 1000 ? colors.green : colors.yellow);
    log(`  最小: ${minTime.toFixed(2)}ms`, colors.green);
  }

  console.log('\n数据冲突检查:');
  log(`  数据冲突数: ${testResults.updateStats.conflicts.length}`,
      testResults.updateStats.conflicts.length === 0 ? colors.green : colors.red);

  if (testResults.updateStats.conflicts.length > 0) {
    console.log('\n数据冲突详情:');
    testResults.updateStats.conflicts.forEach((conflict, idx) => {
      log(`  ${idx + 1}. ${conflict.user} - ${conflict.field}`, colors.red);
      log(`     期望: ${conflict.expected}`, colors.yellow);
      log(`     实际: ${conflict.received}`, colors.yellow);
    });
  }

  if (testResults.updateStats.errors.length > 0) {
    console.log('\n错误详情:');
    testResults.updateStats.errors.slice(0, 5).forEach((err, idx) => {
      log(`  ${idx + 1}. ${err.user}: ${err.error}`, colors.red);
    });
    if (testResults.updateStats.errors.length > 5) {
      log(`  ... 还有 ${testResults.updateStats.errors.length - 5} 个错误`, colors.yellow);
    }
  }
}

// 生成最终测试报告
function generateFinalReport() {
  logSection('最终测试报告');

  const totalTests = testResults.login.total + testResults.getMe.total + testResults.updateStats.total;
  const totalSuccess = testResults.login.success + testResults.getMe.success + testResults.updateStats.success;
  const totalFailed = testResults.login.failed + testResults.getMe.failed + testResults.updateStats.failed;

  console.log('总体统计:');
  log(`  总测试数: ${totalTests}`, colors.blue);
  log(`  成功: ${totalSuccess}`, colors.green);
  log(`  失败: ${totalFailed}`, totalFailed > 0 ? colors.red : colors.green);
  log(`  总体成功率: ${((totalSuccess / totalTests) * 100).toFixed(2)}%`,
      totalSuccess === totalTests ? colors.green : colors.yellow);

  console.log('\n关键指标评估:');

  // 1. Token 唯一性
  const tokenUniqueness = testResults.login.tokens.size === testResults.login.success;
  log(`  1. Token 唯一性: ${tokenUniqueness ? '通过' : '失败'}`,
      tokenUniqueness ? colors.green : colors.red);

  // 2. 数据隔离性
  const dataIsolation = testResults.getMe.userDataMismatches.length === 0;
  log(`  2. 数据隔离性: ${dataIsolation ? '通过' : '失败'}`,
      dataIsolation ? colors.green : colors.red);

  // 3. 响应时间
  const allResponseTimes = [
    ...testResults.login.responseTimes,
    ...testResults.getMe.responseTimes,
    ...testResults.updateStats.responseTimes,
  ];
  const avgResponseTime = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
  const responseTimeOk = avgResponseTime < 1000;
  log(`  3. 响应时间 (< 1秒): ${responseTimeOk ? '通过' : '失败'} (平均: ${avgResponseTime.toFixed(2)}ms)`,
      responseTimeOk ? colors.green : colors.red);

  // 4. 数据一致性
  const dataConsistency = testResults.updateStats.conflicts.length === 0;
  log(`  4. 数据一致性: ${dataConsistency ? '通过' : '失败'}`,
      dataConsistency ? colors.green : colors.red);

  // 5. 错误率
  const errorRate = (totalFailed / totalTests) * 100;
  const errorRateOk = errorRate < 5;
  log(`  5. 错误率 (< 5%): ${errorRateOk ? '通过' : '失败'} (${errorRate.toFixed(2)}%)`,
      errorRateOk ? colors.green : colors.red);

  console.log('\n潜在问题:');
  const issues = [];

  if (!tokenUniqueness) {
    issues.push('- JWT Token 生成存在冲突，可能导致安全问题');
  }

  if (!dataIsolation) {
    issues.push('- 用户数据隔离失败，存在严重的数据泄露风险');
  }

  if (!responseTimeOk) {
    issues.push('- 响应时间过长，可能是数据库连接池不足或查询效率问题');
  }

  if (!dataConsistency) {
    issues.push('- 并发更新存在数据冲突，可能存在竞态条件');
  }

  if (totalFailed > 0) {
    issues.push(`- ${totalFailed} 个请求失败，需要检查错误日志`);
  }

  if (issues.length === 0) {
    log('  未发现问题，所有测试通过！', colors.green);
  } else {
    issues.forEach(issue => {
      log(issue, colors.red);
    });
  }

  console.log('\n建议:');
  if (!responseTimeOk) {
    log('  - 增加数据库连接池大小', colors.yellow);
    log('  - 优化数据库查询，添加索引', colors.yellow);
  }
  if (!tokenUniqueness || !dataIsolation) {
    log('  - 检查 JWT 生成逻辑，确保使用唯一标识符', colors.yellow);
    log('  - 审查认证中间件，确保正确解析用户身份', colors.yellow);
  }
  if (!dataConsistency) {
    log('  - 使用数据库事务确保数据一致性', colors.yellow);
    log('  - 实现乐观锁或悲观锁机制', colors.yellow);
  }

  console.log('\n' + '='.repeat(80));
  const allPassed = tokenUniqueness && dataIsolation && responseTimeOk && dataConsistency && errorRateOk;
  log(allPassed ? '测试结果: 全部通过' : '测试结果: 存在问题',
      allPassed ? colors.green + colors.bright : colors.red + colors.bright);
  console.log('='.repeat(80) + '\n');
}

// 主测试函数
async function runTests() {
  log('\n开始并发认证和用户管理测试', colors.bright + colors.cyan);
  log(`测试配置: ${CONFIG.CONCURRENT_USERS} 个并发用户`, colors.blue);
  log(`服务器地址: http://${CONFIG.BASE_URL}:${CONFIG.PORT}`, colors.blue);
  log(`超时时间: ${CONFIG.TIMEOUT}ms\n`, colors.blue);

  try {
    // 测试1: 并发登录
    const users = await testConcurrentLogin();

    // 等待一小段时间，确保数据库写入完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试2: 并发获取用户信息
    await testConcurrentGetMe(users);

    // 等待一小段时间
    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试3: 并发更新用户统计
    await testConcurrentUpdateStats(users);

    // 生成最终报告
    generateFinalReport();

  } catch (error) {
    log(`\n测试执行失败: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests().catch((error) => {
  log(`\n未捕获的错误: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
