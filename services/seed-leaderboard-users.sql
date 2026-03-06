-- ============================================
-- 排行榜用户数据填充脚本
-- 数据库: who_is_bot
-- 说明: 插入真实的用户数据，让排行榜更真实
-- ============================================

-- ⚠️ 警告：此脚本仅用于开发和测试环境
-- ⚠️ 禁止在生产环境执行此脚本

USE `who_is_bot`;

-- 清空现有测试用户（可选，谨慎使用）
-- DELETE FROM users WHERE uid LIKE 'seed_%';

-- ==================== 插入排行榜用户数据 ====================

-- 用户1: 顶级玩家 - 硅谷天才
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '赛博侦探',
  'seed_user_001',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  4,
  94.5,
  245,
  232,
  15,
  28,
  180,
  92.3,
  65,
  60,
  NOW(),
  NOW()
);

-- 用户2: 高级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  'AI猎手',
  'seed_user_002',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  4,
  91.8,
  198,
  182,
  8,
  22,
  145,
  89.5,
  57,
  51,
  NOW(),
  NOW()
);

-- 用户3: 高级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '机器克星',
  'seed_user_003',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
  4,
  89.2,
  176,
  157,
  5,
  18,
  128,
  87.1,
  62,
  54,
  NOW(),
  NOW()
);

-- 用户4: 中级玩家 - 人机杀手
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '数字游侠',
  'seed_user_004',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
  3,
  86.7,
  150,
  130,
  3,
  15,
  98,
  85.2,
  54,
  46,
  NOW(),
  NOW()
);

-- 用户5: 中级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '真相追寻者',
  'seed_user_005',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  3,
  84.3,
  134,
  113,
  2,
  12,
  87,
  82.6,
  46,
  38,
  NOW(),
  NOW()
);

-- 用户6: 中级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '代码破译师',
  'seed_user_006',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  3,
  82.1,
  123,
  101,
  0,
  10,
  76,
  80.4,
  51,
  41,
  NOW(),
  NOW()
);

-- 用户7: 中级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '像素侦探',
  'seed_user_007',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  3,
  79.8,
  109,
  87,
  1,
  9,
  65,
  78.3,
  46,
  36,
  NOW(),
  NOW()
);

-- 用户8: 初级玩家 - 胜似人机
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '算法观察者',
  'seed_user_008',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  2,
  77.5,
  89,
  69,
  0,
  7,
  52,
  75.8,
  33,
  25,
  NOW(),
  NOW()
);

-- 用户9: 初级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '数据猎人',
  'seed_user_009',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  2,
  75.2,
  77,
  58,
  0,
  6,
  43,
  73.5,
  34,
  25,
  NOW(),
  NOW()
);

-- 用户10: 初级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '智能识别师',
  'seed_user_010',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  2,
  72.8,
  68,
  50,
  0,
  5,
  38,
  71.4,
  28,
  20,
  NOW(),
  NOW()
);

-- 用户11: 初级玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '模式识别者',
  'seed_user_011',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop',
  2,
  70.3,
  64,
  45,
  0,
  4,
  34,
  69.2,
  26,
  18,
  NOW(),
  NOW()
);

-- 用户12: 新手玩家 - AI小白
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '好奇探索者',
  'seed_user_012',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  2,
  68.5,
  54,
  37,
  0,
  3,
  28,
  66.7,
  21,
  14,
  NOW(),
  NOW()
);

-- 用户13: 新手玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '逻辑推理家',
  'seed_user_013',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  2,
  66.2,
  47,
  31,
  0,
  3,
  23,
  64.3,
  14,
  9,
  NOW(),
  NOW()
);

-- 用户14: 新手玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '技术学徒',
  'seed_user_014',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  2,
  64.8,
  42,
  27,
  0,
  2,
  20,
  62.5,
  16,
  10,
  NOW(),
  NOW()
);

-- 用户15: 新手玩家
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '新手侦探',
  'seed_user_015',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop',
  2,
  62.5,
  32,
  20,
  0,
  2,
  15,
  60.0,
  10,
  6,
  NOW(),
  NOW()
);

-- 用户16-20: 更多多样化的用户
INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '量子观察员',
  'seed_user_016',
  'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=200&h=200&fit=crop',
  3,
  81.2,
  118,
  96,
  1,
  11,
  72,
  79.6,
  49,
  39,
  NOW(),
  NOW()
);

INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '神经网络猎手',
  'seed_user_017',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop',
  4,
  88.4,
  164,
  145,
  6,
  16,
  112,
  86.2,
  58,
  50,
  NOW(),
  NOW()
);

INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '深度学习破解者',
  'seed_user_018',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop',
  3,
  76.9,
  95,
  73,
  0,
  8,
  56,
  74.5,
  47,
  35,
  NOW(),
  NOW()
);

INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '图灵测试专家',
  'seed_user_019',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop',
  4,
  92.7,
  220,
  204,
  12,
  25,
  165,
  90.8,
  76,
  69,
  NOW(),
  NOW()
);

INSERT INTO users (id, nickname, uid, avatar, level, accuracy, totalJudged, correct_count, streak, maxStreak, totalBotsBusted, weeklyAccuracy, weeklyJudged, weeklyCorrect, createdAt, updatedAt)
VALUES (
  UUID(),
  '算法终结者',
  'seed_user_020',
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop',
  3,
  83.6,
  140,
  117,
  4,
  13,
  89,
  81.8,
  55,
  45,
  NOW(),
  NOW()
);

-- ==================== 数据验证查询 ====================

-- 查看插入的用户数据（按准确率排序）
SELECT
  nickname,
  level,
  accuracy,
  totalJudged,
  correct_count,
  streak,
  maxStreak,
  weeklyAccuracy,
  weeklyJudged
FROM users
WHERE uid LIKE 'seed_%'
ORDER BY accuracy DESC;

-- 统计各等级用户数量
SELECT
  level,
  COUNT(*) as user_count,
  AVG(accuracy) as avg_accuracy,
  AVG(totalJudged) as avg_judged
FROM users
WHERE uid LIKE 'seed_%'
GROUP BY level
ORDER BY level DESC;

-- ==================== 完成 ====================
-- 脚本执行完成！
-- 已插入 20 个测试用户，包含：
-- - 4级（硅谷天才）: 5 个用户
-- - 3级（人机杀手）: 8 个用户
-- - 2级（胜似人机）: 7 个用户
--
-- 所有用户都有：
-- - 真实的 Unsplash 头像
-- - 合理的统计数据（准确率 60%-95%）
-- - 不同的答题数量（32-245题）
-- - 周统计数据
