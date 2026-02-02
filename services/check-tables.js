/**
 * 检查数据库表结构
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

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

async function checkTables() {
  let connection;

  try {
    log('连接数据库...', colors.blue);
    connection = await mysql.createConnection(dbConfig);
    log('数据库连接成功\n', colors.green);

    // 显示所有表
    log('数据库中的表:', colors.cyan);
    const [tables] = await connection.execute('SHOW TABLES');

    if (tables.length === 0) {
      log('数据库中没有表', colors.yellow);
    } else {
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        log(`  ${index + 1}. ${tableName}`, colors.blue);
      });
    }

  } catch (error) {
    log(`\n错误: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();
