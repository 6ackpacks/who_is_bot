-- 验证 Comment 和 Judgment 表字段完整性
-- 迁移文件：007_add_guest_id_fields.sql
-- 创建时间：2026-03-11
-- 说明：数据库已存在所需字段，本文件仅做验证查询

-- ============================================
-- 验证 judgments 表字段（全部下划线命名）
-- 实际字段：id, user_id, content_id, user_choice, is_correct, guest_id, created_at
-- ============================================
SELECT
    COUNT(*) AS total_judgments,
    SUM(CASE WHEN user_choice = 'ai' THEN 1 ELSE 0 END) AS ai_choices,
    SUM(CASE WHEN user_choice = 'human' THEN 1 ELSE 0 END) AS human_choices,
    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
    SUM(CASE WHEN guest_id IS NOT NULL THEN 1 ELSE 0 END) AS guest_judgments
FROM judgments;

-- ============================================
-- 验证 comments 表字段（混合命名）
-- 实际字段：id, likes, content_id, user_id, guest_id, content, parent_id, created_at, updated_at
-- ============================================
SELECT
    COUNT(*) AS total_comments,
    SUM(CASE WHEN guest_id IS NOT NULL THEN 1 ELSE 0 END) AS guest_comments,
    SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) AS reply_comments
FROM comments;
