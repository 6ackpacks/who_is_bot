-- Migration: Add composite index for leaderboard performance optimization
-- Date: 2026-02-02
-- Description: Adds a composite index on (accuracy, totalJudged) to optimize leaderboard queries

-- Check if index exists before creating
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND index_name = 'IDX_USER_LEADERBOARD'
);

-- Create index if it doesn't exist
SET @sql = IF(@index_exists = 0,
    'CREATE INDEX IDX_USER_LEADERBOARD ON users (accuracy DESC, totalJudged DESC)',
    'SELECT "Index IDX_USER_LEADERBOARD already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify index creation
SELECT
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    COLLATION
FROM INFORMATION_SCHEMA.STATISTICS
WHERE table_schema = DATABASE()
AND table_name = 'users'
AND index_name = 'IDX_USER_LEADERBOARD'
ORDER BY SEQ_IN_INDEX;
