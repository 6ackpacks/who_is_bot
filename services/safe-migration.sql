-- ============================================
-- 安全的数据库迁移脚本（修复版）
-- 可以重复执行，会自动跳过已存在的对象
-- ============================================

-- 设置：遇到错误继续执行
-- 注意：在命令行执行时使用 mysql --force 参数

-- 1. 添加 lastWeekReset 字段到 users 表（如果不存在）
-- 检查字段是否存在
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'last_week_reset');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN last_week_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'SELECT "Column last_week_reset already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 创建 achievements 表
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  requirement_value INT,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建 user_achievements 表
CREATE TABLE IF NOT EXISTS user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_id VARCHAR(36) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,

  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 4. 创建索引的存储过程
DELIMITER //

DROP PROCEDURE IF EXISTS CreateIndexIfNotExists//
CREATE PROCEDURE CreateIndexIfNotExists(
  IN tableName VARCHAR(128),
  IN indexName VARCHAR(128),
  IN columnName VARCHAR(128)
)
BEGIN
  DECLARE index_exists INT;

  SELECT COUNT(*) INTO index_exists
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = tableName
    AND INDEX_NAME = indexName;

  IF index_exists = 0 THEN
    SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, '(', columnName, ')');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('Created index: ', indexName) AS message;
  ELSE
    SELECT CONCAT('Index already exists: ', indexName) AS message;
  END IF;
END//

DELIMITER ;

-- 5. 使用存储过程创建所有索引

-- judgments 表索引
CALL CreateIndexIfNotExists('judgments', 'idx_judgments_user_id', 'user_id');
CALL CreateIndexIfNotExists('judgments', 'idx_judgments_content_id', 'content_id');
CALL CreateIndexIfNotExists('judgments', 'idx_judgments_created_at', 'created_at');
CALL CreateIndexIfNotExists('judgments', 'idx_judgments_guest_id', 'guest_id');

-- users 表索引
CALL CreateIndexIfNotExists('users', 'idx_users_total_judged', 'total_judged');
CALL CreateIndexIfNotExists('users', 'idx_users_accuracy', 'accuracy');
CALL CreateIndexIfNotExists('users', 'idx_users_weekly_judged', 'weekly_judged');
CALL CreateIndexIfNotExists('users', 'idx_users_level', 'level');

-- content 表索引
CALL CreateIndexIfNotExists('content', 'idx_content_total_votes', 'total_votes');
CALL CreateIndexIfNotExists('content', 'idx_content_is_bot', 'is_bot');
CALL CreateIndexIfNotExists('content', 'idx_content_created_at', 'created_at');

-- user_achievements 表索引
CALL CreateIndexIfNotExists('user_achievements', 'idx_user_achievements_user_id', 'user_id');
CALL CreateIndexIfNotExists('user_achievements', 'idx_user_achievements_achievement_id', 'achievement_id');

-- 6. 清理存储过程
DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;

-- 7. 插入初始成就数据
INSERT INTO achievements (id, name, description, icon, type, requirement_value, points) VALUES
  ('ach_first_judgment', '初出茅庐', '完成第一次判定', '🎯', 'judgment_count', 1, 10),
  ('ach_10_judgments', '小试牛刀', '完成10次判定', '🔍', 'judgment_count', 10, 20),
  ('ach_100_judgments', '身经百战', '完成100次判定', '💪', 'judgment_count', 100, 50),
  ('ach_500_judgments', '经验丰富', '完成500次判定', '🏆', 'judgment_count', 500, 100),
  ('ach_1000_judgments', '大师级侦探', '完成1000次判定', '👑', 'judgment_count', 1000, 200),

  ('ach_accuracy_70', '火眼金睛', '准确率达到70%', '👁️', 'accuracy', 70, 30),
  ('ach_accuracy_80', '明察秋毫', '准确率达到80%', '🔎', 'accuracy', 80, 50),
  ('ach_accuracy_90', '神机妙算', '准确率达到90%', '🧠', 'accuracy', 90, 100),
  ('ach_accuracy_95', '料事如神', '准确率达到95%', '✨', 'accuracy', 95, 150),

  ('ach_streak_5', '连胜新手', '连续答对5题', '🔥', 'streak', 5, 20),
  ('ach_streak_10', '连胜达人', '连续答对10题', '⚡', 'streak', 10, 40),
  ('ach_streak_20', '连胜专家', '连续答对20题', '💫', 'streak', 20, 80),
  ('ach_streak_50', '连胜传奇', '连续答对50题', '🌟', 'streak', 50, 200)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- 验证脚本
-- ============================================

SELECT '=== 验证结果 ===' AS '';

-- 检查 users 表新字段
SELECT
  CASE WHEN COUNT(*) > 0 THEN '✅ last_week_reset 字段已添加' ELSE '❌ last_week_reset 字段不存在' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'last_week_reset';

-- 检查 achievements 表
SELECT
  CASE WHEN COUNT(*) > 0 THEN CONCAT('✅ achievements 表已创建，包含 ', COUNT(*), ' 个成就') ELSE '❌ achievements 表不存在' END AS status
FROM achievements;

-- 检查 user_achievements 表
SELECT
  CASE WHEN COUNT(*) = 1 THEN '✅ user_achievements 表已创建' ELSE '❌ user_achievements 表不存在' END AS status
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'user_achievements';

-- 检查索引数量
SELECT
  TABLE_NAME,
  COUNT(*) AS index_count
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'content', 'judgments', 'user_achievements')
GROUP BY TABLE_NAME;

SELECT '=== 迁移完成 ===' AS '';
