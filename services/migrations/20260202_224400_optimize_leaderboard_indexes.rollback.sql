-- ============================================
-- 回滚脚本: 排行榜性能优化
-- 版本: 20260202_224400
-- 对应迁移: optimize-leaderboard-indexes.sql
-- 日期: 2026-02-02
-- 说明: 回滚排行榜性能优化索引
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 回滚操作
-- ============================================

-- 删除排行榜查询索引
DROP INDEX IF EXISTS `idx_leaderboard_query` ON `users`;

-- 删除周排行榜索引
DROP INDEX IF EXISTS `idx_weekly_leaderboard` ON `users`;

-- 删除覆盖索引（如果创建了）
DROP INDEX IF EXISTS `idx_leaderboard_covering` ON `users`;

-- ============================================
-- 验证回滚
-- ============================================

SELECT '=== 验证回滚结果 ===' AS '';

-- 验证 idx_leaderboard_query 已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ idx_leaderboard_query 已删除' ELSE '❌ idx_leaderboard_query 仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'idx_leaderboard_query';

-- 验证 idx_weekly_leaderboard 已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ idx_weekly_leaderboard 已删除' ELSE '❌ idx_weekly_leaderboard 仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'idx_weekly_leaderboard';

-- 验证 idx_leaderboard_covering 已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ idx_leaderboard_covering 已删除' ELSE '❌ idx_leaderboard_covering 仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'idx_leaderboard_covering';

SELECT '=== 回滚完成 ===' AS '';
SELECT '注意: 删除这些索引会显著降低排行榜查询性能' AS warning;
