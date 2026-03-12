-- ============================================================
-- 001_fix_missing_columns.sql
-- 修正 000 中的错误：
--   1. MySQL 5.7 不支持 ADD COLUMN IF NOT EXISTS，改用 INFORMATION_SCHEMA 判断
--   2. 统一使用数据库实际列名（驼峰）
--
-- 执行方式：在腾讯云 CynosDB 控制台逐段执行（每个 CALL 语句前先执行 DELIMITER / PROCEDURE 块）
-- 或者：直接使用文末提供的【安全 ALTER TABLE】版本（推荐）
-- ============================================================

USE `who_is_bot`;

-- ============================================================
-- STEP 1：诊断 — 查看各表当前字段
-- ============================================================
DESCRIBE `users`;
DESCRIBE `content`;
DESCRIBE `comments`;
DESCRIBE `judgments`;

-- ============================================================
-- STEP 2：users 表 — 按需补充缺失字段（驼峰命名）
-- 先执行 DESCRIBE users; 确认哪些字段缺失，再执行对应的 ALTER
-- ============================================================

-- 检查 users 表缺失字段（用 INFORMATION_SCHEMA 查）
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME   = 'users'
ORDER BY ORDINAL_POSITION;

-- 如果 totalBotsBusted 缺失，执行：
ALTER TABLE `users` ADD COLUMN `totalBotsBusted` INT NOT NULL DEFAULT 0;

-- 如果 weeklyAccuracy 缺失，执行：
ALTER TABLE `users` ADD COLUMN `weeklyAccuracy` FLOAT NOT NULL DEFAULT 0;

-- 如果 weeklyJudged 缺失，执行：
ALTER TABLE `users` ADD COLUMN `weeklyJudged` INT NOT NULL DEFAULT 0;

-- 如果 weeklyCorrect 缺失，执行：
ALTER TABLE `users` ADD COLUMN `weeklyCorrect` INT NOT NULL DEFAULT 0;

-- 如果 lastWeekReset 缺失，执行：
ALTER TABLE `users` ADD COLUMN `lastWeekReset` TIMESTAMP NULL;

-- 如果 avatarUpdateTime 缺失，执行：
ALTER TABLE `users` ADD COLUMN `avatarUpdateTime` VARCHAR(50) NULL;

-- 如果 maxStreak 缺失，执行：
ALTER TABLE `users` ADD COLUMN `maxStreak` INT NOT NULL DEFAULT 0;

-- 如果 totalJudged 缺失，执行：
ALTER TABLE `users` ADD COLUMN `totalJudged` INT NOT NULL DEFAULT 0;

-- ============================================================
-- STEP 3：content 表 — 按需补充缺失字段（注意：is_bot 是唯一的下划线列）
-- ============================================================

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME   = 'content'
ORDER BY ORDINAL_POSITION;

-- 如果 totalVotes 缺失，执行：
ALTER TABLE `content` ADD COLUMN `totalVotes` INT NOT NULL DEFAULT 0;

-- 如果 aiVotes 缺失，执行：
ALTER TABLE `content` ADD COLUMN `aiVotes` INT NOT NULL DEFAULT 0;

-- 如果 humanVotes 缺失，执行：
ALTER TABLE `content` ADD COLUMN `humanVotes` INT NOT NULL DEFAULT 0;

-- 如果 correctVotes 缺失，执行：
ALTER TABLE `content` ADD COLUMN `correctVotes` INT NOT NULL DEFAULT 0;

-- 如果 modelTag 缺失，执行：
ALTER TABLE `content` ADD COLUMN `modelTag` VARCHAR(100) NULL;

-- 如果 deceptionRate 缺失，执行：
ALTER TABLE `content` ADD COLUMN `deceptionRate` FLOAT NOT NULL DEFAULT 0;

-- 如果 authorId 缺失，执行：
ALTER TABLE `content` ADD COLUMN `authorId` VARCHAR(36) NULL;

-- 如果 explanation 缺失，执行（允许 NULL 避免历史数据问题）：
ALTER TABLE `content` ADD COLUMN `explanation` TEXT NULL;

-- ============================================================
-- STEP 4：comments 表 — 检查（sql.md 显示只有 id/text/likes/createdAt/userId/contentId）
-- ============================================================

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME   = 'comments'
ORDER BY ORDINAL_POSITION;

-- 如果 userId 缺失，执行：
ALTER TABLE `comments` ADD COLUMN `userId` VARCHAR(36) NULL;

-- 如果 contentId 缺失，执行：
ALTER TABLE `comments` ADD COLUMN `contentId` VARCHAR(36) NOT NULL;

-- ============================================================
-- STEP 5：删除冗余表 contents（与 content 重复且无投票字段）
-- 执行前先确认 content 表数据正常
-- ============================================================
SELECT COUNT(*) AS content_rows  FROM `content`;
-- SELECT COUNT(*) AS contents_rows FROM `contents`;  -- 先确认内容再删

-- 确认 content 表有数据后，执行删除：
-- DROP TABLE IF EXISTS `contents`;

-- ============================================================
-- STEP 6：验证 — 使用正确的列名（驼峰，除 is_bot 外）
-- ============================================================

-- 验证 content 表
SELECT
  id,
  title,
  type,
  is_bot,
  deceptionRate,
  totalVotes,
  aiVotes,
  humanVotes,
  correctVotes,
  createdAt
FROM `content`
ORDER BY createdAt DESC
LIMIT 5;

-- 验证 users 表
SELECT
  id,
  nickname,
  uid,
  accuracy,
  totalJudged,
  maxStreak,
  totalBotsBusted,
  weeklyAccuracy,
  createdAt
FROM `users`
LIMIT 5;

-- 验证 judgments 表（下划线命名）
SELECT
  id,
  user_id,
  content_id,
  user_choice,
  is_correct,
  created_at
FROM `judgments`
LIMIT 5;

-- ============================================================
-- STEP 7：插入样本内容（如果 content 表为空）
-- ============================================================

INSERT INTO `content` (
  `id`, `type`, `url`, `text`, `title`,
  `is_bot`, `modelTag`, `provider`, `deceptionRate`, `explanation`,
  `totalVotes`, `aiVotes`, `humanVotes`, `correctVotes`,
  `createdAt`, `updatedAt`
)
SELECT * FROM (
  SELECT
    UUID()            AS id,
    'text'            AS type,
    NULL              AS url,
    '这段文字出自某位著名作家之手，描述了一个关于人工智能与人类共存的未来世界。文字流畅自然，情感真挚，令人动容。' AS text,
    '未来世界的AI与人类'  AS title,
    0                 AS is_bot,
    NULL              AS modelTag,
    'human'           AS provider,
    35.5              AS deceptionRate,
    '这是真实人类创作的文章，文风朴实，有明显的个人情感色彩。' AS explanation,
    120               AS totalVotes,
    42                AS aiVotes,
    78                AS humanVotes,
    78                AS correctVotes,
    NOW()             AS createdAt,
    NOW()             AS updatedAt
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `content` LIMIT 1);
