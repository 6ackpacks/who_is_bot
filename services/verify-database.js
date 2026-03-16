const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

async function verifyDatabase() {
  let connection;

  try {
    console.log('='.repeat(80));
    console.log('数据库连接验证');
    console.log('='.repeat(80));
    console.log(`主机: ${dbConfig.host}`);
    console.log(`端口: ${dbConfig.port}`);
    console.log(`数据库: ${dbConfig.database}`);
    console.log(`用户: ${dbConfig.user}`);
    console.log('');

    // 1. 测试数据库连接
    console.log('步骤 1: 测试数据库连接...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ 数据库连接成功!\n');

    // 2. 列出所有表
    console.log('步骤 2: 列出所有表...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`找到 ${tables.length} 个表:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    console.log('');

    // 3. 检查必需的表
    const requiredTables = ['users', 'judgments', 'comments', 'achievements', 'admins'];
    console.log('步骤 3: 检查必需的表...');
    const existingTables = tables.map(t => Object.values(t)[0]);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log(`✗ 缺少以下表: ${missingTables.join(', ')}\n`);
    } else {
      console.log('✓ 所有必需的表都存在\n');
    }

    // 4. 检查每个表的结构
    console.log('步骤 4: 检查表结构...');
    console.log('='.repeat(80));

    for (const requiredTable of requiredTables) {
      if (!existingTables.includes(requiredTable)) {
        console.log(`\n表 "${requiredTable}" 不存在，跳过结构检查`);
        continue;
      }

      console.log(`\n表: ${requiredTable}`);
      console.log('-'.repeat(80));

      // 获取表结构
      const [columns] = await connection.query(`DESCRIBE ${requiredTable}`);
      console.log('字段列表:');
      columns.forEach((col, index) => {
        const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const key = col.Key ? `[${col.Key}]` : '';
        const defaultVal = col.Default !== null ? `DEFAULT: ${col.Default}` : '';
        const extra = col.Extra ? `(${col.Extra})` : '';
        console.log(`  ${index + 1}. ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${nullable.padEnd(10)} ${key} ${defaultVal} ${extra}`);
      });

      // 获取索引信息
      const [indexes] = await connection.query(`SHOW INDEX FROM ${requiredTable}`);
      if (indexes.length > 0) {
        console.log('\n索引:');
        const indexMap = {};
        indexes.forEach(idx => {
          if (!indexMap[idx.Key_name]) {
            indexMap[idx.Key_name] = [];
          }
          indexMap[idx.Key_name].push(idx.Column_name);
        });
        Object.entries(indexMap).forEach(([name, columns]) => {
          const unique = indexes.find(i => i.Key_name === name).Non_unique === 0 ? 'UNIQUE' : '';
          console.log(`  - ${name}: (${columns.join(', ')}) ${unique}`);
        });
      }

      // 获取外键信息
      const [foreignKeys] = await connection.query(`
        SELECT
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [dbConfig.database, requiredTable]);

      if (foreignKeys.length > 0) {
        console.log('\n外键约束:');
        foreignKeys.forEach(fk => {
          console.log(`  - ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
        });
      }

      // 获取表的行数
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${requiredTable}`);
      console.log(`\n记录数: ${countResult[0].count}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('验证完成!');
    console.log('='.repeat(80));

    // 5. 检查表之间的关系
    console.log('\n步骤 5: 检查表关系...');
    console.log('-'.repeat(80));

    const expectedRelations = [
      { table: 'judgments', column: 'user_id', references: 'users(id)', description: 'Judgments -> Users' },
      { table: 'judgments', column: 'content_id', references: 'contents(id)', description: 'Judgments -> Contents' },
      { table: 'comments', column: 'user_id', references: 'users(id)', description: 'Comments -> Users' },
      { table: 'comments', column: 'content_id', references: 'contents(id)', description: 'Comments -> Contents' },
    ];

    console.log('预期的表关系:');
    for (const rel of expectedRelations) {
      const [fks] = await connection.query(`
        SELECT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [dbConfig.database, rel.table, rel.column]);

      if (fks.length > 0) {
        console.log(`  ✓ ${rel.description}: ${rel.table}.${rel.column} -> ${rel.references}`);
      } else {
        console.log(`  ⚠ ${rel.description}: 外键约束不存在 (${rel.table}.${rel.column})`);
      }
    }

  } catch (error) {
    console.error('\n✗ 错误:', error.message);
    if (error.code) {
      console.error(`错误代码: ${error.code}`);
    }
    if (error.errno) {
      console.error(`错误编号: ${error.errno}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

verifyDatabase();
