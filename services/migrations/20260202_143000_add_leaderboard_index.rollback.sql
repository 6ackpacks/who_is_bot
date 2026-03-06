-- ============================================
-- 回滚脚本: 添加排行榜索引
-- 版本: 20260202_143000
-- 对应迁移: 20260202_143000_add_leaderboard_index.sql
-- 日期: 2026-02-02
-- 说明: 回滚排行榜索引的添加
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 回滚操作
-- ============================================

-- 删除排行榜索引
DROP INDEX IF EXISTS `IDX_USER_LEADERBOARD` ON `users`;

-- ============================================
-- 验证回滚
-- ============================================

-- 验证索引已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ 索引已删除' ELSE '❌ 索引仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'IDX_USER_LEADERBOARD';

SELECT '=== 回滚完成 ===' AS message;
SELECT '注意: 删除索引会降低排行榜查询性能' AS warning;
