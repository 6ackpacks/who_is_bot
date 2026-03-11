-- ============================================
-- 迁移文件：010_remove_duplicate_columns.sql
-- 创建时间：2026-03-11
-- 说明：删除 content 表中重复的驼峰命名字段
--       保留下划线命名版本（total_votes, ai_votes, human_votes, correct_votes）
--       删除驼峰命名版本（totalVotes, aiVotes, humanVotes, correctVotes）
-- 注意：执行前请确保应用代码已更新为使用下划线命名字段
-- ============================================

-- ============================================
-- 数据迁移前的安全检查
-- ============================================
-- 检查是否存在数据不一致的情况（驼峰字段和下划线字段值不同）
SELECT
    id,
    title,
    totalVotes AS camelCase_totalVotes,
    total_votes AS snake_case_total_votes,
    aiVotes AS camelCase_aiVotes,
    ai_votes AS snake_case_ai_votes,
    humanVotes AS camelCase_humanVotes,
    human_votes AS snake_case_human_votes,
    correctVotes AS camelCase_correctVotes,
    correct_votes AS snake_case_correct_votes
FROM content
WHERE
    totalVotes != total_votes
    OR aiVotes != ai_votes
    OR humanVotes != human_votes
    OR correctVotes != correct_votes
LIMIT 10;

-- ============================================
-- 1. 数据同步（确保下划线字段包含最新数据）
-- ============================================
-- 如果驼峰字段的值更新，将其同步到下划线字段
UPDATE `content`
SET
    `total_votes` = GREATEST(COALESCE(`totalVotes`, 0), COALESCE(`total_votes`, 0)),
    `ai_votes` = GREATEST(COALESCE(`aiVotes`, 0), COALESCE(`ai_votes`, 0)),
    `human_votes` = GREATEST(COALESCE(`humanVotes`, 0), COALESCE(`human_votes`, 0)),
    `correct_votes` = GREATEST(COALESCE(`correctVotes`, 0), COALESCE(`correct_votes`, 0))
WHERE
    `totalVotes` IS NOT NULL
    OR `aiVotes` IS NOT NULL
    OR `humanVotes` IS NOT NULL
    OR `correctVotes` IS NOT NULL;

-- ============================================
-- 2. 删除索引（如果存在）
-- ============================================
-- 删除驼峰命名字段上的索引
DROP INDEX IF EXISTS `IDX_content_totalVotes` ON `content`;
DROP INDEX IF EXISTS `IDX_content_aiVotes` ON `content`;
DROP INDEX IF EXISTS `IDX_content_humanVotes` ON `content`;
DROP INDEX IF EXISTS `IDX_content_correctVotes` ON `content`;

-- ============================================
-- 3. 删除重复的驼峰命名字段
-- ============================================
-- 删除 totalVotes 字段（保留 total_votes）
ALTER TABLE `content` DROP COLUMN `totalVotes`;

-- 删除 aiVotes 字段（保留 ai_votes）
ALTER TABLE `content` DROP COLUMN `aiVotes`;

-- 删除 humanVotes 字段（保留 human_votes）
ALTER TABLE `content` DROP COLUMN `humanVotes`;

-- 删除 correctVotes 字段（保留 correct_votes）
ALTER TABLE `content` DROP COLUMN `correctVotes`;

-- ============================================
-- 4. 在下划线命名字段上创建索引（优化查询性能）
-- ============================================
-- 为投票统计字段创建索引，用于排行榜和统计查询
CREATE INDEX `IDX_content_total_votes` ON `content` (`total_votes`);
CREATE INDEX `IDX_content_ai_votes` ON `content` (`ai_votes`);
CREATE INDEX `IDX_content_human_votes` ON `content` (`human_votes`);
CREATE INDEX `IDX_content_correct_votes` ON `content` (`correct_votes`);

-- ============================================
-- 验证删除结果
-- ============================================
-- 查看 content 表结构，确认驼峰字段已删除
SHOW COLUMNS FROM `content`;

-- 查看 content 表索引，确认新索引已创建
SHOW INDEX FROM `content` WHERE Key_name LIKE 'IDX_content_%';

-- 查看数据完整性
SELECT
    COUNT(*) AS total_records,
    SUM(total_votes) AS sum_total_votes,
    SUM(ai_votes) AS sum_ai_votes,
    SUM(human_votes) AS sum_human_votes,
    SUM(correct_votes) AS sum_correct_votes,
    AVG(total_votes) AS avg_total_votes
FROM content;

-- ============================================
-- 回滚语句（如需回滚，请执行以下语句）
-- ============================================
/*
-- 警告：回滚会重新创建驼峰命名字段，但数据可能已丢失
-- 建议在执行本迁移前先备份数据库

-- 1. 删除下划线字段上的索引
DROP INDEX IF EXISTS `IDX_content_total_votes` ON `content`;
DROP INDEX IF EXISTS `IDX_content_ai_votes` ON `content`;
DROP INDEX IF EXISTS `IDX_content_human_votes` ON `content`;
DROP INDEX IF EXISTS `IDX_content_correct_votes` ON `content`;

-- 2. 重新添加驼峰命名字段
ALTER TABLE `content` ADD COLUMN `totalVotes` INT NOT NULL DEFAULT 0 COMMENT '总投票数（驼峰命名-已废弃）';
ALTER TABLE `content` ADD COLUMN `aiVotes` INT NOT NULL DEFAULT 0 COMMENT 'AI投票数（驼峰命名-已废弃）';
ALTER TABLE `content` ADD COLUMN `humanVotes` INT NOT NULL DEFAULT 0 COMMENT '人类投票数（驼峰命名-已废弃）';
ALTER TABLE `content` ADD COLUMN `correctVotes` INT NOT NULL DEFAULT 0 COMMENT '正确投票数（驼峰命名-已废弃）';

-- 3. 从下划线字段复制数据到驼峰字段
UPDATE `content`
SET
    `totalVotes` = `total_votes`,
    `aiVotes` = `ai_votes`,
    `humanVotes` = `human_votes`,
    `correctVotes` = `correct_votes`;

-- 4. 重新创建驼峰字段上的索引
CREATE INDEX `IDX_content_totalVotes` ON `content` (`totalVotes`);
CREATE INDEX `IDX_content_aiVotes` ON `content` (`aiVotes`);
CREATE INDEX `IDX_content_humanVotes` ON `content` (`humanVotes`);
CREATE INDEX `IDX_content_correctVotes` ON `content` (`correctVotes`);
*/
