/**
 * 并发测试脚本 - 内容获取和判定提交
 *
 * 测试目标: 模拟20个用户同时获取内容和提交判定
 *
 * 测试场景:
 * 1. 并发获取内容列表 (20个用户同时获取)
 * 2. 并发提交判定 (20个用户同时提交判定)
 * 3. 并发获取判定历史 (20个用户同时获取历史)
 * 4. 重复判定测试 (同一用户对同一内容多次判定)
 */

const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:80';
const CONCURRENT_USERS = 20;
const TEST_TIMEOUT = 30000; // 30秒超时

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

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// 记录测试结果
function recordTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    logSuccess(name);
  } else {
    testResults.failed++;
    logError(`${name}: ${error}`);
    testResults.errors.push({ test: name, error });
  }
}

// 生成测试用户
async function createTestUsers(count) {
  logInfo(`创建 ${count} 个测试用户...`);
  const users = [];

  for (let i = 0; i < count; i++) {
    try {
      const nickname = `测试用户${Date.now()}_${i}`;
      const response = await axios.post(`${BASE_URL}/auth/mock-login`, {
        nickname: nickname,
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        users.push({
          id: i + 1,
          uid: userData.uid,
          userId: userData.id,
          token: userData.accessToken,
          nickname: userData.nickname,
        });
      }
    } catch (error) {
      logError(`创建用户 ${i + 1} 失败: ${error.message}`);
      if (error.response && error.response.data) {
        logError(`  详细错误: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  logSuccess(`成功创建 ${users.length} 个测试用户`);
  return users;
}

// 获取内容列表
async function getContentList(limit = 10) {
  const response = await axios.get(`${BASE_URL}/content/feed`, {
    params: { limit },
  });
  // Response is wrapped in {success: true, data: [...]}
  return response.data.data || response.data;
}

// 测试1: 并发获取内容列表
async function testConcurrentGetContent(users) {
  logSection('测试1: 并发获取内容列表');

  const startTime = Date.now();
  const promises = users.map(async (user) => {
    const requestStart = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/content/feed`, {
        params: { limit: 10 },
        headers: user.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      const requestTime = Date.now() - requestStart;

      // Handle wrapped response
      const data = response.data.data || response.data;

      return {
        success: true,
        userId: user.id,
        responseTime: requestTime,
        dataCount: Array.isArray(data) ? data.length : 0,
      };
    } catch (error) {
      return {
        success: false,
        userId: user.id,
        error: error.message,
      };
    }
  });

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  // 分析结果
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / successCount;

  logInfo(`总耗时: ${totalTime}ms`);
  logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  logInfo(`成功: ${successCount}, 失败: ${failCount}`);

  recordTest(
    `并发获取内容 - ${successCount}/${users.length} 成功`,
    successCount === users.length,
    failCount > 0 ? `${failCount} 个请求失败` : null
  );

  // 验证响应时间
  const slowRequests = results.filter(r => r.success && r.responseTime > 1000);
  if (slowRequests.length > 0) {
    logWarning(`${slowRequests.length} 个请求响应时间超过1秒`);
  }

  return results;
}

// 测试2: 并发提交判定
async function testConcurrentSubmitJudgment(users, contentList) {
  logSection('测试2: 并发提交判定');

  if (!contentList || contentList.length === 0) {
    logError('没有可用的内容进行测试');
    recordTest('并发提交判定', false, '没有可用内容');
    return [];
  }

  // 每个用户对第一个内容进行判定
  const targetContent = contentList[0];
  logInfo(`目标内容ID: ${targetContent.id}`);
  logInfo(`内容初始统计 - 总投票: ${targetContent.totalVotes}, AI投票: ${targetContent.aiVotes}, 人类投票: ${targetContent.humanVotes}`);

  const startTime = Date.now();
  const promises = users.map(async (user, index) => {
    const requestStart = Date.now();
    try {
      // 随机选择判定结果
      const userChoice = index % 2 === 0 ? 'ai' : 'human';
      const isCorrect = userChoice === (targetContent.isAi ? 'ai' : 'human');

      const response = await axios.post(
        `${BASE_URL}/judgment/submit`,
        {
          contentId: targetContent.id,
          userChoice,
          isCorrect,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const requestTime = Date.now() - requestStart;

      return {
        success: response.data.success,
        userId: user.id,
        userChoice,
        isCorrect,
        responseTime: requestTime,
        stats: response.data.stats,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        userId: user.id,
        error: error.response?.data?.message || error.message,
      };
    }
  });

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  // 分析结果
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / (successCount || 1);

  logInfo(`总耗时: ${totalTime}ms`);
  logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  logInfo(`成功: ${successCount}, 失败: ${failCount}`);

  // 验证统计数据准确性
  if (successCount > 0) {
    // 从数据库重新获取最终状态，而不是使用响应中的数据
    // 因为响应可能在所有事务完成前就发送了
    const finalContentResponse = await axios.get(`${BASE_URL}/content/feed`, {
      params: { limit: 10 },
    });
    const finalContentList = finalContentResponse.data.data || finalContentResponse.data;
    const finalContent = finalContentList.find(c => c.id === targetContent.id);

    const finalStats = {
      totalVotes: finalContent.totalVotes,
      aiVotes: finalContent.aiVotes,
      humanVotes: finalContent.humanVotes,
      correctVotes: finalContent.correctVotes,
    };

    logInfo(`\n最终统计数据 (从数据库获取):`);
    logInfo(`  总投票: ${finalStats.totalVotes}`);
    logInfo(`  AI投票: ${finalStats.aiVotes}`);
    logInfo(`  人类投票: ${finalStats.humanVotes}`);
    logInfo(`  正确投票: ${finalStats.correctVotes}`);

    // 计算预期值
    const expectedTotalVotes = targetContent.totalVotes + successCount;
    const aiChoiceCount = results.filter(r => r.success && r.userChoice === 'ai').length;
    const humanChoiceCount = results.filter(r => r.success && r.userChoice === 'human').length;
    const correctChoiceCount = results.filter(r => r.success && r.isCorrect).length;

    const expectedAiVotes = targetContent.aiVotes + aiChoiceCount;
    const expectedHumanVotes = targetContent.humanVotes + humanChoiceCount;
    const expectedCorrectVotes = targetContent.correctVotes + correctChoiceCount;

    logInfo(`\n预期统计数据:`);
    logInfo(`  总投票: ${expectedTotalVotes}`);
    logInfo(`  AI投票: ${expectedAiVotes}`);
    logInfo(`  人类投票: ${expectedHumanVotes}`);
    logInfo(`  正确投票: ${expectedCorrectVotes}`);

    // 验证数据准确性
    const statsCorrect =
      finalStats.totalVotes === expectedTotalVotes &&
      finalStats.aiVotes === expectedAiVotes &&
      finalStats.humanVotes === expectedHumanVotes &&
      finalStats.correctVotes === expectedCorrectVotes;

    if (statsCorrect) {
      logSuccess('统计数据完全准确！');
    } else {
      logError('统计数据不准确！');
      if (finalStats.totalVotes !== expectedTotalVotes) {
        logError(`  总投票不匹配: 实际 ${finalStats.totalVotes}, 预期 ${expectedTotalVotes}`);
      }
      if (finalStats.aiVotes !== expectedAiVotes) {
        logError(`  AI投票不匹配: 实际 ${finalStats.aiVotes}, 预期 ${expectedAiVotes}`);
      }
      if (finalStats.humanVotes !== expectedHumanVotes) {
        logError(`  人类投票不匹配: 实际 ${finalStats.humanVotes}, 预期 ${expectedHumanVotes}`);
      }
      if (finalStats.correctVotes !== expectedCorrectVotes) {
        logError(`  正确投票不匹配: 实际 ${finalStats.correctVotes}, 预期 ${expectedCorrectVotes}`);
      }
    }

    recordTest(
      `并发提交判定 - ${successCount}/${users.length} 成功`,
      successCount === users.length && statsCorrect,
      !statsCorrect ? '统计数据不准确' : (failCount > 0 ? `${failCount} 个请求失败` : null)
    );
  } else {
    recordTest('并发提交判定', false, '所有请求都失败');
  }

  return results;
}

// 测试3: 并发获取判定历史
async function testConcurrentGetHistory(users) {
  logSection('测试3: 并发获取判定历史');

  const startTime = Date.now();
  const promises = users.map(async (user) => {
    const requestStart = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/judgment/history`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const requestTime = Date.now() - requestStart;

      // Handle wrapped response
      const data = response.data.data || response.data;

      return {
        success: true,
        userId: user.id,
        responseTime: requestTime,
        historyCount: Array.isArray(data) ? data.length : 0,
      };
    } catch (error) {
      return {
        success: false,
        userId: user.id,
        error: error.message,
      };
    }
  });

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  // 分析结果
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.responseTime, 0) / (successCount || 1);

  logInfo(`总耗时: ${totalTime}ms`);
  logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  logInfo(`成功: ${successCount}, 失败: ${failCount}`);

  // 验证每个用户的历史记录数量
  const historyStats = results
    .filter(r => r.success)
    .map(r => `用户${r.userId}: ${r.historyCount}条`)
    .join(', ');
  logInfo(`历史记录数量: ${historyStats}`);

  recordTest(
    `并发获取历史 - ${successCount}/${users.length} 成功`,
    successCount === users.length,
    failCount > 0 ? `${failCount} 个请求失败` : null
  );

  return results;
}

// 测试4: 重复判定测试
async function testDuplicateJudgment(user, contentId) {
  logSection('测试4: 重复判定测试');

  logInfo(`用户 ${user.nickname} 尝试对同一内容提交多次判定...`);

  const attempts = [];

  // 尝试提交3次相同的判定
  for (let i = 0; i < 3; i++) {
    try {
      const response = await axios.post(
        `${BASE_URL}/judgment/submit`,
        {
          contentId,
          userChoice: 'ai',
          isCorrect: true,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      attempts.push({
        attempt: i + 1,
        success: response.data.success,
        message: response.data.message,
        code: response.data.code,
      });
    } catch (error) {
      attempts.push({
        attempt: i + 1,
        success: false,
        error: error.response?.data?.message || error.message,
      });
    }
  }

  // 分析结果
  logInfo(`\n重复判定测试结果:`);
  attempts.forEach(attempt => {
    if (attempt.attempt === 1) {
      logInfo(`  第${attempt.attempt}次: ${attempt.success ? '成功' : '失败'} - ${attempt.message || attempt.error}`);
    } else {
      logInfo(`  第${attempt.attempt}次: ${attempt.success ? '成功(不应该)' : '被拒绝'} - ${attempt.message || attempt.error}`);
    }
  });

  // 验证：第一次应该成功，后续应该失败
  const firstSuccess = attempts[0].success === true;
  const subsequentBlocked = attempts.slice(1).every(a => a.success === false || a.code === 'ALREADY_JUDGED');

  const testPassed = firstSuccess && subsequentBlocked;

  if (testPassed) {
    logSuccess('防重复判定机制工作正常！');
  } else {
    if (!firstSuccess) {
      logError('第一次判定失败（不应该）');
    }
    if (!subsequentBlocked) {
      logError('后续重复判定未被阻止（不应该）');
    }
  }

  recordTest(
    '防重复判定机制',
    testPassed,
    !testPassed ? '重复判定未被正确阻止' : null
  );

  return attempts;
}

// 测试5: 用户统计准确性测试
async function testUserStatsAccuracy(user) {
  logSection('测试5: 用户统计准确性测试');

  logInfo(`验证用户 ${user.nickname} 的统计数据...`);

  try {
    // 获取用户信息
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    const userData = response.data.data;

    logInfo(`\n用户统计数据:`);
    logInfo(`  总判定数: ${userData.totalJudged}`);
    logInfo(`  正确数: ${userData.correctCount}`);
    logInfo(`  准确率: ${userData.accuracy.toFixed(2)}%`);
    logInfo(`  当前连胜: ${userData.streak}`);
    logInfo(`  最高连胜: ${userData.maxStreak}`);

    // 验证准确率计算
    const expectedAccuracy = userData.totalJudged > 0
      ? (userData.correctCount / userData.totalJudged) * 100
      : 0;

    const accuracyCorrect = Math.abs(userData.accuracy - expectedAccuracy) < 0.01;

    if (accuracyCorrect) {
      logSuccess('用户统计数据准确！');
    } else {
      logError(`准确率计算错误: 实际 ${userData.accuracy}, 预期 ${expectedAccuracy.toFixed(2)}`);
    }

    recordTest(
      '用户统计准确性',
      accuracyCorrect,
      !accuracyCorrect ? '准确率计算错误' : null
    );

    return userData;
  } catch (error) {
    logError(`获取用户统计失败: ${error.message}`);
    recordTest('用户统计准确性', false, error.message);
    return null;
  }
}

// 生成测试报告
function generateReport() {
  logSection('测试报告');

  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);

  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${colors.green}${testResults.passed}${colors.reset}`);
  console.log(`失败: ${colors.red}${testResults.failed}${colors.reset}`);
  console.log(`通过率: ${passRate >= 80 ? colors.green : colors.red}${passRate}%${colors.reset}`);

  if (testResults.errors.length > 0) {
    console.log(`\n${colors.red}失败的测试:${colors.reset}`);
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.test}`);
      console.log(`     ${colors.red}${error.error}${colors.reset}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  if (passRate >= 80) {
    logSuccess('测试通过！系统并发性能良好。');
  } else {
    logError('测试失败！系统存在并发问题。');
  }
}

// 主测试流程
async function runTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
  log('║                     并发测试 - 内容获取和判定提交                              ║', colors.bright + colors.cyan);
  log('╚═══════════════════════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);

  try {
    // 检查服务器连接
    logInfo('检查服务器连接...');
    try {
      const response = await axios.get(`${BASE_URL}/content/feed`, {
        timeout: 10000,
        params: { limit: 1 }
      });
      logSuccess('服务器连接正常');
      logInfo(`服务器响应状态: ${response.status}`);
    } catch (error) {
      logError(`无法连接到服务器 ${BASE_URL}`);
      logError(`错误: ${error.message}`);
      if (error.response) {
        logError(`响应状态: ${error.response.status}`);
        logError(`响应数据: ${JSON.stringify(error.response.data)}`);
      }
      logWarning('请确保后端服务正在运行 (npm run start:dev)');
      process.exit(1);
    }

    // 创建测试用户
    const users = await createTestUsers(CONCURRENT_USERS);

    if (users.length === 0) {
      logError('无法创建测试用户，测试终止');
      process.exit(1);
    }

    // 获取内容列表
    logInfo('获取内容列表...');
    const contentList = await getContentList(10);
    logSuccess(`获取到 ${contentList.length} 个内容`);

    if (contentList.length === 0) {
      logWarning('数据库中没有内容，某些测试将被跳过');
    }

    // 执行测试
    await testConcurrentGetContent(users);

    if (contentList.length > 0) {
      await testConcurrentSubmitJudgment(users, contentList);
      await testConcurrentGetHistory(users);

      // 使用第二个内容进行重复判定测试（避免与之前的测试冲突）
      if (contentList.length > 1) {
        await testDuplicateJudgment(users[0], contentList[1].id);
      }

      await testUserStatsAccuracy(users[0]);
    }

    // 生成报告
    generateReport();

  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  logError(`未捕获的错误: ${error.message}`);
  console.error(error);
  process.exit(1);
});
