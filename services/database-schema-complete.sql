-- ============================================
-- Who-is-the-Bot 完整数据库建表脚本
-- 版本: 2.0
-- 日期: 2026-01-29
-- 说明: 完全重建数据库，包含所有表、索引、外键和初始数据
-- ============================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. 删除现有表（谨慎操作！）
-- ============================================

DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS judgments;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS users;

-- ============================================
-- 2. 创建 users 表
-- ============================================

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  nickname VARCHAR(100) NOT NULL,
  uid VARCHAR(50) NOT NULL UNIQUE,
  level INT NOT NULL DEFAULT 1,
  avatar TEXT,
  accuracy FLOAT NOT NULL DEFAULT 0,
  totalJudged INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  maxStreak INT NOT NULL DEFAULT 0,
  totalBotsBusted INT NOT NULL DEFAULT 0,
  weeklyAccuracy FLOAT NOT NULL DEFAULT 0,
  weeklyJudged INT NOT NULL DEFAULT 0,
  weeklyCorrect INT NOT NULL DEFAULT 0,
  lastWeekReset TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- users 表索引
CREATE INDEX idx_users_total_judged ON users(totalJudged);
CREATE INDEX idx_users_accuracy ON users(accuracy);
CREATE INDEX idx_users_weekly_judged ON users(weeklyJudged);
CREATE INDEX idx_users_level ON users(level);

-- ============================================
-- 3. 创建 content 表
-- ============================================

CREATE TABLE content (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  url TEXT,
  text TEXT,
  title VARCHAR(255) NOT NULL,
  is_bot BOOLEAN NOT NULL,
  modelTag VARCHAR(100) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  deceptionRate FLOAT NOT NULL,
  explanation TEXT NOT NULL,
  total_votes INT NOT NULL DEFAULT 0,
  ai_votes INT NOT NULL DEFAULT 0,
  human_votes INT NOT NULL DEFAULT 0,
  correct_votes INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- content 表索引
CREATE INDEX idx_content_total_votes ON content(total_votes);
CREATE INDEX idx_content_is_bot ON content(is_bot);
CREATE INDEX idx_content_created_at ON content(createdAt);

-- ============================================
-- 4. 创建 judgments 表
-- ============================================

CREATE TABLE judgments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  content_id VARCHAR(36) NOT NULL,
  user_choice VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  guest_id VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- judgments 表索引
CREATE INDEX idx_judgments_user_id ON judgments(user_id);
CREATE INDEX idx_judgments_content_id ON judgments(content_id);
CREATE INDEX idx_judgments_created_at ON judgments(created_at);
CREATE INDEX idx_judgments_guest_id ON judgments(guest_id);

-- ============================================
-- 5. 创建 achievements 表
-- ============================================

CREATE TABLE achievements (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  requirement_value INT,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 创建 user_achievements 表
-- ============================================

CREATE TABLE user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_id VARCHAR(36) NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_achievements 表索引
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- ============================================
-- 7. 插入初始成就数据
-- ============================================

INSERT INTO achievements (id, name, description, icon, type, requirement_value, points) VALUES
  ('ach_first_judgment', '初出茅庐', '完成第一次判定', 'target', 'judgment_count', 1, 10),
  ('ach_10_judgments', '小试牛刀', '完成10次判定', 'search', 'judgment_count', 10, 20),
  ('ach_100_judgments', '身经百战', '完成100次判定', 'strong', 'judgment_count', 100, 50),
  ('ach_500_judgments', '经验丰富', '完成500次判定', 'trophy', 'judgment_count', 500, 100),
  ('ach_1000_judgments', '大师级侦探', '完成1000次判定', 'crown', 'judgment_count', 1000, 200),

  ('ach_accuracy_70', '火眼金睛', '准确率达到70%', 'eye', 'accuracy', 70, 30),
  ('ach_accuracy_80', '明察秋毫', '准确率达到80%', 'lens', 'accuracy', 80, 50),
  ('ach_accuracy_90', '神机妙算', '准确率达到90%', 'brain', 'accuracy', 90, 100),
  ('ach_accuracy_95', '料事如神', '准确率达到95%', 'star', 'accuracy', 95, 150),

  ('ach_streak_5', '连胜新手', '连续答对5题', 'fire', 'streak', 5, 20),
  ('ach_streak_10', '连胜达人', '连续答对10题', 'bolt', 'streak', 10, 40),
  ('ach_streak_20', '连胜专家', '连续答对20题', 'sparkle', 'streak', 20, 80),
  ('ach_streak_50', '连胜传奇', '连续答对50题', 'medal', 'streak', 50, 200);

-- ============================================
-- 8. 验证建表结果
-- ============================================

SELECT '=== 数据库创建完成 ===' AS message;

-- 显示所有表
SHOW TABLES;

-- 显示成就数量
SELECT COUNT(*) AS achievement_count FROM achievements;

-- 显示表结构
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  AVG_ROW_LENGTH,
  DATA_LENGTH,
  INDEX_LENGTH
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'content', 'judgments', 'achievements', 'user_achievements');

SELECT '=== 建表完成，可以开始使用 ===' AS message;
