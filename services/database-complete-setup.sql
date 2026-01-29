-- ============================================
-- Who-is-the-Bot 完整数据库创建脚本
-- 版本: 3.1
-- 日期: 2026-01-29
-- 说明: 包含所有表的完整创建脚本（保留 content 表）
-- 使用方法: 在数据库管理工具中直接执行此文件
-- ============================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. 禁用外键检查（重要！）
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================
-- 2. 删除现有表（保留 content 表）
-- ============================================

-- 按照依赖关系顺序删除表
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `user_achievements`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `judgments`;
DROP TABLE IF EXISTS `users`;

-- content 表保留不删除！

-- ============================================
-- 3. 创建 users 表
-- ============================================

CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL COMMENT '用户ID (UUID)',
  `nickname` VARCHAR(100) NOT NULL COMMENT '用户昵称',
  `uid` VARCHAR(50) NOT NULL COMMENT '微信唯一标识',
  `level` INT NOT NULL DEFAULT 1 COMMENT '用户等级(1-4)',
  `avatar` TEXT COMMENT '头像URL',
  `accuracy` FLOAT NOT NULL DEFAULT 0 COMMENT '总体准确率(%)',
  `totalJudged` INT NOT NULL DEFAULT 0 COMMENT '总判定次数',
  `correct_count` INT NOT NULL DEFAULT 0 COMMENT '总正确次数',
  `streak` INT NOT NULL DEFAULT 0 COMMENT '当前连胜数',
  `maxStreak` INT NOT NULL DEFAULT 0 COMMENT '历史最大连胜数',
  `totalBotsBusted` INT NOT NULL DEFAULT 0 COMMENT '识破AI总数',
  `weeklyAccuracy` FLOAT NOT NULL DEFAULT 0 COMMENT '本周准确率(%)',
  `weeklyJudged` INT NOT NULL DEFAULT 0 COMMENT '本周判定次数',
  `weeklyCorrect` INT NOT NULL DEFAULT 0 COMMENT '本周正确次数',
  `lastWeekReset` TIMESTAMP NULL DEFAULT NULL COMMENT '上次周统计重置时间',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  KEY `idx_users_total_judged` (`totalJudged`),
  KEY `idx_users_accuracy` (`accuracy`),
  KEY `idx_users_weekly_judged` (`weeklyJudged`),
  KEY `idx_users_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- ============================================
-- 4. 确保 content 表有正确的字符集
-- ============================================

ALTER TABLE `content` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 5. 创建 judgments 表
-- ============================================

CREATE TABLE `judgments` (
  `id` VARCHAR(36) NOT NULL COMMENT '判定记录ID (UUID)',
  `user_id` VARCHAR(36) DEFAULT NULL COMMENT '用户ID（游客为NULL）',
  `content_id` VARCHAR(36) NOT NULL COMMENT '内容ID',
  `user_choice` VARCHAR(10) NOT NULL COMMENT '用户选择(ai/human)',
  `is_correct` TINYINT(1) NOT NULL COMMENT '是否正确',
  `guest_id` VARCHAR(50) DEFAULT NULL COMMENT '游客ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_judgments_user_id` (`user_id`),
  KEY `idx_judgments_content_id` (`content_id`),
  KEY `idx_judgments_created_at` (`created_at`),
  KEY `idx_judgments_guest_id` (`guest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='判定记录表';

-- ============================================
-- 6. 创建 achievements 表
-- ============================================

CREATE TABLE `achievements` (
  `id` VARCHAR(36) NOT NULL COMMENT '成就ID',
  `name` VARCHAR(100) NOT NULL COMMENT '成就名称',
  `description` TEXT NOT NULL COMMENT '成就描述',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标（emoji或图标名）',
  `type` VARCHAR(50) NOT NULL COMMENT '成就类型(judgment_count/accuracy/streak/special)',
  `requirement_value` INT DEFAULT NULL COMMENT '达成条件数值',
  `points` INT NOT NULL DEFAULT 0 COMMENT '成就积分',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就定义表';

-- ============================================
-- 7. 创建 user_achievements 表
-- ============================================

CREATE TABLE `user_achievements` (
  `id` VARCHAR(36) NOT NULL COMMENT '记录ID (UUID)',
  `user_id` VARCHAR(36) NOT NULL COMMENT '用户ID',
  `achievement_id` VARCHAR(36) NOT NULL COMMENT '成就ID',
  `unlocked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  KEY `idx_user_achievements_user_id` (`user_id`),
  KEY `idx_user_achievements_achievement_id` (`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就关联表';

-- ============================================
-- 8. 创建 comments 表（评论功能）
-- ============================================

CREATE TABLE `comments` (
  `id` VARCHAR(36) NOT NULL COMMENT '评论ID (UUID)',
  `content_id` VARCHAR(36) NOT NULL COMMENT '内容ID',
  `user_id` VARCHAR(36) DEFAULT NULL COMMENT '用户ID（游客为NULL）',
  `guest_id` VARCHAR(50) DEFAULT NULL COMMENT '游客ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  `parent_id` VARCHAR(36) DEFAULT NULL COMMENT '父评论ID（支持回复）',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_comments_content_id` (`content_id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comments_guest_id` (`guest_id`),
  KEY `idx_comments_parent_id` (`parent_id`),
  KEY `idx_comments_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 9. 添加外键约束
-- ============================================

-- judgments 表外键
ALTER TABLE `judgments`
  ADD CONSTRAINT `fk_judgments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_judgments_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE;

-- user_achievements 表外键
ALTER TABLE `user_achievements`
  ADD CONSTRAINT `fk_user_achievements_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_achievements_achievement` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE;

-- comments 表外键
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comments_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

-- ============================================
-- 10. 启用外键检查
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 11. 插入初始成就数据
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
-- 12. 验证建表结果
-- ============================================

SELECT '=== 数据库创建完成（content 表已保留） ===' AS message;

-- 显示所有表
SHOW TABLES;

-- 显示成就数量
SELECT COUNT(*) AS achievement_count FROM `achievements`;

-- 显示 content 表记录数
SELECT COUNT(*) AS content_count FROM `content`;

-- 显示表结构
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  DATA_LENGTH,
  INDEX_LENGTH,
  TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'content', 'judgments', 'achievements', 'user_achievements', 'comments')
ORDER BY TABLE_NAME;

SELECT '=== 创建完成，content 数据已保留 ===' AS message;

