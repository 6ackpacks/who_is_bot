-- ============================================
-- Pre-Migration Data Check Script
-- Date: 2026-03-05 12:00:00
-- Description: Run this script BEFORE the main migration to check for data issues
-- This is a READ-ONLY script that will not modify any data
-- ============================================

USE `who_is_bot`;

SELECT '========================================' AS '';
SELECT 'PRE-MIGRATION DATA INTEGRITY CHECK' AS '';
SELECT '========================================' AS '';
SELECT '' AS '';

-- ============================================
-- Check 1: Orphaned Judgments
-- ============================================

SELECT '--- Check 1: Orphaned Judgments ---' AS '';

-- Judgments with invalid content_id
SELECT
    COUNT(*) AS count,
    'Judgments with invalid content_id (will be deleted)' AS issue
FROM judgments j
LEFT JOIN content c ON j.content_id = c.id
WHERE c.id IS NULL;

-- Show sample of orphaned judgments by content
SELECT
    j.id,
    j.content_id AS invalid_content_id,
    j.user_id,
    j.created_at
FROM judgments j
LEFT JOIN content c ON j.content_id = c.id
WHERE c.id IS NULL
LIMIT 5;

-- Judgments with invalid user_id (non-guest)
SELECT
    COUNT(*) AS count,
    'Judgments with invalid user_id (non-guest, will be deleted)' AS issue
FROM judgments j
LEFT JOIN users u ON j.user_id = u.id
WHERE j.user_id IS NOT NULL
  AND j.guest_id IS NULL
  AND u.id IS NULL;

-- Show sample of orphaned judgments by user
SELECT
    j.id,
    j.user_id AS invalid_user_id,
    j.content_id,
    j.created_at
FROM judgments j
LEFT JOIN users u ON j.user_id = u.id
WHERE j.user_id IS NOT NULL
  AND j.guest_id IS NULL
  AND u.id IS NULL
LIMIT 5;

SELECT '' AS '';

-- ============================================
-- Check 2: Orphaned Comments
-- ============================================

SELECT '--- Check 2: Orphaned Comments ---' AS '';

-- Comments with invalid content_id
SELECT
    COUNT(*) AS count,
    'Comments with invalid content_id (will be deleted)' AS issue
FROM comments c
LEFT JOIN content ct ON c.content_id = ct.id
WHERE ct.id IS NULL;

-- Show sample
SELECT
    c.id,
    c.content_id AS invalid_content_id,
    c.user_id,
    LEFT(c.content, 50) AS comment_preview,
    c.created_at
FROM comments c
LEFT JOIN content ct ON c.content_id = ct.id
WHERE ct.id IS NULL
LIMIT 5;

-- Comments with invalid user_id (non-guest)
SELECT
    COUNT(*) AS count,
    'Comments with invalid user_id (non-guest, will be deleted)' AS issue
FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.user_id IS NOT NULL
  AND c.guest_id IS NULL
  AND u.id IS NULL;

-- Show sample
SELECT
    c.id,
    c.user_id AS invalid_user_id,
    c.content_id,
    LEFT(c.content, 50) AS comment_preview,
    c.created_at
FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.user_id IS NOT NULL
  AND c.guest_id IS NULL
  AND u.id IS NULL
LIMIT 5;

-- Comments with invalid parent_id
SELECT
    COUNT(*) AS count,
    'Comments with invalid parent_id (parent_id will be set to NULL)' AS issue
FROM comments c
LEFT JOIN comments p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL
  AND p.id IS NULL;

-- Show sample
SELECT
    c.id,
    c.parent_id AS invalid_parent_id,
    c.content_id,
    LEFT(c.content, 50) AS comment_preview,
    c.created_at
FROM comments c
LEFT JOIN comments p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL
  AND p.id IS NULL
LIMIT 5;

SELECT '' AS '';

-- ============================================
-- Check 3: Duplicate Judgments
-- ============================================

SELECT '--- Check 3: Duplicate Judgments ---' AS '';

-- Duplicate judgments by registered users
SELECT
    COUNT(*) AS duplicate_groups,
    SUM(duplicate_count - 1) AS total_duplicates_to_delete,
    'Duplicate judgments by registered users (keeping earliest)' AS issue
FROM (
    SELECT user_id, content_id, COUNT(*) as duplicate_count
    FROM judgments
    WHERE user_id IS NOT NULL
    GROUP BY user_id, content_id
    HAVING duplicate_count > 1
) AS duplicates;

-- Show sample duplicate groups
SELECT
    j.user_id,
    j.content_id,
    COUNT(*) AS judgment_count,
    GROUP_CONCAT(j.id ORDER BY j.created_at SEPARATOR ', ') AS judgment_ids,
    MIN(j.created_at) AS earliest_judgment,
    MAX(j.created_at) AS latest_judgment
FROM judgments j
WHERE j.user_id IS NOT NULL
GROUP BY j.user_id, j.content_id
HAVING judgment_count > 1
LIMIT 5;

