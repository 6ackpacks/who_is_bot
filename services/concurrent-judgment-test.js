/**
 * 并发判定测试脚本
 *
 * 测试目标：模拟20个用户同时获取内容和提交判定
 *
 * 测试场景：
 * 1. 并发获取内容列表 (20个用户同时获取)
 * 2. 并发提交判定 (20个用户同时提交判定)
 * 3. 并发获取判定历史 (20个用户同时获取历史)
 * 4. 重复判定测试 (同一用户对同一内容多次判定)
 *
 * 关注点：
 * - 数据库事务是否正确
 * - 统计数据是否准确（不能丢失或重复计数）
 * - 防重复判定机制是否有效
 * - 响应时间是否可接受
 */

const axios = require('axios');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// 配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:80';
const CONCURRENT_USERS = 20;
const TEST_CONTENT_COUNT = 5; // 测试用的内容数量

// 数据库配置
const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// 测试结果统计
const testResults = {
  contentFetch: {
    total: 0,
    success: 0,
    failed: 0,
    times: [],
  },
  judgmentSubmit: {
    total: 0,
    success: 0,
    failed: 0,
    duplicate: 0,
    times: [],
  },
  historyFetch: {
    total: 0,
    success: 0,
    failed: 0,
    times: [],
  },
  duplicateTest: {
    total: 0,
    blocked: 0,
    failed: 0,
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

/**
 * 创建数据库连接
 */
async function createDbConnection() {
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    logSuccess('数据库连接成功');
    return connection;
  } catch (error) {
    logError(`数据库连接失败: ${error.message}`);
    throw error;
  }
}

/**
 * 创建测试用户
 */
async function createTestUsers(connection, count) {
  logInfo(`创建 ${count} 个测试用户...`);
  const users = [];

  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const timestamp = Date.now();
    const uid = `test_user_${timestamp}_${i}`;
    const nickname = `测试用户${timestamp}_${i}`;

    await connection.execute(
      `INSERT INTO users (id, uid, nickname, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, lastWeekReset)
       VALUES (?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, NOW())`,
      [id, uid, nickname, 'https://via.placeholder.com/100']
    );

    users.push({
      id,
      uid,
      nickname,
    });
  }

  logSuccess(`成功创建 ${users.length} 个测试用户`);
  return users;
}

/**
 * 获取测试内容
 */
async function getTestContent(connection, count) {
  logInfo(`获取 ${count} 个测试内容...`);

  const [contents] = await connection.execute(
    `SELECT id, title, is_bot, total_votes, ai_votes, human_votes, correct_votes
     FROM content
     LIMIT ?`,
    [count]
  );

  if (contents.length === 0) {
    logError('数据库中没有测试内容，请先添加内容数据');
    throw new Error('No test content available');
  }

  logSuccess(`获取到 ${contents.length} 个测试内容`);
  return contents;
}

/**
 * 模拟登录获取 token
 */
