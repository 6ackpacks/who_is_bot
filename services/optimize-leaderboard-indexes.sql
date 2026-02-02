-- ============================================
-- 排行榜性能优化 - 索引优化脚本
-- 数据库: who_is_bot
-- 目的: 优化排行榜查询性能
-- 日期: 2026-02-02
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 1. 分析当前索引使用情况
-- ============================================

-- 查看当前 users 表的索引
SHOW INDEX FROM `users`;

-- 分析排行榜查询的执行计划
EXPLAIN SELECT * FROM users
WHERE totalJudged >= 5
ORDER BY accuracy DESC, totalJudged DESC
LIMIT 50;

-- ============================================
-- 2. 添加复合索引优化排行榜查询
-- ============================================

-- 方案1: 基础复合索引（推荐）
-- 用于排行榜查询的过滤和排序
ALTER TABLE `users`
ADD INDEX `idx_leaderboard_query` (`totalJudged`, `accuracy` DESC);

-- 方案2: 覆盖索引（高级优化，可选）
-- 包含查询所需的所有字段，避免回表查询
-- 注意: 此索引较大，会占用更多存储空间
-- ALTER TABLE `users`
-- ADD INDEX `idx_leaderboard_covering` (
--   `totalJudged`,
--   `accuracy` DESC,
--   `id`,
--   `nickname`,
--   `avatar`(100),  -- TEXT 类型需要指定长度
--   `level`,
--   `maxStreak`,
--   `weeklyAccuracy`,
--   `weeklyJudged`
-- );

-- ============================================
-- 3. 添加其他常用查询的索引
-- ============================================

-- 周排行榜查询索引
ALTER TABLE `users`
ADD INDEX `idx_weekly_leaderboard` (`weeklyJudged`, `weeklyAccuracy` DESC);

-- 按等级查询索引（如果需要按等级筛选排行榜）
-- 已存在 idx_level，无需重复添加

-- ============================================
-- 4. 验证索引效果
-- ============================================

-- 再次查看索引
SHOW INDEX FROM `users`;

-- 再次分析执行计划，对比优化效果
EXPLAIN SELECT * FROM users
WHERE totalJudged >= 5
ORDER BY accuracy DESC, totalJudged DESC
LIMIT 50;

-- 测试查询性能
SELECT BENCHMARK(1000, (
  SELECT * FROM users
  WHERE totalJudged >= 5
  ORDER BY accuracy DESC, totalJudged DESC
  LIMIT 50
));

-- ============================================
-- 5. 索引维护建议
-- ============================================

-- 定期分析表以更新索引统计信息
ANALYZE TABLE `users`;

-- 优化表（整理碎片）
-- 注意: 此操作会锁表，建议在低峰期执行
-- OPTIMIZE TABLE `users`;

-- ============================================
-- 6. 监控查询性能
-- ============================================

-- 启用慢查询日志（如果未启用）
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 0.1; -- 记录超过100ms的查询

-- 查看慢查询
-- SELECT * FROM mysql.slow_log
-- WHERE sql_text LIKE '%users%'
-- ORDER BY query_time DESC
-- LIMIT 10;

-- ============================================
-- 7. 索引大小分析
-- ============================================

-- 查看表和索引大小
SELECT
  TABLE_NAME,
  ROUND(DATA_LENGTH/1024/1024, 2) AS 'Data_MB',
  ROUND(INDEX_LENGTH/1024/1024, 2) AS 'Index_MB',
  ROUND((DATA_LENGTH + INDEX_LENGTH)/1024/1024, 2) AS 'Total_MB',
  TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users';

-- ============================================
-- 8. 回滚脚本（如果需要删除索引）
-- ============================================

-- 如果索引效果不佳或占用空间过大，可以删除
-- DROP INDEX `idx_leaderboard_query` ON `users`;
-- DROP INDEX `idx_weekly_leaderboard` ON `users`;
-- DROP INDEX `idx_leaderboard_covering` ON `users`;

-- ============================================
-- 完成
-- ============================================

SELECT '=== 索引优化完成 ===' AS message;
SELECT '请运行并发测试验证性能提升效果' AS next_step;
