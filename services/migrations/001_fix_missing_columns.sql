-- ============================================================
-- 001_fix_missing_columns.sql
-- 目标：为 content 表补充缺失字段
-- users 表字段已完整，无需操作
-- ============================================================

USE `who_is_bot`;

-- ============================================================
-- content 表：补充缺失字段
-- 当前已有：id, url, totalVotes, aiVotes, humanVotes, correctVotes, authorId
-- 需要补充以下字段：
-- ============================================================

ALTER TABLE `content`
  ADD COLUMN `type`         VARCHAR(20)   NOT NULL DEFAULT 'text'   COMMENT '内容类型: text/image/video',
  ADD COLUMN `text`         TEXT          NULL                       COMMENT '文字内容',
  ADD COLUMN `title`        VARCHAR(255)  NOT NULL DEFAULT ''        COMMENT '标题',
  ADD COLUMN `is_bot`       TINYINT(1)    NOT NULL DEFAULT 0         COMMENT '是否AI生成: 1=AI, 0=人类',
  ADD COLUMN `modelTag`     VARCHAR(100)  NULL                       COMMENT 'AI模型标签',
  ADD COLUMN `provider`     VARCHAR(100)  NULL                       COMMENT '来源',
  ADD COLUMN `deceptionRate` FLOAT        NOT NULL DEFAULT 0         COMMENT '欺骗率(0-100)',
  ADD COLUMN `explanation`  TEXT          NULL                       COMMENT '解释说明',
  ADD COLUMN `createdAt`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  ADD COLUMN `updatedAt`    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);

-- ============================================================
-- 删除冗余的 contents 表（与 content 重复，且字段不完整）
-- ============================================================

DROP TABLE IF EXISTS `contents`;

-- ============================================================
-- 插入样本数据（仅当 content 表为空时才插入）
-- ============================================================

INSERT INTO `content` (
  `id`, `type`, `url`, `text`, `title`,
  `is_bot`, `modelTag`, `provider`, `deceptionRate`, `explanation`,
  `totalVotes`, `aiVotes`, `humanVotes`, `correctVotes`,
  `createdAt`, `updatedAt`
)
SELECT * FROM (SELECT
  UUID()          AS id,
  'text'          AS type,
  NULL            AS url,
  '人工智能正在改变我们的生活方式，从医疗诊断到自动驾驶，每一个领域都在经历深刻变革。这些变化既带来了前所未有的机遇，也引发了关于就业和隐私的广泛讨论。' AS text,
  'AI正在改变世界'  AS title,
  1               AS is_bot,
  'GPT-4'         AS modelTag,
  'OpenAI'        AS provider,
  72.5            AS deceptionRate,
  '这篇文章由AI生成，用词流畅但缺乏个人情感，句式较为规整。' AS explanation,
  200             AS totalVotes,
  144             AS aiVotes,
  56              AS humanVotes,
  144             AS correctVotes,
  NOW()           AS createdAt,
  NOW()           AS updatedAt
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `content` LIMIT 1);

INSERT INTO `content` (
  `id`, `type`, `url`, `text`, `title`,
  `is_bot`, `modelTag`, `provider`, `deceptionRate`, `explanation`,
  `totalVotes`, `aiVotes`, `humanVotes`, `correctVotes`,
  `createdAt`, `updatedAt`
)
SELECT * FROM (SELECT
  UUID()          AS id,
  'text'          AS type,
  NULL            AS url,
  '昨天和朋友去爬山，没想到半路下起了雨，鞋子全湿透了。但反而因此遇到了一位老奶奶，她分享了自己年轻时的故事，整个下午都很特别。' AS text,
  '雨中偶遇'        AS title,
  0               AS is_bot,
  NULL            AS modelTag,
  'human'         AS provider,
  28.3            AS deceptionRate,
  '真实的人类叙述，有具体细节和情感波动，语言自然不做作。' AS explanation,
  150             AS totalVotes,
  45              AS aiVotes,
  105             AS humanVotes,
  105             AS correctVotes,
  NOW()           AS createdAt,
  NOW()           AS updatedAt
) AS tmp
WHERE (SELECT COUNT(*) FROM `content`) < 2;

-- ============================================================
-- 验证结果
-- ============================================================

SELECT
  id,
  title,
  type,
  is_bot,
  deceptionRate,
  totalVotes,
  createdAt
FROM `content`
ORDER BY `createdAt` DESC
LIMIT 5;