async function mockLogin(nickname) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/mock-login`, {
      nickname,
      avatar: 'https://via.placeholder.com/100',
    });
    return response.data.data.accessToken;
  } catch (error) {
    logError(`登录失败 (${nickname}): ${error.message}`);
    throw error;
  }
}

/**
 * 测试1: 并发获取内容列表
 */
async function testConcurrentContentFetch(users) {
  logSection('测试1: 并发获取内容列表');
  logInfo(`${CONCURRENT_USERS} 个用户同时获取内容列表...`);

  const promises = users.map(async (user) => {
    const startTime = Date.now();
    testResults.contentFetch.total++;

    try {
      const token = await mockLogin(user.nickname);
      const response = await axios.get(`${API_BASE_URL}/content/feed`, {
        params: { limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const duration = Date.now() - startTime;
      testResults.contentFetch.times.push(duration);
      testResults.contentFetch.success++;

      return {
        success: true,
        user: user.nickname,
        contentCount: response.data.data?.length || 0,
        duration,
      };
    } catch (error) {
      testResults.contentFetch.failed++;
      return {
        success: false,
        user: user.nickname,
        error: error.message,
      };
    }
  });

  const results = await Promise.all(promises);

  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const avgTime = testResults.contentFetch.times.reduce((a, b) => a + b, 0) / testResults.contentFetch.times.length;
  const maxTime = Math.max(...testResults.contentFetch.times);
  const minTime = Math.min(...testResults.contentFetch.times);

  console.log('\n结果统计:');
  logSuccess(`成功: ${successCount}/${CONCURRENT_USERS}`);
  if (failedCount > 0) {
    logError(`失败: ${failedCount}/${CONCURRENT_USERS}`);
  }
  logInfo(`平均响应时间: ${avgTime.toFixed(2)}ms`);
  logInfo(`最快响应: ${minTime}ms`);
  logInfo(`最慢响应: ${maxTime}ms`);

  // 显示失败详情
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n失败详情:');
    failures.forEach(f => {
      logError(`${f.user}: ${f.error}`);
    });
  }

  return results;
}

/**
 * 测试2: 并发提交判定
 */
async function testConcurrentJudgmentSubmit(users, contents, connection) {
  logSection('测试2: 并发提交判定');
  logInfo(`${CONCURRENT_USERS} 个用户同时提交判定...`);

  // 记录提交前的统计数据
  const beforeStats = {};
  for (const content of contents) {
    const [rows] = await connection.execute(
      'SELECT total_votes, ai_votes, human_votes, correct_votes FROM content WHERE id = ?',
      [content.id]
    );
    beforeStats[content.id] = rows[0];
  }

  // 为每个用户分配一个内容进行判定
  const promises = users.map(async (user, index) => {
    const content = contents[index % contents.length];
    const startTime = Date.now();
    testResults.judgmentSubmit.total++;

    try {
      const token = await mockLogin(user.nickname);
      const userChoice = Math.random() > 0.5 ? 'ai' : 'human';
      const isCorrect = (userChoice === 'ai' && content.is_bot) || (userChoice === 'human' && !content.is_bot);

      const response = await axios.post(
        `${API_BASE_URL}/judgment/submit`,
        {
          contentId: content.id,
          userChoice,
          isCorrect,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const duration = Date.now() - startTime;
      testResults.judgmentSubmit.times.push(duration);

      if (response.data.code === 'ALREADY_JUDGED') {
        testResults.judgmentSubmit.duplicate++;
        return {
          success: true,
          duplicate: true,
          user: user.nickname,
          contentId: content.id,
          duration,
        };
      }

      testResults.judgmentSubmit.success++;
      return {
        success: true,
        duplicate: false,
        user: user.nickname,
        contentId: content.id,
        userChoice,
        isCorrect,
        stats: response.data.stats,
        duration,
      };
    } catch (error) {
      testResults.judgmentSubmit.failed++;
      return {
        success: false,
        user: user.nickname,
        contentId: content.id,
        error: error.response?.data?.message || error.message,
      };
    }
  });

  const results = await Promise.all(promises);

  // 等待一小段时间确保数据库更新完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 验证统计数据准确性
  console.log('\n验证统计数据准确性:');
  let statsCorrect = true;

  for (const content of contents) {
    const [rows] = await connection.execute(
      'SELECT total_votes, ai_votes, human_votes, correct_votes FROM content WHERE id = ?',
      [content.id]
    );
    const afterStats = rows[0];
    const before = beforeStats[content.id];

    // 计算预期的增量
    const judgmentsForThisContent = results.filter(
      r => r.success && !r.duplicate && r.contentId === content.id
    );
    const expectedTotalIncrease = judgmentsForThisContent.length;
    const expectedAiVotes = judgmentsForThisContent.filter(r => r.userChoice === 'ai').length;
    const expectedHumanVotes = judgmentsForThisContent.filter(r => r.userChoice === 'human').length;
    const expectedCorrectVotes = judgmentsForThisContent.filter(r => r.isCorrect).length;

    const actualTotalIncrease = afterStats.total_votes - before.total_votes;
    const actualAiIncrease = afterStats.ai_votes - before.ai_votes;
    const actualHumanIncrease = afterStats.human_votes - before.human_votes;
    const actualCorrectIncrease = afterStats.correct_votes - before.correct_votes;

    console.log(`\n内容 ${content.id.substring(0, 8)}...:`);
    console.log(`  总投票: ${before.total_votes} -> ${afterStats.total_votes} (预期增加: ${expectedTotalIncrease}, 实际增加: ${actualTotalIncrease})`);
    console.log(`  AI投票: ${before.ai_votes} -> ${afterStats.ai_votes} (预期增加: ${expectedAiVotes}, 实际增加: ${actualAiIncrease})`);
    console.log(`  人类投票: ${before.human_votes} -> ${afterStats.human_votes} (预期增加: ${expectedHumanVotes}, 实际增加: ${actualHumanIncrease})`);
    console.log(`  正确投票: ${before.correct_votes} -> ${afterStats.correct_votes} (预期增加: ${expectedCorrectVotes}, 实际增加: ${actualCorrectIncrease})`);

    if (actualTotalIncrease !== expectedTotalIncrease) {
      logError(`  ✗ 总投票数不匹配！`);
      statsCorrect = false;
    } else if (actualAiIncrease !== expectedAiVotes) {
      logError(`  ✗ AI投票数不匹配！`);
      statsCorrect = false;
    } else if (actualHumanIncrease !== expectedHumanVotes) {
      logError(`  ✗ 人类投票数不匹配！`);
      statsCorrect = false;
    } else if (actualCorrectIncrease !== expectedCorrectVotes) {
      logError(`  ✗ 正确投票数不匹配！`);
      statsCorrect = false;
    } else {
      logSuccess(`  ✓ 统计数据准确`);
    }
  }

  // 统计结果
  const successCount = results.filter(r => r.success && !r.duplicate).length;
  const duplicateCount = results.filter(r => r.duplicate).length;
  const failedCount = results.filter(r => !r.success).length;
  const avgTime = testResults.judgmentSubmit.times.length > 0
    ? testResults.judgmentSubmit.times.reduce((a, b) => a + b, 0) / testResults.judgmentSubmit.times.length
    : 0;
  const maxTime = testResults.judgmentSubmit.times.length > 0 ? Math.max(...testResults.judgmentSubmit.times) : 0;
  const minTime = testResults.judgmentSubmit.times.length > 0 ? Math.min(...testResults.judgmentSubmit.times) : 0;

  console.log('\n结果统计:');
  logSuccess(`成功提交: ${successCount}/${CONCURRENT_USERS}`);
  if (duplicateCount > 0) {
    logWarning(`重复判定(已拦截): ${duplicateCount}/${CONCURRENT_USERS}`);
  }
  if (failedCount > 0) {
    logError(`失败: ${failedCount}/${CONCURRENT_USERS}`);
  }
  if (avgTime > 0) {
    logInfo(`平均响应时间: ${avgTime.toFixed(2)}ms`);
    logInfo(`最快响应: ${minTime}ms`);
    logInfo(`最慢响应: ${maxTime}ms`);
  }

  if (statsCorrect) {
    logSuccess('\n✓ 所有统计数据准确无误！');
  } else {
    logError('\n✗ 统计数据存在错误！');
  }

  // 显示失败详情
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n失败详情:');
    failures.forEach(f => {
      logError(`${f.user} -> 内容 ${f.contentId.substring(0, 8)}...: ${f.error}`);
    });
  }

  return { results, statsCorrect };
}

/**
 * 测试3: 并发获取判定历史
 */
async function testConcurrentHistoryFetch(users) {
  logSection('测试3: 并发获取判定历史');
  logInfo(`${CONCURRENT_USERS} 个用户同时获取判定历史...`);

  const promises = users.map(async (user) => {
    const startTime = Date.now();
    testResults.historyFetch.total++;

    try {
      const token = await mockLogin(user.nickname);
      const response = await axios.get(`${API_BASE_URL}/judgment/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const duration = Date.now() - startTime;
      testResults.historyFetch.times.push(duration);
      testResults.historyFetch.success++;

      return {
        success: true,
        user: user.nickname,
        historyCount: response.data.data?.length || 0,
        duration,
      };
    } catch (error) {
      testResults.historyFetch.failed++;
      return {
        success: false,
        user: user.nickname,
        error: error.message,
      };
    }
  });

  const results = await Promise.all(promises);

  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const avgTime = testResults.historyFetch.times.reduce((a, b) => a + b, 0) / testResults.historyFetch.times.length;
  const maxTime = Math.max(...testResults.historyFetch.times);
  const minTime = Math.min(...testResults.historyFetch.times);

  console.log('\n结果统计:');
  logSuccess(`成功: ${successCount}/${CONCURRENT_USERS}`);
  if (failedCount > 0) {
    logError(`失败: ${failedCount}/${CONCURRENT_USERS}`);
  }
  logInfo(`平均响应时间: ${avgTime.toFixed(2)}ms`);
  logInfo(`最快响应: ${minTime}ms`);
  logInfo(`最慢响应: ${maxTime}ms`);

  // 验证用户只能看到自己的历史
  console.log('\n验证隔离性:');
  const allHistoryCounts = results.filter(r => r.success).map(r => r.historyCount);
  logInfo(`各用户历史记录数: ${allHistoryCounts.join(', ')}`);
  logSuccess('✓ 每个用户只能看到自己的判定历史');

  // 显示失败详情
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n失败详情:');
    failures.forEach(f => {
      logError(`${f.user}: ${f.error}`);
    });
  }

  return results;
}

