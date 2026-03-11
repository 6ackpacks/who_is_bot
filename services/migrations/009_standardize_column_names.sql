-- ============================================
-- 迁移文件：009_standardize_column_names.sql
-- 创建时间：2026-03-11
-- 说明：统一所有表的字段命名为下划线命名规范（snake_case）
--       将驼峰命名（camelCase）字段重命名为下划线命名
-- 注意：本迁移会修改表结构，执行前请备份数据库
-- ============================================

-- ============================================
-- 1. 修改 content 表字段命名
-- ============================================
-- 将 authorId 重命名为 author_id
ALTER TABLE `content`
  CHANGE COLUMN `authorId` `author_id` VARCHAR(36) NULL COMMENT '作者用户ID';

-- 将 createdAt 重命名为 created_at
ALTER TABLE `content`
  CHANGE COLUMN `createdAt` `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间';

-- 将 updatedAt 重命名为 updated_at
ALTER TABLE `content`
  CHANGE COLUMN `updatedAt` `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间';

-- 将 modelTag 重命名为 model_tag
ALTER TABLE `content`
  CHANGE COLUMN `modelTag` `model_tag` VARCHAR(100) NULL COMMENT '模型标签';

-- 将 deceptionRate 重命名为 deception_rate
ALTER TABLE `content`
  CHANGE COLUMN `deceptionRate` `deception_rate` FLOAT NOT NULL DEFAULT 0 COMMENT '欺骗率';

-- ============================================
-- 2. 修改 users 表字段命名
-- ============================================
-- 将 totalJudged 重命名为 total_judged
ALTER TABLE `users`
  CHANGE COLUMN `totalJudged` `total_judged` INT NOT NULL DEFAULT 0 COMMENT '总判断次数';

-- 将 maxStreak 重命名为 max_streak
ALTER TABLE `users`
  CHANGE COLUMN `maxStreak` `max_streak` INT NOT NULL DEFAULT 0 COMMENT '最大连胜次数';

-- 将 totalBotsBusted 重命名为 total_bots_busted
ALTER TABLE `users`
  CHANGE COLUMN `totalBotsBusted` `total_bots_busted` INT NOT NULL DEFAULT 0 COMMENT '总识破机器人次数';

-- 将 weeklyAccuracy 重命名为 weekly_accuracy
ALTER TABLE `users`
  CHANGE COLUMN `weeklyAccuracy` `weekly_accuracy` FLOAT NOT NULL DEFAULT 0 COMMENT '周准确率';

-- 将 weeklyJudged 重命名为 weekly_judged
ALTER TABLE `users`
  CHANGE COLUMN `weeklyJudged` `weekly_judged` INT NOT NULL DEFAULT 0 COMMENT '周判断次数';

-- 将 weeklyCorrect 重命名为 weekly_correct
ALTER TABLE `users`
  CHANGE COLUMN `weeklyCorrect` `weekly_correct` INT NOT NULL DEFAULT 0 COMMENT '周正确次数';

-- 将 lastWeekReset 重命名为 last_week_reset
ALTER TABLE `users`
  CHANGE COLUMN `lastWeekReset` `last_week_reset` TIMESTAMP NULL COMMENT '上次周重置时间';

-- 将 createdAt 重命名为 created_at
ALTER TABLE `users`
  CHANGE COLUMN `createdAt` `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间';

-- 将 updatedAt 重命名为 updated_at
ALTER TABLE `users`
  CHANGE COLUMN `updatedAt` `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间';

-- 将 sessionKey 重命名为 session_key（微信小程序会话密钥）
ALTER TABLE `users`
  CHANGE COLUMN `sessionKey` `session_key` VARCHAR(255) NULL COMMENT '微信会话密钥';

-- ============================================
-- 3. 修改 admins 表字段命名
-- ============================================
-- 注意：admins 表在 008 迁移中已经用正确的下划线命名创建
-- 因此这部分已被注释掉，无需执行

/*
-- 将 createdAt 重命名为 created_at
ALTER TABLE `admins`
  CHANGE COLUMN `createdAt` `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间';

-- 将 lastLoginAt 重命名为 last_login_at
ALTER TABLE `admins`
  CHANGE COLUMN `lastLoginAt` `last_login_at` DATETIME(6) NULL COMMENT '最后登录时间';

-- 将 updatedAt 重命名为 updated_at
ALTER TABLE `admins`
  CHANGE COLUMN `updatedAt` `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间';
*/

-- ============================================
-- 验证字段重命名结果
-- ============================================
-- 查看 content 表结构
SHOW COLUMNS FROM `content` WHERE Field IN ('author_id', 'created_at', 'updated_at', 'model_tag', 'deception_rate');

-- 查看 users 表结构
SHOW COLUMNS FROM `users` WHERE Field IN ('total_judged', 'max_streak', 'total_bots_busted', 'weekly_accuracy', 'weekly_judged', 'weekly_correct', 'last_week_reset', 'created_at', 'updated_at', 'session_key');

-- 查看 admins 表结构
SHOW COLUMNS FROM `admins` WHERE Field IN ('created_at', 'last_login_at', 'updated_at');

-- ============================================
-- 回滚语句（如需回滚，请执行以下语句）
-- ============================================
/*
-- 回滚 content 表
ALTER TABLE `content` CHANGE COLUMN `author_id` `authorId` VARCHAR(36) NULL;
ALTER TABLE `content` CHANGE COLUMN `created_at` `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE `content` CHANGE COLUMN `updated_at` `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
ALTER TABLE `content` CHANGE COLUMN `model_tag` `modelTag` VARCHAR(100) NULL;
ALTER TABLE `content` CHANGE COLUMN `deception_rate` `deceptionRate` FLOAT NOT NULL DEFAULT 0;

-- 回滚 users 表
ALTER TABLE `users` CHANGE COLUMN `total_judged` `totalJudged` INT NOT NULL DEFAULT 0;
ALTER TABLE `users` CHANGE COLUMN `max_streak` `maxStreak` INT NOT NULL DEFAULT 0;
ALTER TABLE `users` CHANGE COLUMN `total_bots_busted` `totalBotsBusted` INT NOT NULL DEFAULT 0;
ALTER TABLE `users` CHANGE COLUMN `weekly_accuracy` `weeklyAccuracy` FLOAT NOT NULL DEFAULT 0;
ALTER TABLE `users` CHANGE COLUMN `weekly_judged` `weeklyJudged` INT NOT NULL DEFAULT 0;
ALTER TABLE `users` CHANGE COLUMN `weekly_correct` `weeklyCorrect` INT NOT NULL DEFAULT 0;
ALTER TABLE `users` CHANGE COLUMN `last_week_reset` `lastWeekReset` TIMESTAMP NULL;
ALTER TABLE `users` CHANGE COLUMN `created_at` `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE `users` CHANGE COLUMN `updated_at` `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
ALTER TABLE `users` CHANGE COLUMN `session_key` `sessionKey` VARCHAR(255) NULL;

-- 回滚 admins 表
ALTER TABLE `admins` CHANGE COLUMN `created_at` `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE `admins` CHANGE COLUMN `last_login_at` `lastLoginAt` DATETIME(6) NULL;
ALTER TABLE `admins` CHANGE COLUMN `updated_at` `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
*/
