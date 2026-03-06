-- ============================================
-- Migration: Fix Database Constraints and Data Integrity
-- Date: 2026-03-05 12:00:00
-- Version: 1.0
-- Description:
--   1. Add foreign key constraints for data integrity
--   2. Add unique constraints to prevent duplicate judgments
--   3. Add performance indexes for common queries
--   4. Fix FLOAT to DECIMAL for accuracy fields
-- ============================================

-- Set safe mode
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET @OLD_SQL_MODE = @@SQL_MODE;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

USE `who_is_bot`;

-- ============================================
-- STEP 1: Data Integrity Check and Cleanup
-- ============================================

SELECT '=== Step 1: Checking data integrity ===' AS message;

-- Check for orphaned judgments (content_id not in content table)
SELECT
    COUNT(*) AS orphaned_judgments_by_content,
    'judgments with invalid content_id' AS description
FROM judgments j
LEFT JOIN content c ON j.content_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned judgments (user_id not in users table, excluding guest judgments)
SELECT
    COUNT(*) AS orphaned_judgments_by_user,
    'judgments with invalid user_id (non-guest)' AS description
FROM judgments j
LEFT JOIN users u ON j.user_id = u.id
WHERE j.user_id IS NOT NULL
  AND j.guest_id IS NULL
  AND u.id IS NULL;

-- Check for orphaned comments (content_id not in content table)
SELECT
    COUNT(*) AS orphaned_comments_by_content,
    'comments with invalid content_id' AS description
FROM comments c
LEFT JOIN content ct ON c.content_id = ct.id
WHERE ct.id IS NULL;

-- Check for orphaned comments (user_id not in users table, excluding guest comments)
SELECT
    COUNT(*) AS orphaned_comments_by_user,
    'comments with invalid user_id (non-guest)' AS description
FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.user_id IS NOT NULL
  AND c.guest_id IS NULL
  AND u.id IS NULL;

-- Check for orphaned comments (parent_id not in comments table)
SELECT
    COUNT(*) AS orphaned_comments_by_parent,
    'comments with invalid parent_id' AS description
FROM comments c
LEFT JOIN comments p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL
  AND p.id IS NULL;

-- Check for duplicate judgments (same user/guest judging same content multiple times)
SELECT
    COUNT(*) AS duplicate_user_judgments,
    'duplicate judgments by registered users' AS description
FROM (
    SELECT user_id, content_id, COUNT(*) as cnt
    FROM judgments
    WHERE user_id IS NOT NULL
    GROUP BY user_id, content_id
    HAVING cnt > 1
) AS duplicates;

SELECT
    COUNT(*) AS duplicate_guest_judgments,
    'duplicate judgments by guests' AS description
FROM (
    SELECT guest_id, content_id, COUNT(*) as cnt
    FROM judgments
    WHERE guest_id IS NOT NULL
    GROUP BY guest_id, content_id
    HAVING cnt > 1
) AS duplicates;

-- ============================================
-- STEP 2: Clean Up Orphaned Data
-- ============================================

SELECT '=== Step 2: Cleaning up orphaned data ===' AS message;

-- Clean orphaned judgments (invalid content_id)
DELETE j FROM judgments j
LEFT JOIN content c ON j.content_id = c.id
WHERE c.id IS NULL;

SELECT ROW_COUNT() AS deleted_orphaned_judgments_by_content;

-- Clean orphaned judgments (invalid user_id, excluding guests)
DELETE j FROM judgments j
LEFT JOIN users u ON j.user_id = u.id
WHERE j.user_id IS NOT NULL
  AND j.guest_id IS NULL
  AND u.id IS NULL;

SELECT ROW_COUNT() AS deleted_orphaned_judgments_by_user;

-- Clean orphaned comments (invalid content_id)
DELETE c FROM comments c
LEFT JOIN content ct ON c.content_id = ct.id
WHERE ct.id IS NULL;

SELECT ROW_COUNT() AS deleted_orphaned_comments_by_content;

-- Clean orphaned comments (invalid user_id, excluding guests)
DELETE c FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.user_id IS NOT NULL
  AND c.guest_id IS NULL
  AND u.id IS NULL;

SELECT ROW_COUNT() AS deleted_orphaned_comments_by_user;

-- Clean orphaned comments (invalid parent_id)
UPDATE comments
SET parent_id = NULL
WHERE parent_id IS NOT NULL
  AND parent_id NOT IN (SELECT id FROM (SELECT id FROM comments) AS temp);

SELECT ROW_COUNT() AS fixed_orphaned_comments_by_parent;

-- ============================================
-- STEP 3: Handle Duplicate Judgments
-- ============================================

SELECT '=== Step 3: Handling duplicate judgments ===' AS message;

-- For registered users: Keep the earliest judgment, delete duplicates
DELETE j1 FROM judgments j1
INNER JOIN judgments j2 ON
    j1.user_id = j2.user_id
    AND j1.content_id = j2.content_id
    AND j1.created_at > j2.created_at
WHERE j1.user_id IS NOT NULL;

SELECT ROW_COUNT() AS deleted_duplicate_user_judgments;

-- For guests: Keep the earliest judgment, delete duplicates
DELETE j1 FROM judgments j1
INNER JOIN judgments j2 ON
    j1.guest_id = j2.guest_id
    AND j1.content_id = j2.content_id
    AND j1.created_at > j2.created_at
