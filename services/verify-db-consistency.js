/**
 * 数据库一致性验证脚本
 *
 * 在并发测试后验证数据库中的数据一致性
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

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

async function verifyDatabaseConsistency() {
  let connection;

  try {
    logSection('数据库一致性验证');

    log('连接数据库...', colors.blue);
    connection = await mysql.createConnection(dbConfig);
    log('数据库连接成功', colors.green);

    // 1. 检查测试用户数量
    console.log('\n1. 检查测试用户数量:');
    const [testUsers] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE nickname LIKE 'TestUser%'"
    );
    log(`   找到 ${testUsers[0].count} 个测试用户`, colors.blue);

    // 2. 检查 UID 唯一性
    console.log('\n2. 检查 UID 唯一性:');
    const [uidCheck] = await connection.execute(`
      SELECT uid, COUNT(*) as count
      FROM users
      WHERE nickname LIKE 'TestUser%'
      GROUP BY uid
      HAVING count > 1
    `);

    if (uidCheck.length === 0) {
      log('   ✅ 所有 UID 都是唯一的', colors.green);
    } else {
      log(`   ❌ 发现 ${uidCheck.length} 个重复的 UID`, colors.red);
      uidCheck.forEach(row => {
        log(`      UID: ${row.uid}, 重复次数: ${row.count}`, colors.red);
      });
    }

    // 3. 检查 ID 唯一性
    console.log('\n3. 检查 ID 唯一性:');
    const [idCheck] = await connection.execute(`
      SELECT id, COUNT(*) as count
      FROM users
      WHERE nickname LIKE 'TestUser%'
      GROUP BY id
      HAVING count > 1
    `);

    if (idCheck.length === 0) {
      log('   ✅ 所有 ID 都是唯一的', colors.green);
    } else {
      log(`   ❌ 发现 ${idCheck.length} 个重复的 ID`, colors.red);
      idCheck.forEach(row => {
        log(`      ID: ${row.id}, 重复次数: ${row.count}`, colors.red);
      });
    }

    // 4. 检查昵称唯一性
    console.log('\n4. 检查昵称唯一性:');
    const [nicknameCheck] = await connection.execute(`
      SELECT nickname, COUNT(*) as count
      FROM users
      WHERE nickname LIKE 'TestUser%'
      GROUP BY nickname
      HAVING count > 1
    `);

    if (nicknameCheck.length === 0) {
      log('   ✅ 所有昵称都是唯一的', colors.green);
    } else {
      log(`   ⚠️  发现 ${nicknameCheck.length} 个重复的昵称（这是预期的，因为 mock-login 会复用昵称）`, colors.yellow);
      nicknameCheck.forEach(row => {
        log(`      昵称: ${row.nickname}, 重复次数: ${row.count}`, colors.yellow);
      });
    }

    // 5. 查看测试用户的统计数据
    console.log('\n5. 测试用户统计数据:');
    const [userStats] = await connection.execute(`
      SELECT
        nickname,
        accuracy,
        totalJudged,
        streak,
        correct_count,
        level
      FROM users
      WHERE nickname LIKE 'TestUser%'
      ORDER BY nickname
      LIMIT 10
    `);

    if (userStats.length > 0) {
      console.log('\n   前 10 个测试用户的数据:');
      console.log('   ' + '-'.repeat(78));
      console.log('   昵称          | 准确率 | 总判断 | 连胜 | 正确数 | 等级');
      console.log('   ' + '-'.repeat(78));

      userStats.forEach(user => {
        const nickname = user.nickname.padEnd(13);
        const accuracy = String(user.accuracy).padEnd(6);
        const totalJudged = String(user.totalJudged).padEnd(6);
        const streak = String(user.streak).padEnd(4);
        const correctCount = String(user.correct_count).padEnd(6);
        const level = String(user.level).padEnd(4);

        console.log(`   ${nickname} | ${accuracy} | ${totalJudged} | ${streak} | ${correctCount} | ${level}`);
      });
      console.log('   ' + '-'.repeat(78));
    }

    // 6. 检查数据完整性
    console.log('\n6. 检查数据完整性:');
    const [nullCheck] = await connection.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) as null_id,
        SUM(CASE WHEN uid IS NULL THEN 1 ELSE 0 END) as null_uid,
        SUM(CASE WHEN nickname IS NULL THEN 1 ELSE 0 END) as null_nickname,
        SUM(CASE WHEN level IS NULL THEN 1 ELSE 0 END) as null_level
      FROM users
      WHERE nickname LIKE 'TestUser%'
    `);

    const nullData = nullCheck[0];
    log(`   总记录数: ${nullData.total}`, colors.blue);

    if (nullData.null_id === 0 && nullData.null_uid === 0 &&
        nullData.null_nickname === 0 && nullData.null_level === 0) {
      log('   ✅ 所有必填字段都有值', colors.green);
    } else {
      log('   ❌ 发现空值字段:', colors.red);
      if (nullData.null_id > 0) log(`      ID 为空: ${nullData.null_id} 条`, colors.red);
      if (nullData.null_uid > 0) log(`      UID 为空: ${nullData.null_uid} 条`, colors.red);
      if (nullData.null_nickname > 0) log(`      昵称为空: ${nullData.null_nickname} 条`, colors.red);
      if (nullData.null_level > 0) log(`      等级为空: ${nullData.null_level} 条`, colors.red);
    }

    // 7. 检查更新后的统计数据
    console.log('\n7. 检查更新后的统计数据:');
    const [updatedStats] = await connection.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN accuracy > 0 THEN 1 ELSE 0 END) as with_accuracy,
        SUM(CASE WHEN totalJudged > 0 THEN 1 ELSE 0 END) as with_judged,
        AVG(accuracy) as avg_accuracy,
        AVG(totalJudged) as avg_judged
      FROM users
      WHERE nickname LIKE 'TestUser%'
    `);

    const stats = updatedStats[0];
    log(`   总用户数: ${stats.total}`, colors.blue);
    log(`   有准确率数据的用户: ${stats.with_accuracy}`, colors.blue);
    log(`   有判断记录的用户: ${stats.with_judged}`, colors.blue);
    log(`   平均准确率: ${stats.avg_accuracy ? Number(stats.avg_accuracy).toFixed(2) : 0}`, colors.blue);
    log(`   平均判断次数: ${stats.avg_judged ? Number(stats.avg_judged).toFixed(2) : 0}`, colors.blue);

    // 8. 检查时间戳
    console.log('\n8. 检查时间戳:');
    const [timestampCheck] = await connection.execute(`
      SELECT
        MIN(createdAt) as earliest,
        MAX(createdAt) as latest,
        MIN(updatedAt) as earliest_update,
        MAX(updatedAt) as latest_update
      FROM users
      WHERE nickname LIKE 'TestUser%'
    `);

    const timestamps = timestampCheck[0];
    log(`   最早创建时间: ${timestamps.earliest}`, colors.blue);
    log(`   最晚创建时间: ${timestamps.latest}`, colors.blue);
    log(`   最早更新时间: ${timestamps.earliest_update}`, colors.blue);
    log(`   最晚更新时间: ${timestamps.latest_update}`, colors.blue);

    // 计算时间跨度
    if (timestamps.earliest && timestamps.latest) {
      const timeSpan = new Date(timestamps.latest) - new Date(timestamps.earliest);
      log(`   创建时间跨度: ${timeSpan}ms`, colors.blue);

      if (timeSpan < 1000) {
        log('   ✅ 所有用户在 1 秒内创建完成（真正的并发）', colors.green);
      } else {
        log(`   ⚠️  创建时间跨度超过 1 秒，可能不是真正的并发`, colors.yellow);
      }
    }

    // 9. 总结
    logSection('验证总结');

    const issues = [];

    if (uidCheck.length > 0) {
      issues.push('- UID 存在重复');
    }

    if (idCheck.length > 0) {
      issues.push('- ID 存在重复');
    }

    if (nullData.null_id > 0 || nullData.null_uid > 0 ||
        nullData.null_nickname > 0 || nullData.null_level > 0) {
      issues.push('- 存在空值字段');
    }

    if (issues.length === 0) {
      log('✅ 数据库数据一致性验证通过！', colors.green + colors.bright);
      log('所有数据完整、唯一、一致', colors.green);
    } else {
      log('❌ 发现以下问题:', colors.red + colors.bright);
      issues.forEach(issue => {
        log(issue, colors.red);
      });
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    log(`\n错误: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('数据库连接已关闭', colors.blue);
    }
  }
}

// 运行验证
verifyDatabaseConsistency().catch((error) => {
  log(`\n未捕获的错误: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
