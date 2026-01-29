-- ============================================
-- Who-is-the-Bot 数据库创建脚本（微信云托管 DMC 兼容版）
-- 版本: 4.0
-- 日期: 2026-01-29
-- 说明: 简化版本，移除所有可能导致兼容性问题的语法
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 删除旧表
-- ============================================

DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `user_achievements`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `judgments`;
DROP TABLE IF EXISTS `users`;

-- ============================================
-- 创建 users 表
-- ============================================

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
  `lastWeekReset` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_users_total_judged` ON `users`(`totalJudged`);
CREATE INDEX `idx_users_accuracy` ON `users`(`accuracy`);
CREATE INDEX `idx_users_weekly_judged` ON `users`(`weeklyJudged`);
CREATE INDEX `idx_users_level` ON `users`(`level`);

-- ============================================
-- 转换 content 表字符集
-- ============================================

ALTER TABLE `content` CONVERT TO CHARACTER SET utf8mb4;

-- ============================================
-- 创建 judgments 表
-- ============================================

CREATE TABLE `judgments` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `content_id` VARCHAR(36) NOT NULL,
  `user_choice` VARCHAR(10) NOT NULL,
  `is_correct` TINYINT(1) NOT NULL,
  `guest_id` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_judgments_user_id` ON `judgments`(`user_id`);
CREATE INDEX `idx_judgments_content_id` ON `judgments`(`content_id`);
CREATE INDEX `idx_judgments_created_at` ON `judgments`(`created_at`);
CREATE INDEX `idx_judgments_guest_id` ON `judgments`(`guest_id`);

-- ============================================
-- 创建 achievements 表
-- ============================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 创建 user_achievements 表
-- ============================================

CREATE TABLE `user_achievements` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `achievement_id` VARCHAR(36) NOT NULL,
  `unlocked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`user_id`, `achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_user_achievements_user_id` ON `user_achievements`(`user_id`);
CREATE INDEX `idx_user_achievements_achievement_id` ON `user_achievements`(`achievement_id`);

-- ============================================
-- 创建 comments 表
-- ============================================

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `idx_comments_content_id` ON `comments`(`content_id`);
CREATE INDEX `idx_comments_user_id` ON `comments`(`user_id`);
CREATE INDEX `idx_comments_guest_id` ON `comments`(`guest_id`);
CREATE INDEX `idx_comments_parent_id` ON `comments`(`parent_id`);
CREATE INDEX `idx_comments_created_at` ON `comments`(`created_at`);

-- ============================================
-- 添加外键约束
-- ============================================

ALTER TABLE `judgments`
  ADD CONSTRAINT `fk_judgments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_judgments_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_achievements`
  ADD CONSTRAINT `fk_user_achievements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_achievements_achievement` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE;

ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comments_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 插入成就数据
-- ============================================

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `type`, `requirement_value`, `points`) VALUES
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
-- 验证
-- ============================================

SHOW TABLES;
SELECT COUNT(*) AS achievement_count FROM `achievements`;
SELECT COUNT(*) AS content_count FROM `content`;
