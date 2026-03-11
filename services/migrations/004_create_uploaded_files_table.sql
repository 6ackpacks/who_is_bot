-- 创建上传文件表
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` VARCHAR(36) PRIMARY KEY,
  `key` VARCHAR(500) NOT NULL COMMENT '文件在 OSS 中的 key',
  `url` VARCHAR(1000) NOT NULL COMMENT '文件访问 URL',
  `filename` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `content_type` VARCHAR(100) NOT NULL COMMENT '文件 MIME 类型',
  `size` BIGINT NOT NULL COMMENT '文件大小（字节）',
  `reference_count` INT DEFAULT 0 COMMENT '引用计数',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  INDEX `idx_key` (`key`),
  INDEX `idx_content_type` (`content_type`),
  INDEX `idx_uploaded_at` (`uploaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上传文件记录表';
