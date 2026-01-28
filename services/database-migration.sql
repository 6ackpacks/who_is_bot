-- ============================================
-- 数据库迁移脚本
-- 用于添加判定系统和统计功能
-- ============================================

-- 1. 创建 judgments 表
-- 用于记录每次用户判定
CREATE TABLE IF NOT EXISTS judgments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  content_id VARCHAR(36) NOT NULL,
  user_choice VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  guest_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
);

-- 添加索引以提高查询性能
CREATE INDEX idx_judgments_user_id ON judgments(user_id);
CREATE INDEX idx_judgments_content_id ON judgments(content_id);
CREATE INDEX idx_judgments_created_at ON judgments(created_at);
CREATE INDEX idx_judgments_guest_id ON judgments(guest_id);

-- 2. 修改 content 表
-- 添加投票统计字段
ALTER TABLE content
ADD COLUMN IF NOT EXISTS total_votes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_votes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS human_votes INT DEFAULT 0;

-- 添加正确投票数字段
ALTER TABLE content ADD COLUMN correct_votes INT DEFAULT 0;

-- 3. 修改 users 表
-- 添加正确数统计字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS correct_count INT DEFAULT 0;

-- 4. 如果已有数据，需要计算初始值
-- 根据现有的 accuracy 和 totalJudged 计算 correct_count
UPDATE users
SET correct_count = ROUND(total_judged * accuracy / 100)
WHERE total_judged > 0;

-- ============================================
-- 验证脚本
-- 运行以下查询验证迁移是否成功
-- ============================================

-- 检查 judgments 表是否创建成功
SELECT COUNT(*) as judgments_table_exists
FROM information_schema.tables
WHERE table_name = 'judgments';

-- 检查 content 表新字段
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'content'
AND column_name IN ('total_votes', 'ai_votes', 'human_votes');

-- 检查 users 表新字段
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'correct_count';

-- ============================================
-- 回滚脚本（如果需要）
-- ============================================

-- 警告：以下操作会删除数据，请谨慎使用！

-- DROP TABLE IF EXISTS judgments;
-- ALTER TABLE content DROP COLUMN IF EXISTS total_votes;
-- ALTER TABLE content DROP COLUMN IF EXISTS ai_votes;
-- ALTER TABLE content DROP COLUMN IF EXISTS human_votes;
-- ALTER TABLE users DROP COLUMN IF EXISTS correct_count;
