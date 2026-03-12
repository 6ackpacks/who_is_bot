-- ============================================================
-- 诊断 + 完整建表脚本
-- 数据库: who_is_bot (腾讯云 CynosDB MySQL)
-- 生成时间: 2026-03-12
-- 用途: 检查新数据库现状，并创建所有缺失的表和字段
-- 使用方法: 直接在数据库控制台执行
-- ============================================================

USE `who_is_bot`;

-- ============================================================
-- 第一部分：诊断查询（检查当前状态）
-- ============================================================

-- 1. 查看所有表
SHOW TABLES;

-- 2. 检查各表数据量
SELECT
  table_name,
  table_rows AS approximate_rows,
  ROUND(data_length / 1024 / 1024, 2) AS data_mb
FROM information_schema.tables
WHERE table_schema = 'who_is_bot'
ORDER BY table_name;

-- ============================================================
-- 第二部分：创建所有表（IF NOT EXISTS，安全可重复执行）
-- ============================================================

-- ----------------------------------------
-- 表1: users（用户表）
-- 对应 user.entity.ts
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`               VARCHAR(36)   NOT NULL COMMENT '用户UUID',
  `nickname`         VARCHAR(100)  NOT NULL COMMENT '昵称',
  `uid`              VARCHAR(50)   NOT NULL COMMENT '微信 openid / guestId',
  `level`            INT           NOT NULL DEFAULT 1 COMMENT '等级 1-4',
  `avatar`           TEXT          NULL COMMENT '头像URL',
  `avatar_update_time` VARCHAR(50) NULL COMMENT '头像更新时间',
  `gender`           INT           NULL COMMENT '性别',
  `city`             VARCHAR(50)   NULL COMMENT '城市',
  `accuracy`         FLOAT         NOT NULL DEFAULT 0 COMMENT '总体准确率(%)',
  `total_judged`     INT           NOT NULL DEFAULT 0 COMMENT '总判定次数',
  `streak`           INT           NOT NULL DEFAULT 0 COMMENT '当前连胜数',
  `max_streak`       INT           NOT NULL DEFAULT 0 COMMENT '最高连胜数',
  `total_bots_busted` INT          NOT NULL DEFAULT 0 COMMENT '总识破AI次数',
  `weekly_accuracy`  FLOAT         NOT NULL DEFAULT 0 COMMENT '本周准确率(%)',
  `weekly_judged`    INT           NOT NULL DEFAULT 0 COMMENT '本周判定次数',
  `weekly_correct`   INT           NOT NULL DEFAULT 0 COMMENT '本周正确次数',
  `last_week_reset`  TIMESTAMP     NULL COMMENT '上次周数据重置时间',
  `created_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at`       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_users_uid` (`uid`),
  INDEX `IDX_USER_LEADERBOARD` (`accuracy`, `total_judged`),
  INDEX `idx_leaderboard_accuracy` (`total_judged`, `accuracy` DESC, `id`),
  INDEX `idx_leaderboard_judgments` (`total_judged` DESC, `accuracy` DESC, `id`),
  INDEX `idx_weekly_leaderboard_accuracy` (`weekly_judged`, `weekly_accuracy` DESC, `id`),
  INDEX `idx_weekly_leaderboard_judgments` (`weekly_judged` DESC, `weekly_accuracy` DESC, `id`),
  INDEX `idx_leaderboard_max_streak` (`total_judged`, `max_streak` DESC, `accuracy` DESC, `id`),
  INDEX `idx_leaderboard_bots_busted` (`total_judged`, `total_bots_busted` DESC, `accuracy` DESC, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------------------
-- 表2: content（内容/题目表）
-- 对应 content.entity.ts，表名为 'content'（不是 contents）
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `content` (
  `id`              VARCHAR(36)   NOT NULL COMMENT '内容UUID',
  `type`            VARCHAR(20)   NOT NULL COMMENT '内容类型: text/video/image',
  `url`             TEXT          NULL COMMENT '资源URL（视频/图片）',
  `text`            TEXT          NULL COMMENT '文本内容（text类型使用）',
  `title`           VARCHAR(255)  NOT NULL COMMENT '内容标题/摘要',
  `is_bot`          TINYINT(1)    NOT NULL COMMENT '是否为AI生成: 1=AI, 0=人类',
  `model_tag`       VARCHAR(100)  NULL COMMENT 'AI模型标签（如 GPT-4）',
  `provider`        VARCHAR(100)  NULL COMMENT '内容提供方',
  `deception_rate`  FLOAT         NOT NULL DEFAULT 0 COMMENT '欺骗率（0-100），越高越难识别',
  `explanation`     TEXT          NOT NULL COMMENT '判定解析说明',
  `total_votes`     INT           NOT NULL DEFAULT 0 COMMENT '总投票数',
  `ai_votes`        INT           NOT NULL DEFAULT 0 COMMENT '认为是AI的投票数',
  `human_votes`     INT           NOT NULL DEFAULT 0 COMMENT '认为是人类的投票数',
  `correct_votes`   INT           NOT NULL DEFAULT 0 COMMENT '判断正确的投票数',
  `author_id`       VARCHAR(36)   NULL COMMENT '创建者用户ID',
  `created_at`      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at`      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_content_type` (`type`),
  INDEX `idx_content_deception_rate` (`deception_rate` DESC),
  INDEX `idx_content_created_at` (`created_at` DESC),
  CONSTRAINT `fk_content_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容/题目表';

-- ----------------------------------------
-- 表3: judgments（判定记录表）
-- 对应 judgment.entity.ts
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `judgments` (
  `id`          VARCHAR(36)   NOT NULL COMMENT '判定UUID',
  `user_id`     VARCHAR(36)   NULL COMMENT '登录用户ID（外键到 users.id）',
  `content_id`  VARCHAR(36)   NOT NULL COMMENT '内容ID（外键到 content.id）',
  `user_choice` VARCHAR(10)   NOT NULL COMMENT '用户选择: ai / human',
  `is_correct`  TINYINT(1)    NOT NULL COMMENT '是否判断正确',
  `guest_id`    VARCHAR(50)   NULL COMMENT '游客ID（未登录时使用）',
  `created_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '判定时间',
  PRIMARY KEY (`id`),
  INDEX `idx_judgments_user_id` (`user_id`),
  INDEX `idx_judgments_content_id` (`content_id`),
  INDEX `idx_judgments_guest_id` (`guest_id`),
  INDEX `idx_judgments_monthly_stats` (`user_id`, `created_at`, `is_correct`),
  INDEX `idx_judgments_user_time` (`user_id`, `created_at` DESC),
  -- 防止同一用户重复判定同一内容
  UNIQUE KEY `UQ_judgment_user_content` (`user_id`, `content_id`),
  CONSTRAINT `fk_judgment_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='判定记录表';

-- ----------------------------------------
-- 表4: comments（评论表）
-- 对应 comment.entity.ts
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `comments` (
  `id`          VARCHAR(36)   NOT NULL COMMENT '评论UUID',
  `content_id`  VARCHAR(36)   NOT NULL COMMENT '关联内容ID',
  `user_id`     VARCHAR(36)   NULL COMMENT '评论用户ID（NULL表示游客）',
  `guest_id`    VARCHAR(50)   NULL COMMENT '游客ID',
  `parent_id`   VARCHAR(36)   NULL COMMENT '父评论ID（回复时使用）',
  `content`     TEXT          NOT NULL COMMENT '评论内容',
  `likes`       INT           NOT NULL DEFAULT 0 COMMENT '点赞数',
  `created_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at`  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_comments_content_id` (`content_id`),
  INDEX `idx_comments_user_id` (`user_id`),
  INDEX `idx_comments_created_at` (`created_at` DESC),
  CONSTRAINT `fk_comments_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ----------------------------------------
-- 表5: achievements（成就定义表）
-- 对应 achievement.entity.ts
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `achievements` (
  `id`                  VARCHAR(36)   NOT NULL COMMENT '成就UUID',
  `name`                VARCHAR(100)  NOT NULL COMMENT '成就名称',
  `description`         TEXT          NOT NULL COMMENT '成就描述',
  `icon`                VARCHAR(255)  NULL COMMENT '成就图标',
  `type`                VARCHAR(50)   NOT NULL COMMENT '成就类型: judgment_count/accuracy/streak',
  `requirement_value`   INT           NOT NULL COMMENT '达成条件数值',
  `points`              INT           NOT NULL DEFAULT 0 COMMENT '成就积分',
  `created_at`          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_achievements_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就定义表';

-- ----------------------------------------
-- 表6: user_achievements（用户成就解锁记录）
-- 对应 user-achievement.entity.ts
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `user_achievements` (
  `id`              VARCHAR(36)   NOT NULL COMMENT '记录UUID',
  `user_id`         VARCHAR(36)   NOT NULL COMMENT '用户ID',
  `achievement_id`  VARCHAR(36)   NOT NULL COMMENT '成就ID',
  `unlocked_at`     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '解锁时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_user_achievement` (`user_id`, `achievement_id`),
  INDEX `idx_user_achievements_user_id` (`user_id`),
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ua_achievement` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就解锁记录';

-- ----------------------------------------
-- 表7: admins（管理员表）
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            VARCHAR(36)   NOT NULL COMMENT '管理员UUID',
  `username`      VARCHAR(50)   NOT NULL COMMENT '用户名',
  `password`      VARCHAR(255)  NOT NULL COMMENT 'bcrypt 加密密码',
  `role`          ENUM('super', 'normal') NOT NULL DEFAULT 'normal',
  `created_at`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_login_at` DATETIME(6)   NULL,
  `updated_at`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_admins_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ----------------------------------------
-- 表8: uploaded_files（上传文件记录）
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id`              VARCHAR(36)    NOT NULL COMMENT '文件UUID',
  `key`             VARCHAR(500)   NOT NULL COMMENT 'OSS key',
  `url`             VARCHAR(1000)  NOT NULL COMMENT '访问URL',
  `filename`        VARCHAR(255)   NOT NULL COMMENT '原始文件名',
  `content_type`    VARCHAR(100)   NOT NULL COMMENT 'MIME类型',
  `size`            BIGINT         NOT NULL COMMENT '文件大小(字节)',
  `reference_count` INT            DEFAULT 0,
  `uploaded_at`     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_key` (`key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上传文件记录表';

-- ============================================================
-- 第三部分：补充字段检查（ALTER TABLE，已有列则忽略错误）
-- 如果表已存在但缺少某些字段，逐一添加
-- ============================================================

-- users 表补充字段
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `total_bots_busted` INT NOT NULL DEFAULT 0 AFTER `max_streak`,
  ADD COLUMN IF NOT EXISTS `weekly_accuracy` FLOAT NOT NULL DEFAULT 0 AFTER `total_bots_busted`,
  ADD COLUMN IF NOT EXISTS `weekly_judged` INT NOT NULL DEFAULT 0 AFTER `weekly_accuracy`,
  ADD COLUMN IF NOT EXISTS `weekly_correct` INT NOT NULL DEFAULT 0 AFTER `weekly_judged`,
  ADD COLUMN IF NOT EXISTS `last_week_reset` TIMESTAMP NULL AFTER `weekly_correct`,
  ADD COLUMN IF NOT EXISTS `avatar_update_time` VARCHAR(50) NULL AFTER `avatar`;

-- content 表补充字段
ALTER TABLE `content`
  ADD COLUMN IF NOT EXISTS `correct_votes` INT NOT NULL DEFAULT 0 AFTER `human_votes`;

-- ============================================================
-- 第四部分：插入示例内容数据（如果 content 表为空）
-- ============================================================

INSERT IGNORE INTO `content`
  (`id`, `type`, `url`, `text`, `title`, `is_bot`, `model_tag`, `provider`, `deception_rate`, `explanation`, `total_votes`, `ai_votes`, `human_votes`, `correct_votes`)
VALUES
  (
    UUID(), 'text', NULL,
    '在这个数字化的时代，人工智能已经渗透到我们生活的方方面面。从智能推荐系统到自动驾驶汽车，AI技术正以前所未有的速度改变着人类社会的运作方式。许多人担忧这种变化将带来大规模的失业，但同时也有声音认为AI将创造出我们今天无法想象的新型工作岗位。',
    'AI时代的就业思考',
    1, 'GPT-4', 'OpenAI', 72.5,
    '这段文字具有典型的AI生成特征：语言过于流畅、结构化，缺乏个人情感和具体细节，用词较为正式和泛化。整体论述平衡但缺乏个人观点，是GPT类模型的典型写作风格。',
    156, 113, 43, 113
  ),
  (
    UUID(), 'text', NULL,
    '今天去买菜，碰到了一个超级烦人的大妈，非要跟我抢最后一颗大白菜！我俩就在那儿互相瞪眼，谁也不让谁。最后菜摊老板说要分一半给我们，结果那大妈拿了菜就走，连谢都没谢。现在回想起来还是好气，但也有点好笑，真是生活处处是惊喜啊。',
    '菜市场抢菜奇遇',
    0, NULL, NULL, 28.3,
    '这段文字具有明显的真实人类写作特征：情绪真实、细节具体（大白菜、分一半）、带有个人情感起伏（好气、好笑），语言不加雕饰，有明显的口语化表达。AI通常不会写出这种带有矛盾情绪的生活小事。',
    89, 25, 64, 64
  ),
  (
    UUID(), 'text', NULL,
    '量子纠缠现象表明，两个粒子在相互作用后，即使分隔极远的距离，测量其中一个的状态会瞬间影响另一个。这并非信息传输，而是量子态的关联性。爱因斯坦称之为"幽灵般的超距作用"，但实验已多次证实其存在。',
    '量子纠缠的本质',
    1, 'Claude-3', 'Anthropic', 85.2,
    '这段科普文章虽然内容准确，但过于简洁和教科书化。真人写科普通常会加入更多个人理解、类比或疑问，而这段文字显得过于"标准答案"式，是AI生成科普内容的典型特征。',
    203, 173, 30, 173
  ),
  (
    UUID(), 'text', NULL,
    '失眠第三天了。脑子里乱得很，想这个想那个，就是睡不着。昨晚数了好多只羊，数到三百多只的时候突然想起明天还有个会议没准备，然后就更睡不着了。现在凌晨三点，在刷手机，感觉整个城市都安静了，就我一个人还在这里发呆。',
    '凌晨三点的失眠日记',
    0, NULL, NULL, 31.8,
    '这段文字充满了真实的人类感受：失眠的焦虑、思维跳跃（数羊→想起会议）、深夜的孤独感。"数到三百多只"这种具体细节和情绪的真实流露，是人类写作的典型特征，AI很难自然地复现这种真实的心理状态。',
    127, 40, 87, 87
  ),
  (
    UUID(), 'text', NULL,
    '研究表明，定期进行有氧运动对心理健康具有显著的积极影响。每周至少150分钟的中等强度运动可以降低抑郁和焦虑的风险达30%。运动通过促进内啡肽分泌、改善睡眠质量和增强自我效能感等多种机制发挥作用，是一种经济有效的心理健康干预方式。',
    '运动与心理健康的科学依据',
    1, 'GPT-3.5', 'OpenAI', 68.9,
    '这段文字虽然信息准确，但具有典型的AI写作风格：数据引用精确（150分钟、30%）但缺乏来源，结构过于完整，列举机制（内啡肽、睡眠、自我效能感）过于全面。真人写这类文章通常会有更多个人倾向性表达或对某些点的侧重。',
    178, 123, 55, 123
  );

-- ============================================================
-- 第五部分：验证查询
-- ============================================================

-- 检查各表结构
DESCRIBE `users`;
DESCRIBE `content`;
DESCRIBE `judgments`;
DESCRIBE `comments`;

-- 检查数据量
SELECT 'users' AS tbl, COUNT(*) AS cnt FROM users
UNION ALL SELECT 'content', COUNT(*) FROM content
UNION ALL SELECT 'judgments', COUNT(*) FROM judgments
UNION ALL SELECT 'comments', COUNT(*) FROM comments
UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL SELECT 'admins', COUNT(*) FROM admins;

-- 检查 content 表数据（前端首页数据来源）
SELECT id, title, type, is_bot, deception_rate, total_votes, ai_votes, human_votes, correct_votes
FROM content
ORDER BY created_at DESC
LIMIT 10;

-- 检查索引
SHOW INDEX FROM `users`;
SHOW INDEX FROM `judgments`;
