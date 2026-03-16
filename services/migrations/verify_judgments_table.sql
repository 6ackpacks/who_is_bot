-- 验证 judgments 表结构
-- 检查表是否存在以及字段是否正确

-- 查看表结构
DESCRIBE judgments;

-- 验证字段命名（应该全部是下划线命名）
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'judgments'
ORDER BY ORDINAL_POSITION;

-- 检查索引
SHOW INDEX FROM judgments;

-- 统计数据
SELECT
    COUNT(*) as total_judgments,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT content_id) as unique_contents,
    SUM(CASE WHEN user_choice = 'ai' THEN 1 ELSE 0 END) as ai_choices,
    SUM(CASE WHEN user_choice = 'human' THEN 1 ELSE 0 END) as human_choices,
    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_judgments,
    SUM(CASE WHEN guest_id IS NOT NULL THEN 1 ELSE 0 END) as guest_judgments
FROM judgments;

-- 检查是否有重复判定（同一用户对同一内容的多次判定）
SELECT
    user_id,
    content_id,
    COUNT(*) as judgment_count
FROM judgments
WHERE user_id IS NOT NULL
GROUP BY user_id, content_id
HAVING COUNT(*) > 1
LIMIT 10;

-- 检查游客重复判定
SELECT
    guest_id,
    content_id,
    COUNT(*) as judgment_count
FROM judgments
WHERE guest_id IS NOT NULL
GROUP BY guest_id, content_id
HAVING COUNT(*) > 1
LIMIT 10;
