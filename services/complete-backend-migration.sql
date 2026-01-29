-- ============================================
-- 完整后端功能数据库迁移脚本
-- 包含：周统计重置、成就系统、索引优化
-- ============================================

-- 1. 添加 lastWeekReset 字段到 users 表
-- 用于追踪上次周统计重置时间
ALTER TABLE users ADD COLUMN last_week_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. 创建 achievements 表（成就定义）
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255),
  type VARCHAR(50) NOT NULL,  -- 'judgment_count', 'accuracy', 'streak', 'special'
  requirement_value INT,       -- 达成条件的数值
  points INT DEFAULT 0,        -- 成就积分
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建 user_achievements 表（用户成就关联）
CREATE TABLE IF NOT EXISTS user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_id VARCHAR(36) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,

  -- 确保同一用户不会重复获得同一成就
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 4. 优化数据库索引
-- 注意：如果索引已存在会报错，但不影响后续执行，可以忽略这些错误

-- judgments 表索引（已在之前的迁移中创建，这里确保存在）
CREATE INDEX idx_judgments_user_id ON judgments(user_id);
CREATE INDEX idx_judgments_content_id ON judgments(content_id);
CREATE INDEX idx_judgments_created_at ON judgments(created_at);
CREATE INDEX idx_judgments_guest_id ON judgments(guest_id);

-- users 表索引优化
CREATE INDEX idx_users_total_judged ON users(total_judged);
CREATE INDEX idx_users_accuracy ON users(accuracy);
CREATE INDEX idx_users_weekly_judged ON users(weekly_judged);
CREATE INDEX idx_users_level ON users(level);

-- content 表索引优化
CREATE INDEX idx_content_total_votes ON content(total_votes);
CREATE INDEX idx_content_is_bot ON content(is_bot);
CREATE INDEX idx_content_created_at ON content(created_at);

-- user_achievements 表索引
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- 5. 插入初始成就数据
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

-- 检查 users 表新字段
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME = 'last_week_reset';

-- 检查 achievements 表
SELECT COUNT(*) as achievements_count FROM achievements;

-- 检查索引
SHOW INDEX FROM users;
SHOW INDEX FROM content;
SHOW INDEX FROM judgments;

-- ============================================
-- 回滚脚本（谨慎使用）
-- ============================================

-- ALTER TABLE users DROP COLUMN last_week_reset;
-- DROP TABLE IF EXISTS user_achievements;
-- DROP TABLE IF EXISTS achievements;
