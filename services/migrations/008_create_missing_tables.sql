-- ============================================
-- 迁移文件：008_create_missing_tables.sql
-- 创建时间：2026-03-11
-- 说明：创建缺失的 admins 和 uploaded_files 表
--       这两个表在旧数据库（prod）中存在，但在新数据库中缺失
-- ============================================

-- ============================================
-- 1. 创建 admins 表（管理员表）
-- ============================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(36) NOT NULL COMMENT '管理员唯一标识',
  `username` VARCHAR(50) NOT NULL COMMENT '管理员用户名',
  `password` VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密的密码',
  `role` ENUM('super', 'normal') NOT NULL DEFAULT 'normal' COMMENT '管理员角色：super=超级管理员，normal=普通管理员',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `last_login_at` DATETIME(6) NULL COMMENT '最后登录时间',
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_admins_username` (`username`),
  INDEX `IDX_admins_username_password` (`username`, `password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================
-- 2. 创建 uploaded_files 表（上传文件记录表）
-- ============================================
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` VARCHAR(36) NOT NULL COMMENT '文件唯一标识',
  `key` VARCHAR(500) NOT NULL COMMENT '文件在 OSS 中的 key',
  `url` VARCHAR(1000) NOT NULL COMMENT '文件访问 URL',
  `filename` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `content_type` VARCHAR(100) NOT NULL COMMENT '文件 MIME 类型',
  `size` BIGINT NOT NULL COMMENT '文件大小（字节）',
  `reference_count` INT DEFAULT 0 COMMENT '引用计数',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (`id`),
  INDEX `idx_key` (`key`),
  INDEX `idx_content_type` (`content_type`),
  INDEX `idx_uploaded_at` (`uploaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上传文件记录表';

-- ============================================
-- 验证表创建结果
-- ============================================
SELECT
    'admins' AS table_name,
    COUNT(*) AS record_count
FROM admins
UNION ALL
SELECT
    'uploaded_files' AS table_name,
    COUNT(*) AS record_count
FROM uploaded_files;

-- ============================================
-- 回滚语句（如需回滚，请执行以下语句）
-- ============================================
-- DROP TABLE IF EXISTS `admins`;
-- DROP TABLE IF EXISTS `uploaded_files`;
