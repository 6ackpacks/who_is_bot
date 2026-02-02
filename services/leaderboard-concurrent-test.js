/**
 * 排行榜和统计功能并发测试
 *
 * 测试目标: 模拟20个用户同时访问排行榜和统计功能
 *
 * 测试场景:
 * 1. 并发获取排行榜 (20个用户同时获取)
 * 2. 并发更新用户统计 (20个用户同时更新)
 * 3. 混合场景测试 (同时进行判定提交和排行榜查询)
 * 4. 压力测试 (快速连续请求)
 */

const http = require('http');
const https = require('https');

// 配置
const CONFIG = {
  host: 'localhost',
  port: 80,
  protocol: 'http:',
  concurrentUsers: 20,
  stressTestIterations: 5,
};

// 测试结果统计
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  errors: [],
  responseTimes: [],
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

/**
 * 发送 HTTP 请求
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = options.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          stats.totalRequests++;
          stats.successfulRequests++;
          stats.totalResponseTime += responseTime;
          stats.responseTimes.push(responseTime);
          stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
          stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);

          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null,
            responseTime,
          });
        } else {
          stats.totalRequests++;
          stats.failedRequests++;
          stats.totalResponseTime += responseTime;
          stats.responseTimes.push(responseTime);
          stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
          stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);

          stats.errors.push({
            statusCode: res.statusCode,
            message: data,
            endpoint: options.path,
          });
          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null,
            responseTime,
            error: true,
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      stats.totalRequests++;
      stats.failedRequests++;
      stats.errors.push({
        message: error.message,
        endpoint: options.path,
      });

      reject({
        error: error.message,
        responseTime,
      });
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }

    req.end();
  });
}

/**
 * 测试1: 并发获取排行榜
 */
async function testConcurrentLeaderboard() {
  logSection('测试1: 并发获取排行榜');
  logInfo(`模拟 ${CONFIG.concurrentUsers} 个用户同时获取排行榜...`);

  const limits = [10, 20, 50, 100];
  const promises = [];

  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    const limit = limits[i % limits.length];
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: `/user/leaderboard/top?limit=${limit}`,
      method: 'GET',
      protocol: CONFIG.protocol,
    };

    promises.push(
      makeRequest(options)
        .then((result) => ({
          userId: i + 1,
          limit,
          ...result,
        }))
        .catch((error) => ({
          userId: i + 1,
          limit,
          error: true,
          ...error,
        }))
    );
  }

  const results = await Promise.all(promises);

  // 分析结果
  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  logInfo(`成功: ${successful.length}/${CONFIG.concurrentUsers}`);
  logInfo(`失败: ${failed.length}/${CONFIG.concurrentUsers}`);

  if (successful.length > 0) {
    const avgResponseTime =
      successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

    // 检查数据一致性
    const leaderboards = successful.map((r) => r.data?.data || r.data);
    const firstLeaderboard = leaderboards[0];

    if (firstLeaderboard && Array.isArray(firstLeaderboard)) {
      logSuccess(`排行榜数据格式正确，包含 ${firstLeaderboard.length} 条记录`);

      // 检查所有排行榜的前10名是否一致
      const top10Consistent = leaderboards.every((lb) => {
        if (!Array.isArray(lb) || lb.length === 0) return false;
        const top10 = lb.slice(0, Math.min(10, lb.length));
        const firstTop10 = firstLeaderboard.slice(0, Math.min(10, firstLeaderboard.length));
        return (
          top10.length === firstTop10.length &&
          top10.every((user, idx) => user.id === firstTop10[idx].id)
        );
      });

      if (top10Consistent) {
        logSuccess('排行榜数据一致性检查通过');
      } else {
        logWarning('排行榜数据一致性检查失败 - 不同请求返回的排序不一致');
      }

      // 显示示例数据
      logInfo('\n排行榜前3名示例:');
      firstLeaderboard.slice(0, 3).forEach((user, idx) => {
        console.log(
          `  ${idx + 1}. ${user.nickname} - 准确率: ${user.weeklyAccuracy || user.accuracy}%, 判定数: ${user.totalJudged}`
        );
      });
    }
  }

  if (failed.length > 0) {
    logError(`\n失败的请求:`);
    failed.forEach((f) => {
      console.log(`  用户 ${f.userId}: ${f.error}`);
    });
  }

  return { successful: successful.length, failed: failed.length, results };
}

/**
 * 测试2: 并发获取用户统计
 */
