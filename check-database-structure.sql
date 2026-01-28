-- 检查数据库表结构
-- 请在你的数据库管理界面执行这些查询

-- 1. 检查所有表
SHOW TABLES;

-- 2. 检查 content 表结构
DESCRIBE content;

-- 3. 检查 users 表结构
DESCRIBE users;

-- 4. 检查 judgments 表结构
DESCRIBE judgments;

-- 5. 验证 content 表的新字段
SELECT
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'content'
AND COLUMN_NAME IN ('total_votes', 'ai_votes', 'human_votes');

-- 6. 验证 users 表的新字段
SELECT
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN ('correct_count', 'totalJudged', 'accuracy', 'maxStreak');