-- Duplicate judgments by guests
SELECT
    COUNT(*) AS duplicate_groups,
    SUM(duplicate_count - 1) AS total_duplicates_to_delete,
    'Duplicate judgments by guests (keeping earliest)' AS issue
FROM (
    SELECT guest_id, content_id, COUNT(*) as duplicate_count
    FROM judgments
    WHERE guest_id IS NOT NULL
    GROUP BY guest_id, content_id
    HAVING duplicate_count > 1
) AS duplicates;

-- Show sample duplicate groups
SELECT
    j.guest_id,
    j.content_id,
    COUNT(*) AS judgment_count,
    GROUP_CONCAT(j.id ORDER BY j.created_at SEPARATOR ', ') AS judgment_ids,
    MIN(j.created_at) AS earliest_judgment,
    MAX(j.created_at) AS latest_judgment
FROM judgments j
WHERE j.guest_id IS NOT NULL
GROUP BY j.guest_id, j.content_id
HAVING judgment_count > 1
LIMIT 5;

SELECT '' AS '';

-- ============================================
-- Check 4: Current Data Statistics
-- ============================================

SELECT '--- Check 4: Current Data Statistics ---' AS '';

SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM content) AS total_content,
    (SELECT COUNT(*) FROM judgments) AS total_judgments,
    (SELECT COUNT(*) FROM judgments WHERE user_id IS NOT NULL) AS registered_user_judgments,
    (SELECT COUNT(*) FROM judgments WHERE guest_id IS NOT NULL) AS guest_judgments,
    (SELECT COUNT(*) FROM comments) AS total_comments,
    (SELECT COUNT(*) FROM comments WHERE user_id IS NOT NULL) AS registered_user_comments,
    (SELECT COUNT(*) FROM comments WHERE guest_id IS NOT NULL) AS guest_comments,
    (SELECT COUNT(*) FROM comments WHERE parent_id IS NOT NULL) AS reply_comments;

SELECT '' AS '';

-- ============================================
-- Check 5: Current Accuracy Data Types
-- ============================================

SELECT '--- Check 5: Current Accuracy Column Types ---' AS '';

SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    'Will be changed to DECIMAL(5,2)' AS note
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('accuracy', 'weeklyAccuracy');

-- Check for accuracy values that might have precision issues
SELECT
    COUNT(*) AS users_with_high_precision_accuracy,
    'Users with accuracy having more than 2 decimal places' AS note
FROM users
WHERE (accuracy * 100) != FLOOR(accuracy * 100);

SELECT '' AS '';

-- ============================================
-- Check 6: Existing Constraints and Indexes
-- ============================================

SELECT '--- Check 6: Existing Foreign Keys ---' AS '';

SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

SELECT '' AS '';
SELECT '--- Check 6: Existing Unique Constraints ---' AS '';

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND CONSTRAINT_TYPE = 'UNIQUE'
ORDER BY TABLE_NAME;

SELECT '' AS '';
SELECT '--- Check 6: Existing Indexes ---' AS '';

SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns,
    INDEX_TYPE,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

SELECT '' AS '';

-- ============================================
-- Summary
-- ============================================

SELECT '========================================' AS '';
SELECT 'SUMMARY' AS '';
SELECT '========================================' AS '';

SELECT
    'Total issues found:' AS metric,
    (
        (SELECT COUNT(*) FROM judgments j LEFT JOIN content c ON j.content_id = c.id WHERE c.id IS NULL) +
        (SELECT COUNT(*) FROM judgments j LEFT JOIN users u ON j.user_id = u.id WHERE j.user_id IS NOT NULL AND j.guest_id IS NULL AND u.id IS NULL) +
        (SELECT COUNT(*) FROM comments c LEFT JOIN content ct ON c.content_id = ct.id WHERE ct.id IS NULL) +
        (SELECT COUNT(*) FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.user_id IS NOT NULL AND c.guest_id IS NULL AND u.id IS NULL) +
        (SELECT COUNT(*) FROM comments c LEFT JOIN comments p ON c.parent_id = p.id WHERE c.parent_id IS NOT NULL AND p.id IS NULL) +
        COALESCE((SELECT SUM(cnt - 1) FROM (SELECT COUNT(*) as cnt FROM judgments WHERE user_id IS NOT NULL GROUP BY user_id, content_id HAVING cnt > 1) AS t), 0) +
        COALESCE((SELECT SUM(cnt - 1) FROM (SELECT COUNT(*) as cnt FROM judgments WHERE guest_id IS NOT NULL GROUP BY guest_id, content_id HAVING cnt > 1) AS t), 0)
    ) AS count;

SELECT '' AS '';
SELECT 'Review the results above carefully.' AS '';
SELECT 'If you see any unexpected data issues, investigate before running the migration.' AS '';
SELECT 'The migration will automatically clean up these issues.' AS '';
SELECT '' AS '';
SELECT 'To proceed with migration, run: 20260305120000-fix-database-constraints.sql' AS '';
SELECT 'To rollback if needed, run: 20260305120000-fix-database-constraints-rollback.sql' AS '';
