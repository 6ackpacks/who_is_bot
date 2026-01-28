-- 添加 correct_votes 字段到 content 表
-- 用于记录每个内容有多少人判断正确

ALTER TABLE content ADD COLUMN correct_votes INT DEFAULT 0;

-- 验证字段是否添加成功
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'content'
AND COLUMN_NAME = 'correct_votes';
