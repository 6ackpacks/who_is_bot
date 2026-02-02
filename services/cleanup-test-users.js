/**
 * 清理测试用户数据
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

async function cleanupTestUsers() {
  let connection;

  try {
    log('\n清理测试用户数据...', colors.cyan);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    log('数据库连接成功', colors.green);

    // 查询要删除的用户数量
    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE nickname LIKE 'TestUser%'"
    );

    const count = countResult[0].count;
    log(`\n找到 ${count} 个测试用户`, colors.blue);

    if (count > 0) {
      // 删除测试用户
      const [result] = await connection.execute(
        "DELETE FROM users WHERE nickname LIKE 'TestUser%'"
      );

      log(`✓ 成功删除 ${result.affectedRows} 个测试用户`, colors.green);
    } else {
      log('没有需要清理的测试用户', colors.yellow);
    }

  } catch (error) {
    log(`\n错误: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('数据库连接已关闭\n', colors.blue);
    }
  }
}

cleanupTestUsers().catch((error) => {
  log(`\n未捕获的错误: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
