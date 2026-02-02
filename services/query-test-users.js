/**
 * 查询测试用户的实际数据
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

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

async function queryTestUsers() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    log('\n查询测试用户数据...', colors.cyan);

    const [users] = await connection.execute(`
      SELECT
        nickname,
        id,
        uid,
        accuracy,
        totalJudged,
        streak,
        maxStreak,
        correct_count,
        createdAt,
        updatedAt
      FROM users
      WHERE nickname LIKE 'TestUser%'
      ORDER BY CAST(SUBSTRING(nickname, 9) AS UNSIGNED)
    `);

    console.log('\n' + '='.repeat(100));
    log('测试用户数据详情', colors.bright + colors.cyan);
    console.log('='.repeat(100));

    console.log('\n序号 | 昵称        | Accuracy | TotalJudged | Streak | MaxStreak | CorrectCount | 创建时间');
    console.log('-'.repeat(100));

    users.forEach((user, index) => {
      const expectedAccuracy = 75.5 + index;
      const expectedTotalJudged = 100 + index * 10;
      const expectedStreak = 5 + index;

      const accuracyMatch = Math.abs(user.accuracy - expectedAccuracy) < 0.1;
      const totalJudgedMatch = user.totalJudged === expectedTotalJudged;
      const streakMatch = user.streak === expectedStreak;

      const color = (accuracyMatch && totalJudgedMatch && streakMatch) ? colors.green : colors.yellow;

      log(
        `${String(index + 1).padStart(4)} | ${user.nickname.padEnd(11)} | ` +
        `${String(user.accuracy).padStart(8)} | ${String(user.totalJudged).padStart(11)} | ` +
        `${String(user.streak).padStart(6)} | ${String(user.maxStreak).padStart(9)} | ` +
        `${String(user.correct_count).padStart(12)} | ${user.createdAt}`,
        color
      );
    });

    console.log('\n' + '='.repeat(100));
    log(`总计: ${users.length} 个测试用户`, colors.blue);
    console.log('='.repeat(100) + '\n');

    // 检查数据更新情况
    let updatedCount = 0;
    users.forEach((user, index) => {
      const expectedAccuracy = 75.5 + index;
      const expectedTotalJudged = 100 + index * 10;
      const expectedStreak = 5 + index;

      const accuracyMatch = Math.abs(user.accuracy - expectedAccuracy) < 0.1;
      const totalJudgedMatch = user.totalJudged === expectedTotalJudged;
      const streakMatch = user.streak === expectedStreak;

      if (accuracyMatch && totalJudgedMatch && streakMatch) {
        updatedCount++;
      }
    });

    log(`数据正确更新: ${updatedCount}/${users.length}`, updatedCount === users.length ? colors.green : colors.yellow);

  } catch (error) {
    log(`\n错误: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

queryTestUsers().catch((error) => {
  log(`\n未捕获的错误: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