async function testConcurrentUserStats() {
  logSection('测试2: 并发获取用户统计');
  logInfo(`模拟 ${CONFIG.concurrentUsers} 个用户同时获取统计信息...`);

  // 首先获取一些用户ID
  const leaderboardOptions = {
    hostname: CONFIG.host,
    port: CONFIG.port,
    path: '/user/leaderboard/top?limit=50',
    method: 'GET',
    protocol: CONFIG.protocol,
  };

  let userIds = [];
  try {
    const leaderboardResult = await makeRequest(leaderboardOptions);
    const users = leaderboardResult.data?.data || leaderboardResult.data || [];
    userIds = users.map((u) => u.id).slice(0, CONFIG.concurrentUsers);

    if (userIds.length === 0) {
      logWarning('没有找到用户数据，跳过此测试');
      return { successful: 0, failed: 0, results: [] };
    }

    logInfo(`获取到 ${userIds.length} 个用户ID`);
  } catch (error) {
    logError(`获取用户列表失败: ${error.message || error.error}`);
    return { successful: 0, failed: 0, results: [] };
  }

  // 并发获取用户统计
  const promises = userIds.map((userId, index) => {
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: `/user/${userId}/stats`,
      method: 'GET',
      protocol: CONFIG.protocol,
    };

    return makeRequest(options)
      .then((result) => ({
        userId,
        index: index + 1,
        ...result,
      }))
      .catch((error) => ({
        userId,
        index: index + 1,
        error: true,
        ...error,
      }));
  });

  const results = await Promise.all(promises);

  // 分析结果
  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  logInfo(`成功: ${successful.length}/${userIds.length}`);
  logInfo(`失败: ${failed.length}/${userIds.length}`);

  if (successful.length > 0) {
    const avgResponseTime =
      successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

    // 显示示例统计数据
    logInfo('\n用户统计示例 (前3个):');
    successful.slice(0, 3).forEach((result) => {
      const stats = result.data?.data || result.data;
      if (stats) {
        console.log(`  用户 ${result.index}:`);
        console.log(`    总判定: ${stats.totalJudged}`);
        console.log(`    准确率: ${stats.accuracy}%`);
        console.log(`    连胜: ${stats.streak} (最高: ${stats.maxStreak})`);
        console.log(`    等级: ${stats.levelName || stats.level}`);
      }
    });
  }

  if (failed.length > 0) {
    logError(`\n失败的请求:`);
    failed.slice(0, 5).forEach((f) => {
      console.log(`  用户 ${f.index}: ${f.error}`);
    });
  }

  return { successful: successful.length, failed: failed.length, results };
}

/**
 * 测试3: 混合场景测试
 * 注意: 判定提交需要认证，这里只测试排行榜查询的混合场景
 */
async function testMixedScenario() {
  logSection('测试3: 混合场景测试');
  logInfo('同时进行排行榜查询和用户统计查询...');

  const halfUsers = Math.floor(CONFIG.concurrentUsers / 2);
  const promises = [];

  // 一半用户查询排行榜
  for (let i = 0; i < halfUsers; i++) {
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: `/user/leaderboard/top?limit=50`,
      method: 'GET',
      protocol: CONFIG.protocol,
    };

    promises.push(
      makeRequest(options)
        .then((result) => ({
          type: 'leaderboard',
          userId: i + 1,
          ...result,
        }))
        .catch((error) => ({
          type: 'leaderboard',
          userId: i + 1,
          error: true,
          ...error,
        }))
    );
  }

  // 获取用户ID用于统计查询
  let userIds = [];
  try {
    const leaderboardOptions = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: '/user/leaderboard/top?limit=50',
      method: 'GET',
      protocol: CONFIG.protocol,
    };
    const leaderboardResult = await makeRequest(leaderboardOptions);
    const users = leaderboardResult.data?.data || leaderboardResult.data || [];
    userIds = users.map((u) => u.id).slice(0, halfUsers);
  } catch (error) {
    logWarning('无法获取用户ID，使用模拟ID');
  }

  // 另一半用户查询统计
  for (let i = 0; i < halfUsers && i < userIds.length; i++) {
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: `/user/${userIds[i]}/stats`,
      method: 'GET',
      protocol: CONFIG.protocol,
    };

    promises.push(
      makeRequest(options)
        .then((result) => ({
          type: 'stats',
          userId: halfUsers + i + 1,
          ...result,
        }))
        .catch((error) => ({
          type: 'stats',
          userId: halfUsers + i + 1,
          error: true,
          ...error,
        }))
    );
  }

  const results = await Promise.all(promises);

  // 分析结果
  const leaderboardResults = results.filter((r) => r.type === 'leaderboard');
  const statsResults = results.filter((r) => r.type === 'stats');

  const leaderboardSuccess = leaderboardResults.filter((r) => !r.error).length;
  const statsSuccess = statsResults.filter((r) => !r.error).length;

  logInfo(`排行榜查询: ${leaderboardSuccess}/${leaderboardResults.length} 成功`);
  logInfo(`统计查询: ${statsSuccess}/${statsResults.length} 成功`);

  const allSuccessful = results.filter((r) => !r.error);
  if (allSuccessful.length > 0) {
    const avgResponseTime =
      allSuccessful.reduce((sum, r) => sum + r.responseTime, 0) / allSuccessful.length;
    logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

    const leaderboardAvg =
      leaderboardResults
        .filter((r) => !r.error)
        .reduce((sum, r) => sum + r.responseTime, 0) / leaderboardSuccess || 0;
    const statsAvg =
      statsResults.filter((r) => !r.error).reduce((sum, r) => sum + r.responseTime, 0) /
        statsSuccess || 0;

    logInfo(`排行榜平均响应: ${leaderboardAvg.toFixed(2)}ms`);
    logInfo(`统计平均响应: ${statsAvg.toFixed(2)}ms`);
  }

  return {
    successful: allSuccessful.length,
    failed: results.length - allSuccessful.length,
    results,
  };
}

