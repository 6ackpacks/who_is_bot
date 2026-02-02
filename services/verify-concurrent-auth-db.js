/**
 * 验证并发认证测试后的数据库一致性
 *
 * 检查项:
 * 1. 用户数据完整性
 * 2. 统计数据准确性
 * 3. 是否有重复的 UID
 * 4. 数据是否正确更新
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

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

async function verifyDatabaseConsistency() {
  let connection;

  try {
    logSection('数据库一致性验证');

    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    log('数据库连接成功', colors.green);

    // 1. 检查测试用户数量
    log('\n1. 检查测试用户数量', colors.bright);
    const [testUsers] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE nickname LIKE 'TestUser%'"
    );
    log(`   找到 ${testUsers[0].count} 个测试用户`, colors.blue);

    // 2. 检查 UID 唯一性
    log('\n2. 检查 UID 唯一性', colors.bright);
    const [duplicateUids] = await connection.execute(`
      SELECT uid, COUNT(*) as count
      FROM users
      WHERE nickname LIKE 'TestUser%'
      GROUP BY uid
      HAVING count > 1
    `);

    if (duplicateUids.length === 0) {
      log('   ✓ 所有 UID 唯一', colors.green);
    } else {
      log(`   ✗ 发现 ${duplicateUids.length} 个重复的 UID`, colors.red);
      duplicateUids.forEach(row => {
        log(`     - UID: ${row.uid}, 重复次数: ${row.count}`, colors.yellow);
      });
    }

    // 3. 检查用户 ID 唯一性
    log('\n3. 检查用户 ID 唯一性', colors.bright);
    const [duplicateIds] = await connection.execute(`
      SELECT id, COUNT(*) as count
      FROM users
      WHERE nickname LIKE 'TestUser%'
      GROUP BY id
      HAVING count > 1
    `);

    if (duplicateIds.length === 0) {
      log('   ✓ 所有用户 ID 唯一', colors.green);
    } else {
      log(`   ✗ 发现 ${duplicateIds.length} 个重复的用户 ID`, colors.red);
    }

    // 4. 检查统计数据更新
    log('\n4. 检查统计数据更新', colors.bright);
    const [updatedStats] = await connection.execute(`
      SELECT
        nickname,
        accuracy,
        totalJudged,
        streak,
        correct_count,
        maxStreak
      FROM users
      WHERE nickname LIKE 'TestUser%'
      ORDER BY nickname
    `);

    let statsUpdatedCount = 0;
    let statsNotUpdatedCount = 0;
    const statsIssues = [];

    updatedStats.forEach((user, index) => {
      const expectedAccuracy = 75.5 + index;
      const expectedTotalJudged = 100 + index * 10;
      const expectedStreak = 5 + index;

      // 检查是否更新（允许小的浮点误差）
      const accuracyMatch = Math.abs(user.accuracy - expectedAccuracy) < 0.1;
      const totalJudgedMatch = user.totalJudged === expectedTotalJudged;
      const streakMatch = user.streak === expectedStreak;

      if (accuracyMatch && totalJudgedMatch && streakMatch) {
        statsUpdatedCount++;
      } else {
        statsNotUpdatedCount++;
        statsIssues.push({
          nickname: user.nickname,
          expected: { accuracy: expectedAccuracy, totalJudged: expectedTotalJudged, streak: expectedStreak },
          actual: { accuracy: user.accuracy, totalJudged: user.totalJudged, streak: user.streak },
        });
      }
    });

    log(`   已更新: ${statsUpdatedCount} 个用户`, colors.green);
    log(`   未更新: ${statsNotUpdatedCount} 个用户`, statsNotUpdatedCount > 0 ? colors.red : colors.green);

    if (statsIssues.length > 0) {
      log('\n   统计数据不匹配详情:', colors.yellow);
      statsIssues.slice(0, 5).forEach(issue => {
        log(`     ${issue.nickname}:`, colors.yellow);
        log(`       期望: accuracy=${issue.expected.accuracy}, totalJudged=${issue.expected.totalJudged}, streak=${issue.expected.streak}`, colors.yellow);
        log(`       实际: accuracy=${issue.actual.accuracy}, totalJudged=${issue.actual.totalJudged}, streak=${issue.actual.streak}`, colors.yellow);
      });
      if (statsIssues.length > 5) {
        log(`     ... 还有 ${statsIssues.length - 5} 个不匹配`, colors.yellow);
      }
    }

    // 5. 检查数据完整性
    log('\n5. 检查数据完整性', colors.bright);
    const [incompleteUsers] = await connection.execute(`
      SELECT nickname, id, uid, accuracy, totalJudged, streak
      FROM users
      WHERE nickname LIKE 'TestUser%'
        AND (id IS NULL OR uid IS NULL OR nickname IS NULL)
    `);

    if (incompleteUsers.length === 0) {
      log('   ✓ 所有用户数据完整', colors.green);
    } else {
      log(`   ✗ 发现 ${incompleteUsers.length} 个数据不完整的用户`, colors.red);
      incompleteUsers.forEach(user => {
        log(`     - ${user.nickname}: id=${user.id}, uid=${user.uid}`, colors.yellow);
      });
    }

    // 6. 检查时间戳
    log('\n6. 检查时间戳', colors.bright);
    const [timestamps] = await connection.execute(`
      SELECT
        nickname,
        createdAt,
        updatedAt,
        TIMESTAMPDIFF(SECOND, createdAt, updatedAt) as updateDelay
      FROM users
      WHERE nickname LIKE 'TestUser%'
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    log('   最近创建的用户:', colors.blue);
    timestamps.forEach(user => {
      log(`     ${user.nickname}: 创建=${user.createdAt}, 更新=${user.updatedAt}, 延迟=${user.updateDelay}秒`, colors.blue);
    });

    // 7. 统计汇总
    logSection('验证结果汇总');

    const allChecks = [
      { name: 'UID 唯一性', passed: duplicateUids.length === 0 },
      { name: '用户 ID 唯一性', passed: duplicateIds.length === 0 },
      { name: '统计数据更新', passed: statsNotUpdatedCount === 0 },
      { name: '数据完整性', passed: incompleteUsers.length === 0 },
    ];

    allChecks.forEach(check => {
      log(`  ${check.passed ? '✓' : '✗'} ${check.name}: ${check.passed ? '通过' : '失败'}`,
          check.passed ? colors.green : colors.red);
    });

    const allPassed = allChecks.every(check => check.passed);
    console.log('\n' + '='.repeat(80));
    log(allPassed ? '数据库一致性验证: 全部通过' : '数据库一致性验证: 存在问题',
        allPassed ? colors.green + colors.bright : colors.red + colors.bright);
    console.log('='.repeat(80) + '\n');

    // 8. 清理测试数据（可选）
    log('\n是否需要清理测试数据？', colors.yellow);
    log('运行以下命令清理:', colors.blue);
    log(`  DELETE FROM users WHERE nickname LIKE 'TestUser%';`, colors.cyan);

  } catch (error) {
    log(`\n错误: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('\n数据库连接已关闭', colors.blue);
    }
  }
}

// 运行验证
verifyDatabaseConsistency().catch((error) => {
  log(`\n未捕获的错误: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
