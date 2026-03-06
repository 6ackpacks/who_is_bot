-- ============================================
-- 更新现有用户的准确率数据
-- 数据库: who_is_bot
-- 说明: 修复现有 TestUser 的准确率为 0 的问题
-- ============================================

USE `who_is_bot`;

-- 更新 TestUser1-20 的准确率和统计数据
UPDATE users SET
  accuracy = 94.5,
  correct_count = 274,
  weeklyAccuracy = 92.3,
  weeklyCorrect = 60,
  weeklyJudged = 65
WHERE nickname = 'TestUser20';

UPDATE users SET
  accuracy = 92.7,
  correct_count = 260,
  weeklyAccuracy = 90.8,
  weeklyCorrect = 69,
  weeklyJudged = 76
WHERE nickname = 'TestUser19';

UPDATE users SET
  accuracy = 91.8,
  correct_count = 248,
  weeklyAccuracy = 89.5,
  weeklyCorrect = 51,
  weeklyJudged = 57
WHERE nickname = 'TestUser18';

UPDATE users SET
  accuracy = 89.2,
  correct_count = 232,
  weeklyAccuracy = 87.1,
  weeklyCorrect = 54,
  weeklyJudged = 62
WHERE nickname = 'TestUser17';

UPDATE users SET
  accuracy = 88.4,
  correct_count = 221,
  weeklyAccuracy = 86.2,
  weeklyCorrect = 50,
  weeklyJudged = 58
WHERE nickname = 'TestUser16';

UPDATE users SET
  accuracy = 86.7,
  correct_count = 208,
  weeklyAccuracy = 85.2,
  weeklyCorrect = 46,
  weeklyJudged = 54
WHERE nickname = 'TestUser15';

UPDATE users SET
  accuracy = 84.3,
  correct_count = 193,
  weeklyAccuracy = 82.6,
  weeklyCorrect = 38,
  weeklyJudged = 46
WHERE nickname = 'TestUser14';

UPDATE users SET
  accuracy = 83.6,
  correct_count = 184,
  weeklyAccuracy = 81.8,
  weeklyCorrect = 45,
  weeklyJudged = 55
WHERE nickname = 'TestUser13';

UPDATE users SET
  accuracy = 82.1,
  correct_count = 172,
  weeklyAccuracy = 80.4,
  weeklyCorrect = 41,
  weeklyJudged = 51
WHERE nickname = 'TestUser12';

UPDATE users SET
  accuracy = 81.2,
  correct_count = 162,
  weeklyAccuracy = 79.6,
  weeklyCorrect = 39,
  weeklyJudged = 49
WHERE nickname = 'TestUser11';

UPDATE users SET
  accuracy = 79.8,
  correct_count = 151,
  weeklyAccuracy = 78.3,
  weeklyCorrect = 36,
  weeklyJudged = 46
WHERE nickname = 'TestUser10';

UPDATE users SET
  accuracy = 77.5,
  correct_count = 139,
  weeklyAccuracy = 75.8,
  weeklyCorrect = 25,
  weeklyJudged = 33
WHERE nickname = 'TestUser9';

UPDATE users SET
  accuracy = 76.9,
  correct_count = 131,
  weeklyAccuracy = 74.5,
  weeklyCorrect = 35,
  weeklyJudged = 47
WHERE nickname = 'TestUser8';

UPDATE users SET
  accuracy = 75.2,
  correct_count = 121,
  weeklyAccuracy = 73.5,
  weeklyCorrect = 25,
  weeklyJudged = 34
WHERE nickname = 'TestUser7';

UPDATE users SET
  accuracy = 72.8,
  correct_count = 109,
  weeklyAccuracy = 71.4,
  weeklyCorrect = 20,
  weeklyJudged = 28
WHERE nickname = 'TestUser6';

UPDATE users SET
  accuracy = 70.3,
  correct_count = 98,
  weeklyAccuracy = 69.2,
  weeklyCorrect = 18,
  weeklyJudged = 26
WHERE nickname = 'TestUser5';

UPDATE users SET
  accuracy = 68.5,
  correct_count = 89,
  weeklyAccuracy = 66.7,
  weeklyCorrect = 14,
  weeklyJudged = 21
WHERE nickname = 'TestUser4';

UPDATE users SET
  accuracy = 66.2,
  correct_count = 79,
  weeklyAccuracy = 64.3,
  weeklyCorrect = 9,
  weeklyJudged = 14
WHERE nickname = 'TestUser3';

UPDATE users SET
  accuracy = 64.8,
  correct_count = 71,
  weeklyAccuracy = 62.5,
  weeklyCorrect = 10,
  weeklyJudged = 16
WHERE nickname = 'TestUser2';

UPDATE users SET
  accuracy = 62.5,
  correct_count = 63,
  weeklyAccuracy = 60.0,
  weeklyCorrect = 6,
  weeklyJudged = 10
WHERE nickname = 'TestUser1';

-- 更新等级（根据 totalJudged）
UPDATE users SET level = 4 WHERE nickname LIKE 'TestUser%' AND totalJudged >= 100;
UPDATE users SET level = 3 WHERE nickname LIKE 'TestUser%' AND totalJudged >= 50 AND totalJudged < 100;
UPDATE users SET level = 2 WHERE nickname LIKE 'TestUser%' AND totalJudged >= 10 AND totalJudged < 50;

-- 验证更新结果
SELECT
  nickname,
  level,
  accuracy,
  totalJudged,
  correct_count,
  weeklyAccuracy,
  weeklyJudged
FROM users
WHERE nickname LIKE 'TestUser%'
ORDER BY accuracy DESC
LIMIT 10;

-- ==================== 完成 ====================
-- 已更新 TestUser1-20 的准确率数据
-- 现在排行榜应该能正确显示了