/**
 * 测试4: 压力测试
 */
async function testStressTest() {
  logSection('测试4: 压力测试');
  logInfo(
    `每个用户连续发送 ${CONFIG.stressTestIterations} 次请求，总共 ${CONFIG.concurrentUsers * CONFIG.stressTestIterations} 次请求...`
  );

  const allPromises = [];

  for (let user = 0; user < CONFIG.concurrentUsers; user++) {
    for (let iteration = 0; iteration < CONFIG.stressTestIterations; iteration++) {
      const options = {
        hostname: CONFIG.host,
        port: CONFIG.port,
        path: `/user/leaderboard/top?limit=50`,
        method: 'GET',
        protocol: CONFIG.protocol,
      };

      allPromises.push(
        makeRequest(options)
          .then((result) => ({
            userId: user + 1,
            iteration: iteration + 1,
            ...result,
          }))
          .catch((error) => ({
            userId: user + 1,
            iteration: iteration + 1,
            error: true,
            ...error,
          }))
      );
    }
  }

  const startTime = Date.now();
  const results = await Promise.all(allPromises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // 分析结果
  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  logInfo(`总请求数: ${results.length}`);
  logInfo(`成功: ${successful.length}`);
  logInfo(`失败: ${failed.length}`);
  logInfo(`总耗时: ${totalTime}ms`);
  logInfo(`吞吐量: ${((results.length / totalTime) * 1000).toFixed(2)} 请求/秒`);

  if (successful.length > 0) {
    const avgResponseTime =
      successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    logInfo(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);

    // 计算百分位数
    const sortedTimes = successful.map((r) => r.responseTime).sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    logInfo(`响应时间 P50: ${p50}ms`);
    logInfo(`响应时间 P95: ${p95}ms`);
    logInfo(`响应时间 P99: ${p99}ms`);
  }

  // 检查是否有性能下降
  const firstBatch = successful.slice(0, CONFIG.concurrentUsers);
  const lastBatch = successful.slice(-CONFIG.concurrentUsers);

  if (firstBatch.length > 0 && lastBatch.length > 0) {
    const firstAvg = firstBatch.reduce((sum, r) => sum + r.responseTime, 0) / firstBatch.length;
    const lastAvg = lastBatch.reduce((sum, r) => sum + r.responseTime, 0) / lastBatch.length;
    const degradation = ((lastAvg - firstAvg) / firstAvg) * 100;

    if (degradation > 20) {
      logWarning(`性能下降: ${degradation.toFixed(2)}% (首批: ${firstAvg.toFixed(2)}ms, 末批: ${lastAvg.toFixed(2)}ms)`);
    } else {
      logSuccess(`性能稳定: 首批 ${firstAvg.toFixed(2)}ms, 末批 ${lastAvg.toFixed(2)}ms`);
    }
  }

  return { successful: successful.length, failed: failed.length, results };
}

/**
 * 生成测试报告
 */
function generateReport(testResults) {
  logSection('测试报告');

  // 总体统计
  log('\n【总体统计】', colors.bright);
  console.log(`  总请求数: ${stats.totalRequests}`);
  console.log(`  成功请求: ${stats.successfulRequests} (${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`  失败请求: ${stats.failedRequests} (${((stats.failedRequests / stats.totalRequests) * 100).toFixed(2)}%)`);

  // 响应时间统计
  log('\n【响应时间统计】', colors.bright);
  const avgResponseTime = stats.totalResponseTime / stats.totalRequests;
  console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`  最小响应时间: ${stats.minResponseTime}ms`);
  console.log(`  最大响应时间: ${stats.maxResponseTime}ms`);

  if (stats.responseTimes.length > 0) {
    const sortedTimes = stats.responseTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    console.log(`  P50: ${p50}ms`);
    console.log(`  P95: ${p95}ms`);
    console.log(`  P99: ${p99}ms`);
  }

  // 各测试场景结果
  log('\n【测试场景结果】', colors.bright);
  testResults.forEach((result, index) => {
    console.log(`  测试 ${index + 1}: 成功 ${result.successful}, 失败 ${result.failed}`);
  });

  // 错误统计
  if (stats.errors.length > 0) {
    log('\n【错误统计】', colors.bright);
    const errorTypes = {};
    stats.errors.forEach((error) => {
      const key = error.statusCode || error.message;
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });

    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} 次`);
    });

    // 显示前5个错误详情
    log('\n【错误详情 (前5个)】', colors.bright);
    stats.errors.slice(0, 5).forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.endpoint || 'Unknown'}`);
      console.log(`     状态码: ${error.statusCode || 'N/A'}`);
      console.log(`     消息: ${error.message || 'N/A'}`);
    });
  }

  // 性能评估
  log('\n【性能评估】', colors.bright);
  if (avgResponseTime < 100) {
    logSuccess('响应时间优秀 (< 100ms)');
  } else if (avgResponseTime < 300) {
    logInfo('响应时间良好 (100-300ms)');
  } else if (avgResponseTime < 1000) {
    logWarning('响应时间一般 (300-1000ms)');
  } else {
    logError('响应时间较慢 (> 1000ms)');
  }

  const successRate = (stats.successfulRequests / stats.totalRequests) * 100;
  if (successRate === 100) {
    logSuccess('成功率: 100%');
  } else if (successRate >= 95) {
    logInfo(`成功率: ${successRate.toFixed(2)}%`);
  } else if (successRate >= 90) {
    logWarning(`成功率: ${successRate.toFixed(2)}%`);
  } else {
    logError(`成功率: ${successRate.toFixed(2)}%`);
  }

  // 建议
  log('\n【优化建议】', colors.bright);
  if (avgResponseTime > 300) {
    console.log('  • 考虑为排行榜查询添加缓存（Redis）');
    console.log('  • 检查数据库索引是否优化');
  }
  if (stats.maxResponseTime > 1000) {
    console.log('  • 存在慢查询，建议分析数据库查询性能');
  }
  if (stats.failedRequests > 0) {
    console.log('  • 检查错误日志，修复失败的请求');
  }
  if (successRate < 100) {
    console.log('  • 提高系统稳定性和容错能力');
  }

  console.log('  • 建议添加数据库连接池配置');
  console.log('  • 考虑实现排行榜数据的定时预计算');
  console.log('  • 为高频查询接口添加 CDN 缓存');
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n' + '█'.repeat(80), colors.bright + colors.cyan);
  log('排行榜和统计功能并发测试', colors.bright + colors.cyan);
  log('█'.repeat(80) + '\n', colors.bright + colors.cyan);

  logInfo(`测试配置:`);
  console.log(`  服务器: ${CONFIG.protocol}//${CONFIG.host}:${CONFIG.port}`);
  console.log(`  并发用户数: ${CONFIG.concurrentUsers}`);
  console.log(`  压力测试迭代: ${CONFIG.stressTestIterations}`);
  console.log('');

  const testResults = [];

  try {
    // 测试1: 并发获取排行榜
    const test1Result = await testConcurrentLeaderboard();
    testResults.push(test1Result);

    // 等待一下，避免请求过于密集
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 测试2: 并发获取用户统计
    const test2Result = await testConcurrentUserStats();
    testResults.push(test2Result);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 测试3: 混合场景测试
    const test3Result = await testMixedScenario();
    testResults.push(test3Result);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 测试4: 压力测试
    const test4Result = await testStressTest();
    testResults.push(test4Result);

    // 生成报告
    generateReport(testResults);

    log('\n' + '█'.repeat(80), colors.bright + colors.green);
    log('测试完成！', colors.bright + colors.green);
    log('█'.repeat(80) + '\n', colors.bright + colors.green);
  } catch (error) {
    logError(`\n测试执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
