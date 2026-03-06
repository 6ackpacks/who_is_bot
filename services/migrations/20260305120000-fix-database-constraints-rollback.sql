-- ============================================
-- Rollback Migration: Fix Database Constraints and Data Integrity
-- Date: 2026-03-05 12:00:00
-- Version: 1.0
-- Description: Rollback script to undo all changes from the main migration
-- WARNING: This will remove all foreign keys, unique constraints, and indexes added by the migration
-- ============================================

USE `who_is_bot`;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

SELECT '=== Starting rollback process ===' AS message;

-- ============================================
-- STEP 1: Remove Performance Indexes
-- ============================================

SELECT '=== Step 1: Removing performance indexes ===' AS message;

-- Drop comments content_created index
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND INDEX_NAME = 'idx_content_created'
);

SET @sql = IF(@index_exists > 0,
    'DROP INDEX `idx_content_created` ON `comments`',
    'SELECT "Index idx_content_created does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop judgments user_created index
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND INDEX_NAME = 'idx_user_created'
);

SET @sql = IF(@index_exists > 0,
    'DROP INDEX `idx_user_created` ON `judgments`',
    'SELECT "Index idx_user_created does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop judgments content_correct index
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND INDEX_NAME = 'idx_content_correct'
);

SET @sql = IF(@index_exists > 0,
    'DROP INDEX `idx_content_correct` ON `judgments`',
    'SELECT "Index idx_content_correct does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop comments user_created index
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND INDEX_NAME = 'idx_user_created'
);

SET @sql = IF(@index_exists > 0,
    'DROP INDEX `idx_user_created` ON `comments`',
    'SELECT "Index idx_user_created does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Performance indexes removed' AS message;

-- ============================================
-- STEP 2: Remove Unique Constraints
-- ============================================

SELECT '=== Step 2: Removing unique constraints ===' AS message;

-- Drop unique constraint for registered users
SET @constraint_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND CONSTRAINT_NAME = 'uk_user_content_judgment'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE `judgments` DROP INDEX `uk_user_content_judgment`',
    'SELECT "Constraint uk_user_content_judgment does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop unique constraint for guests
SET @constraint_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND CONSTRAINT_NAME = 'uk_guest_content_judgment'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE `judgments` DROP INDEX `uk_guest_content_judgment`',
    'SELECT "Constraint uk_guest_content_judgment does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Unique constraints removed' AS message;

-- ============================================
-- STEP 3: Remove Foreign Key Constraints
-- ============================================

SELECT '=== Step 3: Removing foreign key constraints ===' AS message;

-- Drop foreign keys from user_achievements table
SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_achievements'
    AND CONSTRAINT_NAME = 'fk_user_achievements_achievement_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `user_achievements` DROP FOREIGN KEY `fk_user_achievements_achievement_id`',
    'SELECT "FK fk_user_achievements_achievement_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_achievements'
    AND CONSTRAINT_NAME = 'fk_user_achievements_user_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `user_achievements` DROP FOREIGN KEY `fk_user_achievements_user_id`',
    'SELECT "FK fk_user_achievements_user_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from comments table
SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND CONSTRAINT_NAME = 'fk_comments_parent_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_parent_id`',
    'SELECT "FK fk_comments_parent_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND CONSTRAINT_NAME = 'fk_comments_content_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_content_id`',
    'SELECT "FK fk_comments_content_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comments'
    AND CONSTRAINT_NAME = 'fk_comments_user_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_user_id`',
    'SELECT "FK fk_comments_user_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign keys from judgments table
SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND CONSTRAINT_NAME = 'fk_judgments_content_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `judgments` DROP FOREIGN KEY `fk_judgments_content_id`',
    'SELECT "FK fk_judgments_content_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'judgments'
    AND CONSTRAINT_NAME = 'fk_judgments_user_id'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `judgments` DROP FOREIGN KEY `fk_judgments_user_id`',
    'SELECT "FK fk_judgments_user_id does not exist" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Foreign key constraints removed' AS message;

-- ============================================
-- STEP 4: Revert Column Types (accuracy fields)
-- ============================================

SELECT '=== Step 4: Reverting accuracy column types ===' AS message;

-- Revert accuracy from DECIMAL(5,2) back to FLOAT
ALTER TABLE `users`
MODIFY COLUMN `accuracy` FLOAT NOT NULL DEFAULT 0;

-- Revert weeklyAccuracy from DECIMAL(5,2) back to FLOAT
ALTER TABLE `users`
MODIFY COLUMN `weeklyAccuracy` FLOAT NOT NULL DEFAULT 0;

SELECT 'Accuracy fields reverted to FLOAT' AS message;

-- ============================================
-- STEP 5: Verification
-- ============================================

SELECT '=== Step 5: Verifying rollback results ===' AS message;

-- Verify no foreign keys exist (should be empty or only show pre-existing ones)
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND CONSTRAINT_NAME IN (
    'fk_judgments_user_id',
    'fk_judgments_content_id',
    'fk_comments_user_id',
    'fk_comments_content_id',
    'fk_comments_parent_id',
    'fk_user_achievements_user_id',
    'fk_user_achievements_achievement_id'
  )
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Verify unique constraints removed
SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND CONSTRAINT_NAME IN ('uk_user_content_judgment', 'uk_guest_content_judgment')
ORDER BY TABLE_NAME;

-- Verify indexes removed
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND INDEX_NAME IN ('idx_content_created', 'idx_user_created', 'idx_content_correct')
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

-- Verify accuracy column types
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('accuracy', 'weeklyAccuracy');

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SELECT '=== Rollback completed successfully! ===' AS message;
SELECT 'Database schema has been reverted to pre-migration state' AS note;
