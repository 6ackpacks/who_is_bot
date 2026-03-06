-- ============================================
-- 回滚脚本: 添加微信登录字段
-- 版本: 20260204_195900
-- 对应迁移: add-wechat-fields.sql
-- 日期: 2026-02-04
-- 说明: 回滚微信登录相关字段的添加
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 回滚操作
-- ============================================

-- 删除索引
DROP INDEX IF EXISTS `idx_openid` ON `users`;
DROP INDEX IF EXISTS `idx_unionid` ON `users`;

-- 删除字段（按照添加的相反顺序）
ALTER TABLE `users` DROP COLUMN IF EXISTS `sessionKey`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `unionid`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `openid`;

-- ============================================
-- 验证回滚
-- ============================================

SELECT '=== 验证回滚结果 ===' AS '';

-- 验证 openid 字段已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ openid 字段已删除' ELSE '❌ openid 字段仍存在' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'openid';

-- 验证 unionid 字段已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ unionid 字段已删除' ELSE '❌ unionid 字段仍存在' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'unionid';

-- 验证 sessionKey 字段已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ sessionKey 字段已删除' ELSE '❌ sessionKey 字段仍存在' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'sessionKey';

-- 验证索引已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ 所有索引已删除' ELSE '❌ 部分索引仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME IN ('idx_openid', 'idx_unionid');

SELECT '=== 回滚完成 ===' AS '';
SELECT '注意: 回滚后将无法使用微信登录功能' AS warning;
