-- 初始化 Content 表投票统计数据
-- 迁移文件：006_add_content_vote_fields.sql
-- 创建时间：2026-03-11
-- 说明：数据库已存在 totalVotes/aiVotes/humanVotes/correctVotes 字段（驼峰命名）
--       本迁移只负责根据 judgments 表的历史记录初始化统计数据

-- ============================================
-- 初始化现有数据的投票统计（使用数据库实际列名）
-- judgments 表字段：user_choice, content_id, is_correct
-- content 表字段：totalVotes, aiVotes, humanVotes, correctVotes, is_bot
-- ============================================

UPDATE content c
SET
    totalVotes = (
        SELECT COUNT(*)
        FROM judgments j
        WHERE j.content_id = c.id
    ),
    aiVotes = (
        SELECT COUNT(*)
        FROM judgments j
        WHERE j.content_id = c.id AND j.user_choice = 'ai'
    ),
    humanVotes = (
        SELECT COUNT(*)
        FROM judgments j
        WHERE j.content_id = c.id AND j.user_choice = 'human'
    ),
    correctVotes = (
        SELECT COUNT(*)
        FROM judgments j
        WHERE j.content_id = c.id AND j.is_correct = 1
    );

-- ============================================
-- 验证更新结果
-- ============================================
SELECT
    id,
    title,
    totalVotes,
    aiVotes,
    humanVotes,
    correctVotes
FROM content
ORDER BY totalVotes DESC
LIMIT 10;
