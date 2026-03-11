-- 检查用户表中的头像数据
-- 这个SQL脚本可以帮助你验证数据库中的avatar字段

-- 1. 查看所有用户的头像数据（显示前10条）
SELECT
  id,
  nickname,
  uid,
  avatar,
  CASE
    WHEN avatar IS NULL THEN '❌ NULL'
    WHEN avatar = '' THEN '❌ 空字符串'
    WHEN avatar LIKE 'https://thirdwx.qlogo.cn%' THEN '✅ 微信头像'
    WHEN avatar LIKE 'https://api.dicebear.com%' THEN '✅ DiceBear头像'
    ELSE '⚠️ 其他来源'
  END as avatar_status,
  LENGTH(avatar) as avatar_length,
  createdAt
FROM users
ORDER BY createdAt DESC
LIMIT 10;

-- 2. 统计头像数据情况
SELECT
  COUNT(*) as total_users,
  COUNT(avatar) as has_avatar,
  COUNT(*) - COUNT(avatar) as null_avatar,
  ROUND(COUNT(avatar) * 100.0 / COUNT(*), 2) as avatar_percentage
FROM users;

-- 3. 查看特定用户的头像（替换为你的用户昵称）
SELECT
  id,
  nickname,
  uid,
  avatar,
  createdAt
FROM users
WHERE nickname = '微信用户';

-- 4. 查看最近发表评论的用户头像
SELECT DISTINCT
  u.id,
  u.nickname,
  u.avatar,
  COUNT(c.id) as comment_count
FROM users u
LEFT JOIN comments c ON u.id = c.userId
GROUP BY u.id, u.nickname, u.avatar
HAVING comment_count > 0
ORDER BY comment_count DESC
LIMIT 10;

-- 5. 查找所有avatar为NULL的用户
SELECT
  id,
  nickname,
  uid,
  totalJudged,
  createdAt
FROM users
WHERE avatar IS NULL
ORDER BY createdAt DESC
LIMIT 20;