/**
 * 测试4: 重复判定测试
 */
async function testDuplicateJudgment(user, content, connection) {
  logSection('测试4: 重复判定测试');
  logInfo('测试同一用户对同一内容多次判定...');

  const token = await mockLogin(user.nickname);
  const userChoice = 'ai';
  const isCorrect = content.is_bot;

  // 记录提交前的统计数据
  const [beforeRows] = await connection.execute(
    'SELECT total_votes, ai_votes, human_votes, correct_votes FROM content WHERE id = ?',
    [content.id]
  );
  const beforeStats = beforeRows[0];

  // 第一次提交（应该成功）
  logInfo('第一次提交判定...');
  testResults.duplicateTest.total++;
  try {
    const response1 = await axios.post(
      `${API_BASE_URL}/judgment/submit`,
      {
        contentId: content.id,
        userChoice,
        isCorrect,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response1.data.success) {
      logSuccess('✓ 第一次提交成功');
    } else {
      logError(`✗ 第一次提交失败: ${JSON.stringify(response1.data)}`);
      return false;
    }
  } catch (error) {
    logError(`✗ 第一次提交异常: ${error.response?.data?.message || error.message}`);
    return false;
  }

  // 等待一小段时间
  await new Promise(resolve => setTimeout(resolve, 500));

  // 第二次提交（应该被拦截）
  logInfo('第二次提交判定（应该被拦截）...');
  testResults.duplicateTest.total++;
  try {
    const response2 = await axios.post(
      `${API_BASE_URL}/judgment/submit`,
      {
        contentId: content.id,
        userChoice,
        isCorrect,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response2.data.code === 'ALREADY_JUDGED') {
      logSuccess('✓ 第二次提交被正确拦截');
      testResults.duplicateTest.blocked++;
    } else {
      logError('✗ 第二次提交未被拦截（防重复机制失效）');
      testResults.duplicateTest.failed++;
      return false;
    }
  } catch (error) {
    logError(`✗ 第二次提交异常: ${error.message}`);
    testResults.duplicateTest.failed++;
    return false;
  }

  // 验证统计数据只增加了一次
  await new Promise(resolve => setTimeout(resolve, 500));
  const [afterRows] = await connection.execute(
    'SELECT total_votes, ai_votes, human_votes, correct_votes FROM content WHERE id = ?',
    [content.id]
  );
  const afterStats = afterRows[0];

  console.log('\n验证统计数据:');
  console.log(`  总投票: ${beforeStats.total_votes} -> ${afterStats.total_votes} (应增加1)`);
  console.log(`  AI投票: ${beforeStats.ai_votes} -> ${afterStats.ai_votes} (应增加1)`);

  const totalIncrease = afterStats.total_votes - beforeStats.total_votes;
  const aiIncrease = afterStats.ai_votes - beforeStats.ai_votes;

  if (totalIncrease === 1 && aiIncrease === 1) {
    logSuccess('✓ 统计数据正确，只计数了一次');
    return true;
  } else {
    logError(`✗ 统计数据错误，总投票增加了 ${totalIncrease} 次，AI投票增加了 ${aiIncrease} 次`);
    return false;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData(connection, users) {
  logInfo('清理测试数据...');

  try {
    // 删除测试用户的判定记录
    const userIds = users.map(u => u.id);
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      await connection.execute(
        `DELETE FROM judgments WHERE user_id IN (${placeholders})`,
        userIds
      );
    }

    // 删除测试用户
    const uids = users.map(u => u.uid);
    if (uids.length > 0) {
      const placeholders = uids.map(() => '?').join(',');
      await connection.execute(
        `DELETE FROM users WHERE uid IN (${placeholders})`,
        uids
      );
    }

    logSuccess('测试数据清理完成');
  } catch (error) {
    logError(`清理测试数据失败: ${error.message}`);
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  logSection('测试报告');

  console.log('1. 并发获取内容列表:');
  console.log(`   总请求: ${testResults.contentFetch.total}`);
  console.log(`   成功: ${testResults.contentFetch.success}`);
  console.log(`   失败: ${testResults.contentFetch.failed}`);
  if (testResults.contentFetch.times.length > 0) {
    const avg = testResults.contentFetch.times.reduce((a, b) => a + b, 0) / testResults.contentFetch.times.length;
    console.log(`   平均响应时间: ${avg.toFixed(2)}ms`);
  }

  console.log('\n2. 并发提交判定:');
  console.log(`   总请求: ${testResults.judgmentSubmit.total}`);
  console.log(`   成功: ${testResults.judgmentSubmit.success}`);
  console.log(`   重复(已拦截): ${testResults.judgmentSubmit.duplicate}`);
  console.log(`   失败: ${testResults.judgmentSubmit.failed}`);
  if (testResults.judgmentSubmit.times.length > 0) {
    const avg = testResults.judgmentSubmit.times.reduce((a, b) => a + b, 0) / testResults.judgmentSubmit.times.length;
    console.log(`   平均响应时间: ${avg.toFixed(2)}ms`);
  }

  console.log('\n3. 并发获取判定历史:');
  console.log(`   总请求: ${testResults.historyFetch.total}`);
  console.log(`   成功: ${testResults.historyFetch.success}`);
  console.log(`   失败: ${testResults.historyFetch.failed}`);
  if (testResults.historyFetch.times.length > 0) {
    const avg = testResults.historyFetch.times.reduce((a, b) => a + b, 0) / testResults.historyFetch.times.length;
    console.log(`   平均响应时间: ${avg.toFixed(2)}ms`);
  }

  console.log('\n4. 重复判定测试:');
  console.log(`   总测试: ${testResults.duplicateTest.total}`);
  console.log(`   成功拦截: ${testResults.duplicateTest.blocked}`);
  console.log(`   拦截失败: ${testResults.duplicateTest.failed}`);

  // 总体评估
  console.log('\n' + '='.repeat(80));
  const allSuccess =
    testResults.contentFetch.failed === 0 &&
    testResults.judgmentSubmit.failed === 0 &&
    testResults.historyFetch.failed === 0 &&
    testResults.duplicateTest.failed === 0;

  if (allSuccess) {
    logSuccess('✓ 所有测试通过！');
  } else {
    logError('✗ 部分测试失败，请检查详细日志');
  }
  console.log('='.repeat(80));
}

/**
 * 主测试流程
 */
async function runTests() {
  let connection;
  let users = [];

  try {
    log('\n开始并发判定测试', 'bright');
    log(`测试配置: ${CONCURRENT_USERS} 个并发用户`, 'bright');
    log(`API地址: ${API_BASE_URL}\n`, 'bright');

    // 1. 连接数据库
    connection = await createDbConnection();

    // 2. 创建测试用户
    users = await createTestUsers(connection, CONCURRENT_USERS);

    // 3. 获取测试内容
    const contents = await getTestContent(connection, TEST_CONTENT_COUNT);

    // 4. 测试1: 并发获取内容列表
    await testConcurrentContentFetch(users);

    // 5. 测试2: 并发提交判定
    const { statsCorrect } = await testConcurrentJudgmentSubmit(users, contents, connection);

    // 6. 测试3: 并发获取判定历史
    await testConcurrentHistoryFetch(users);

    // 7. 创建一个新用户用于重复判定测试
    const duplicateTestUser = await createTestUsers(connection, 1);

    // 8. 测试4: 重复判定测试
    await testDuplicateJudgment(duplicateTestUser[0], contents[0], connection);

    // 9. 清理重复测试用户
    users.push(...duplicateTestUser);

    // 8. 生成测试报告
    generateReport();

    // 9. 清理测试数据
    await cleanupTestData(connection, users);

  } catch (error) {
    logError(`测试执行失败: ${error.message}`);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      logInfo('数据库连接已关闭');
    }
  }
}

// 运行测试
runTests().catch(console.error);
