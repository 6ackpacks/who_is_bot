// 添加微信登录字段到数据库
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addWeChatFields() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    console.log('连接到数据库...');

    // 添加 openid 字段
    console.log('添加 openid 字段...');
    await connection.execute(`
      ALTER TABLE users
      ADD COLUMN openid VARCHAR(100) UNIQUE NULL COMMENT '微信 OpenID'
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  openid 字段已存在，跳过');
      } else {
        throw err;
      }
    });

    // 添加 unionid 字段
    console.log('添加 unionid 字段...');
    await connection.execute(`
      ALTER TABLE users
      ADD COLUMN unionid VARCHAR(100) UNIQUE NULL COMMENT '微信 UnionID'
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  unionid 字段已存在，跳过');
      } else {
        throw err;
      }
    });

    // 添加 sessionKey 字段
    console.log('添加 sessionKey 字段...');
    await connection.execute(`
      ALTER TABLE users
      ADD COLUMN sessionKey VARCHAR(255) NULL COMMENT '加密的微信 Session Key'
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  sessionKey 字段已存在，跳过');
      } else {
        throw err;
      }
    });

    console.log('\n✅ 所有字段添加成功！');

    // 显示表结构
    console.log('\n当前 users 表结构：');
    const [rows] = await connection.execute('DESCRIBE users');
    console.table(rows);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addWeChatFields();
