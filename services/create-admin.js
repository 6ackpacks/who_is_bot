/**
 * 创建或重置管理员账号
 *
 * 使用方法:
 * node create-admin.js <username> <password> [role]
 *
 * 示例:
 * node create-admin.js admin Admin123456 super
 * node create-admin.js editor Editor123 normal
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ 参数不足');
    console.log('\n使用方法:');
    console.log('  node create-admin.js <username> <password> [role]');
    console.log('\n示例:');
    console.log('  node create-admin.js admin Admin123456 super');
    console.log('  node create-admin.js editor Editor123 normal');
    console.log('\n角色说明:');
    console.log('  super  - 超级管理员（默认）');
    console.log('  normal - 普通管理员');
    process.exit(1);
  }

  const username = args[0];
  const password = args[1];
  const role = args[2] || 'super';

  if (!['super', 'normal'].includes(role)) {
    console.error('❌ 角色必须是 super 或 normal');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ 密码长度至少为 6 位');
    process.exit(1);
  }

  let connection;

  try {
    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    console.log('✅ 数据库连接成功');

    // 检查管理员是否已存在
    const [existingAdmins] = await connection.execute(
      'SELECT id, username, role FROM admins WHERE username = ?',
      [username]
    );

    if (existingAdmins.length > 0) {
      console.log(`\n⚠️  管理员 "${username}" 已存在`);
      console.log('是否要重置密码？这将覆盖现有密码。');
      console.log('如果要继续，请重新运行脚本并添加 --force 参数');

      if (!args.includes('--force')) {
        process.exit(0);
      }

      // 更新密码
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        'UPDATE admins SET password = ?, role = ?, updatedAt = NOW() WHERE username = ?',
        [hashedPassword, role, username]
      );

      console.log(`\n✅ 管理员密码已重置`);
      console.log(`   用户名: ${username}`);
      console.log(`   角色: ${role}`);
      console.log(`   新密码: ${password}`);
    } else {
      // 创建新管理员
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuidv4();

      await connection.execute(
        'INSERT INTO admins (id, username, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [id, username, hashedPassword, role]
      );

      console.log(`\n✅ 管理员创建成功`);
      console.log(`   ID: ${id}`);
      console.log(`   用户名: ${username}`);
      console.log(`   密码: ${password}`);
      console.log(`   角色: ${role}`);
    }

    console.log('\n📝 请妥善保管管理员账号信息');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();