WHERE j1.guest_id IS NOT NULL;

SELECT ROW_COUNT() AS deleted_duplicate_guest_judgments;

-- ============================================
-- STEP 4: Modify Column Types (accuracy fields)
-- ============================================

SELECT '=== Step 4: Modifying accuracy column types ===' AS message;

-- Change accuracy from FLOAT to DECIMAL(5,2) for precision
ALTER TABLE `users`
MODIFY COLUMN `accuracy` DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Change weeklyAccuracy from FLOAT to DECIMAL(5,2) for precision
ALTER TABLE `users`
MODIFY COLUMN `weeklyAccuracy` DECIMAL(5,2) NOT NULL DEFAULT 0.00;

SELECT 'Accuracy fields converted to DECIMAL(5,2)' AS message;

-- ============================================
-- STEP 5: Add Foreign Key Constraints
-- ============================================

SELECT '=== Step 5: Adding foreign key constraints ===' AS message;

SET FOREIGN_KEY_CHECKS = 0;

-- Add foreign key for judgments.user_id -> users.id
-- ON DELETE SET NULL: If user is deleted, keep judgment but set user_id to NULL
ALTER TABLE `judgments`
ADD CONSTRAINT `fk_judgments_user_id`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add foreign key for judgments.content_id -> content.id
-- ON DELETE CASCADE: If content is deleted, delete all related judgments
ALTER TABLE `judgments`
ADD CONSTRAINT `fk_judgments_content_id`
FOREIGN KEY (`content_id`) REFERENCES `content`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add foreign key for comments.user_id -> users.id
-- ON DELETE SET NULL: If user is deleted, keep comment but set user_id to NULL
ALTER TABLE `comments`
ADD CONSTRAINT `fk_comments_user_id`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add foreign key for comments.content_id -> content.id
-- ON DELETE CASCADE: If content is deleted, delete all related comments
ALTER TABLE `comments`
ADD CONSTRAINT `fk_comments_content_id`
FOREIGN KEY (`content_id`) REFERENCES `content`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add foreign key for comments.parent_id -> comments.id
-- ON DELETE CASCADE: If parent comment is deleted, delete all replies
ALTER TABLE `comments`
ADD CONSTRAINT `fk_comments_parent_id`
FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add foreign key for user_achievements.user_id -> users.id
-- ON DELETE CASCADE: If user is deleted, delete all their achievements
ALTER TABLE `user_achievements`
ADD CONSTRAINT `fk_user_achievements_user_id`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add foreign key for user_achievements.achievement_id -> achievements.id
-- ON DELETE CASCADE: If achievement is deleted, remove from all users
ALTER TABLE `user_achievements`
ADD CONSTRAINT `fk_user_achievements_achievement_id`
FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Foreign key constraints added successfully' AS message;

-- ============================================
-- STEP 6: Add Unique Constraints
-- ============================================

SELECT '=== Step 6: Adding unique constraints ===' AS message;

-- Add unique constraint for registered users: one judgment per content
-- Check if constraint exists first
SET @constraint_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND CONSTRAINT_NAME = 'uk_user_content_judgment'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `judgments` ADD CONSTRAINT `uk_user_content_judgment` UNIQUE (`user_id`, `content_id`)',
    'SELECT "Constraint uk_user_content_judgment already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unique constraint for guests: one judgment per content
SET @constraint_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND CONSTRAINT_NAME = 'uk_guest_content_judgment'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `judgments` ADD CONSTRAINT `uk_guest_content_judgment` UNIQUE (`guest_id`, `content_id`)',
    'SELECT "Constraint uk_guest_content_judgment already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Unique constraints added successfully' AS message;

-- ============================================
-- STEP 7: Add Performance Indexes
-- ============================================

SELECT '=== Step 7: Adding performance indexes ===' AS message;

-- Index for comments: frequently queried by content_id and sorted by created_at
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND INDEX_NAME = 'idx_content_created'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `idx_content_created` ON `comments` (`content_id`, `created_at` DESC)',
    'SELECT "Index idx_content_created already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for judgments: user activity timeline
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND INDEX_NAME = 'idx_user_created'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `idx_user_created` ON `judgments` (`user_id`, `created_at` DESC)',
    'SELECT "Index idx_user_created already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for judgments: content statistics (already has idx_content_id, but add composite for better performance)
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND INDEX_NAME = 'idx_content_correct'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `idx_content_correct` ON `judgments` (`content_id`, `is_correct`)',
    'SELECT "Index idx_content_correct already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for comments: user activity
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND INDEX_NAME = 'idx_user_created'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX `idx_user_created` ON `comments` (`user_id`, `created_at` DESC)',
    'SELECT "Index idx_user_created already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Performance indexes added successfully' AS message;

-- ============================================
-- STEP 8: Verification
-- ============================================

SELECT '=== Step 8: Verifying migration results ===' AS message;

-- Show all foreign keys
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

-- Show all unique constraints
SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND CONSTRAINT_TYPE = 'UNIQUE'
ORDER BY TABLE_NAME;

-- Show all indexes
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE
ORDER BY TABLE_NAME, INDEX_NAME;

-- Verify accuracy column types
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('accuracy', 'weeklyAccuracy');

-- Restore settings
SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SELECT '=== Migration completed successfully! ===' AS message;
