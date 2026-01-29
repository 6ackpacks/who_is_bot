-- ============================================
-- 诊断和修复脚本
-- ============================================

-- 第一步：检查 content 表结构
SHOW CREATE TABLE `content`;

-- 第二步：查看 content 表的 id 字段类型
DESC `content`;

-- 第三步：删除所有表（除了 content）
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `user_achievements`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `judgments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 第四步：创建 users 表（不带任何外键）
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 第五步：添加 users 表的唯一键和索引
ALTER TABLE `users` ADD UNIQUE KEY `uk_uid` (`uid`);
ALTER TABLE `users` ADD KEY `idx_total_judged` (`totalJudged`);
ALTER TABLE `users` ADD KEY `idx_accuracy` (`accuracy`);
ALTER TABLE `users` ADD KEY `idx_weekly_judged` (`weeklyJudged`);
ALTER TABLE `users` ADD KEY `idx_level` (`level`);

-- 第六步：创建其他表
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

-- 第七步：尝试添加外键（如果失败，说明 content 表有问题）
-- 先不添加外键，让表能用起来

-- 第八步：插入成就数据
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

-- 第九步：验证
SHOW TABLES;
SELECT COUNT(*) AS users_count FROM `users`;
SELECT COUNT(*) AS achievements_count FROM `achievements`;
SELECT COUNT(*) AS content_count FROM `content`;

SELECT '数据库创建完成（暂不添加外键）' AS status;
