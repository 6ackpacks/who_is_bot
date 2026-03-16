-- ============================================
-- 排行榜性能优化索引
-- 数据库: who_is_bot
-- 日期: 2026-03-12
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 1. 全局排行榜索引
-- ============================================

-- 全局准确率排行榜索引（已存在，确保存在）
CREATE INDEX IF NOT EXISTS `idx_leaderboard_accuracy`
ON `users` (`total_judged`, `accuracy` DESC, `id`);

-- 全局判定次数排行榜索引
CREATE INDEX IF NOT EXISTS `idx_leaderboard_judgments`
ON `users` (`total_judged` DESC, `accuracy` DESC, `id`);

-- ============================================
-- 2. 周排行榜索引
-- ============================================

-- 周准确率排行榜索引
CREATE INDEX IF NOT EXISTS `idx_weekly_leaderboard_accuracy`
ON `users` (`weekly_judged`, `weekly_accuracy` DESC, `id`);

-- 周判定次数排行榜索引
CREATE INDEX IF NOT EXISTS `idx_weekly_leaderboard_judgments`
ON `users` (`weekly_judged` DESC, `weekly_accuracy` DESC, `id`);

-- ============================================
-- 3. 其他排行榜索引
-- ============================================

-- 最高连胜排行榜索引
CREATE INDEX IF NOT EXISTS `idx_leaderboard_max_streak`
ON `users` (`total_judged`, `max_streak` DESC, `accuracy` DESC, `id`);

-- AI识破数排行榜索引
CREATE INDEX IF NOT EXISTS `idx_leaderboard_bots_busted`
ON `users` (`total_judged`, `total_bots_busted` DESC, `accuracy` DESC, `id`);

-- ============================================
-- 4. 月排行榜查询优化（judgments表）
-- ============================================

-- 优化月排行榜查询的索引
CREATE INDEX IF NOT EXISTS `idx_judgments_monthly_stats`
ON `judgments` (`user_id`, `created_at`, `is_correct`);

-- 用户ID和创建时间的复合索引（用于时间范围查询）
CREATE INDEX IF NOT EXISTS `idx_judgments_user_time`
ON `judgments` (`user_id`, `created_at` DESC);

-- ============================================
-- 5. 验证索引
-- ============================================

-- 查看 users 表的所有索引
SHOW INDEX FROM `users`;

-- 查看 judgments 表的所有索引
SHOW INDEX FROM `judgments`;

-- ============================================
-- 6. 分析查询性能
-- ============================================

-- 测试全局准确率排行榜查询
EXPLAIN SELECT * FROM users
WHERE total_judged >= 5
ORDER BY accuracy DESC, total_judged DESC
LIMIT 50;

-- 测试周排行榜查询
EXPLAIN SELECT * FROM users
WHERE weekly_judged >= 5
ORDER BY weekly_accuracy DESC, weekly_judged DESC
LIMIT 50;

-- 测试月排行榜查询
EXPLAIN SELECT
  u.id, u.nickname, u.avatar, u.level,
  COUNT(j.id) as monthly_judged,
  ROUND(SUM(CASE WHEN j.is_correct = true THEN 1 ELSE 0 END) * 100.0 / COUNT(j.id), 2) as monthly_accuracy
FROM users u
LEFT JOIN judgments j ON j.user_id = u.id
  AND j.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id
HAVING COUNT(j.id) >= 5
ORDER BY monthly_accuracy DESC, monthly_judged DESC
LIMIT 50;

-- ============================================
-- 7. 表统计信息更新
-- ============================================

-- 分析表以更新统计信息
ANALYZE TABLE `users`;
ANALYZE TABLE `judgments`;

-- ============================================
-- 8. 索引大小分析
-- ============================================

SELECT
  TABLE_NAME,
  INDEX_NAME,
  ROUND(STAT_VALUE * @@innodb_page_size / 1024 / 1024, 2) AS 'Size_MB'
FROM mysql.innodb_index_stats
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME IN ('users', 'judgments')
  AND STAT_NAME = 'size'
ORDER BY TABLE_NAME, Size_MB DESC;

-- ============================================
-- 完成
-- ============================================

SELECT '=== 排行榜索引优化完成 ===' AS message;
SELECT '建议定期运行 ANALYZE TABLE 以保持索引统计信息最新' AS recommendation;
