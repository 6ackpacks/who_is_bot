-- ============================================
-- Who-is-Bot 全新数据库创建脚本
-- 数据库名称: who_is_bot (新)
-- 版本: 5.0 - 全新开始
-- 说明: 删除旧库，创建新库，建立所有表
-- ============================================

-- 第一步：删除旧数据库（如果存在）
DROP DATABASE IF EXISTS `who_is_the_bot`;
DROP DATABASE IF EXISTS `who_is_bot`;

-- 第二步：创建新数据库
CREATE DATABASE `who_is_bot`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 第三步：使用新数据库
USE `who_is_bot`;

-- 第四步：设置环境
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 创建所有表
-- ============================================

-- 1. users 表
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `nickname` VARCHAR(100) NOT NULL,
  `uid` VARCHAR(50) NOT NULL,
  `level` INT NOT NULL DEFAULT 1,
  `avatar` TEXT,
  `accuracy` FLOAT NOT NULL DEFAULT 0,
  `totalJudged` INT NOT NULL DEFAULT 0,
  `correct_count` INT NOT NULL DEFAULT 0,
  `streak` INT NOT NULL DEFAULT 0,
  `maxStreak` INT NOT NULL DEFAULT 0,
  `totalBotsBusted` INT NOT NULL DEFAULT 0,
  `weeklyAccuracy` FLOAT NOT NULL DEFAULT 0,
  `weeklyJudged` INT NOT NULL DEFAULT 0,
  `weeklyCorrect` INT NOT NULL DEFAULT 0,
  `lastWeekReset` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uid` (`uid`),
  KEY `idx_total_judged` (`totalJudged`),
  KEY `idx_accuracy` (`accuracy`),
  KEY `idx_weekly_judged` (`weeklyJudged`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. content 表
CREATE TABLE `content` (
  `id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `url` TEXT,
  `text` TEXT,
  `title` VARCHAR(255) NOT NULL,
  `is_bot` TINYINT(1) NOT NULL,
  `modelTag` VARCHAR(100) NOT NULL,
  `provider` VARCHAR(100) NOT NULL,
  `deceptionRate` FLOAT NOT NULL,
  `explanation` TEXT NOT NULL,
  `total_votes` INT NOT NULL DEFAULT 0,
  `ai_votes` INT NOT NULL DEFAULT 0,
  `human_votes` INT NOT NULL DEFAULT 0,
  `correct_votes` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_total_votes` (`total_votes`),
  KEY `idx_is_bot` (`is_bot`),
  KEY `idx_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. judgments 表
CREATE TABLE `judgments` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `content_id` VARCHAR(36) NOT NULL,
  `user_choice` VARCHAR(10) NOT NULL,
  `is_correct` TINYINT(1) NOT NULL,
  `guest_id` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content_id` (`content_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_guest_id` (`guest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. achievements 表
CREATE TABLE `achievements` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(50) NOT NULL,
  `requirement_value` INT DEFAULT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. user_achievements 表
CREATE TABLE `user_achievements` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `achievement_id` VARCHAR(36) NOT NULL,
  `unlocked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_achievement_id` (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. comments 表
CREATE TABLE `comments` (
  `id` VARCHAR(36) NOT NULL,
  `content_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `guest_id` VARCHAR(50) DEFAULT NULL,
  `content` TEXT NOT NULL,
  `likes` INT NOT NULL DEFAULT 0,
  `parent_id` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_content_id` (`content_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_guest_id` (`guest_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 插入初始数据
-- ============================================

-- 插入成就数据
INSERT INTO `achievements` VALUES
('ach_first_judgment', '初出茅庐', '完成第一次判定', 'target', 'judgment_count', 1, 10, CURRENT_TIMESTAMP),
('ach_10_judgments', '小试牛刀', '完成10次判定', 'search', 'judgment_count', 10, 20, CURRENT_TIMESTAMP),
('ach_100_judgments', '身经百战', '完成100次判定', 'strong', 'judgment_count', 100, 50, CURRENT_TIMESTAMP),
('ach_500_judgments', '经验丰富', '完成500次判定', 'trophy', 'judgment_count', 500, 100, CURRENT_TIMESTAMP),
('ach_1000_judgments', '大师级侦探', '完成1000次判定', 'crown', 'judgment_count', 1000, 200, CURRENT_TIMESTAMP),
('ach_accuracy_70', '火眼金睛', '准确率达到70%', 'eye', 'accuracy', 70, 30, CURRENT_TIMESTAMP),
('ach_accuracy_80', '明察秋毫', '准确率达到80%', 'lens', 'accuracy', 80, 50, CURRENT_TIMESTAMP),
('ach_accuracy_90', '神机妙算', '准确率达到90%', 'brain', 'accuracy', 90, 100, CURRENT_TIMESTAMP),
('ach_accuracy_95', '料事如神', '准确率达到95%', 'star', 'accuracy', 95, 150, CURRENT_TIMESTAMP),
('ach_streak_5', '连胜新手', '连续答对5题', 'fire', 'streak', 5, 20, CURRENT_TIMESTAMP),
('ach_streak_10', '连胜达人', '连续答对10题', 'bolt', 'streak', 10, 40, CURRENT_TIMESTAMP),
('ach_streak_20', '连胜专家', '连续答对20题', 'sparkle', 'streak', 20, 80, CURRENT_TIMESTAMP),
('ach_streak_50', '连胜传奇', '连续答对50题', 'medal', 'streak', 50, 200, CURRENT_TIMESTAMP);

-- ============================================
-- 恢复设置
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 验证结果
-- ============================================

SELECT '=== 数据库创建完成 ===' AS message;

SHOW TABLES;

SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ROUND(DATA_LENGTH/1024/1024, 2) AS 'Size_MB'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'who_is_bot'
ORDER BY TABLE_NAME;

SELECT COUNT(*) AS achievements_count FROM `achievements`;

SELECT '=== 全部完成！数据库名称: who_is_bot ===' AS message;
