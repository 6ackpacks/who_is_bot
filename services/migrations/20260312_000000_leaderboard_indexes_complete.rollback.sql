-- ============================================
-- 排行榜索引回滚脚本
-- 数据库: who_is_bot
-- 日期: 2026-03-12
-- ============================================

USE `who_is_bot`;

-- 删除全局排行榜索引
DROP INDEX IF EXISTS `idx_leaderboard_accuracy` ON `users`;
DROP INDEX IF EXISTS `idx_leaderboard_judgments` ON `users`;

-- 删除周排行榜索引
DROP INDEX IF EXISTS `idx_weekly_leaderboard_accuracy` ON `users`;
DROP INDEX IF EXISTS `idx_weekly_leaderboard_judgments` ON `users`;

-- 删除其他排行榜索引
DROP INDEX IF EXISTS `idx_leaderboard_max_streak` ON `users`;
DROP INDEX IF EXISTS `idx_leaderboard_bots_busted` ON `users`;

-- 删除月排行榜查询索引
DROP INDEX IF EXISTS `idx_judgments_monthly_stats` ON `judgments`;
DROP INDEX IF EXISTS `idx_judgments_user_time` ON `judgments`;

SELECT '=== 排行榜索引已回滚 ===' AS message;
