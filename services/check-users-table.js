/**
 * 检查 users 表结构
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

async function checkUsersTable() {
  let connection;

  try {
    log('连接数据库...', colors.blue);
    connection = await mysql.createConnection(dbConfig);
    log('数据库连接成功\n', colors.green);

    // 显示表结构
    log('users 表结构:', colors.cyan);
    const [columns] = await connection.execute('DESCRIBE users');

    console.log('\n字段名                | 类型                  | 允许NULL | 键   | 默认值');
    console.log('-'.repeat(80));
    columns.forEach((col) => {
      const field = col.Field.padEnd(20);
      const type = col.Type.padEnd(20);
      const nullable = col.Null.padEnd(8);
      const key = col.Key.padEnd(4);
      const defaultVal = (col.Default || 'NULL').toString().padEnd(10);
      console.log(`${field} | ${type} | ${nullable} | ${key} | ${defaultVal}`);
    });

  } catch (error) {
    log(`\n错误: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsersTable();
