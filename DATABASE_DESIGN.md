# Who-is-the-Bot 完整数据库设计文档

## 📋 数据库概览

- **数据库名称**: `who_is_the_bot`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **引擎**: InnoDB

---

## 📊 表结构设计

### 1. users 表（用户信息）

**表名**: `users`

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| id | VARCHAR(36) | PRIMARY KEY | UUID | 用户ID |
| nickname | VARCHAR(100) | NOT NULL | - | 用户昵称 |
| uid | VARCHAR(50) | UNIQUE, NOT NULL | - | 微信唯一标识 |
| level | INT | NOT NULL | 1 | 用户等级(1-4) |
| avatar | TEXT | NULL | NULL | 头像URL |
| accuracy | FLOAT | NOT NULL | 0 | 总体准确率(%) |
| totalJudged | INT | NOT NULL | 0 | 总判定次数 |
| correct_count | INT | NOT NULL | 0 | 总正确次数 |
| streak | INT | NOT NULL | 0 | 当前连胜数 |
| maxStreak | INT | NOT NULL | 0 | 历史最大连胜数 |
| totalBotsBusted | INT | NOT NULL | 0 | 识破AI总数 |
| weeklyAccuracy | FLOAT | NOT NULL | 0 | 本周准确率(%) |
| weeklyJudged | INT | NOT NULL | 0 | 本周判定次数 |
| weeklyCorrect | INT | NOT NULL | 0 | 本周正确次数 |
| lastWeekReset | TIMESTAMP | NULL | NULL | 上次周统计重置时间 |
| createdAt | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `uid`
- INDEX: `idx_users_total_judged` (totalJudged)
- INDEX: `idx_users_accuracy` (accuracy)
- INDEX: `idx_users_weekly_judged` (weeklyJudged)
- INDEX: `idx_users_level` (level)

---

### 2. content 表（内容）

**表名**: `content`

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| id | VARCHAR(36) | PRIMARY KEY | - | 内容ID |
| type | VARCHAR(20) | NOT NULL | - | 内容类型(text/image/video) |
| url | TEXT | NULL | NULL | 内容URL |
| text | TEXT | NULL | NULL | 文本内容 |
| title | VARCHAR(255) | NOT NULL | - | 标题 |
| is_bot | BOOLEAN | NOT NULL | - | 是否是AI生成 |
| modelTag | VARCHAR(100) | NOT NULL | - | 模型标签 |
| provider | VARCHAR(100) | NOT NULL | - | 提供者 |
| deceptionRate | FLOAT | NOT NULL | - | 欺骗率 |
| explanation | TEXT | NOT NULL | - | 解释说明 |
| total_votes | INT | NOT NULL | 0 | 总投票数 |
| ai_votes | INT | NOT NULL | 0 | 认为是AI的投票数 |
| human_votes | INT | NOT NULL | 0 | 认为是人类的投票数 |
| correct_votes | INT | NOT NULL | 0 | 正确投票数 |
| createdAt | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**:
- PRIMARY KEY: `id`
- INDEX: `idx_content_total_votes` (total_votes)
- INDEX: `idx_content_is_bot` (is_bot)
- INDEX: `idx_content_created_at` (createdAt)

---

### 3. judgments 表（判定记录）

**表名**: `judgments`

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| id | VARCHAR(36) | PRIMARY KEY | UUID | 判定记录ID |
| user_id | VARCHAR(36) | NULL, FK | NULL | 用户ID（游客为NULL） |
| content_id | VARCHAR(36) | NOT NULL, FK | - | 内容ID |
| user_choice | VARCHAR(10) | NOT NULL | - | 用户选择(ai/human) |
| is_correct | BOOLEAN | NOT NULL | - | 是否正确 |
| guest_id | VARCHAR(50) | NULL | NULL | 游客ID |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**外键**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
- FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE

**索引**:
- PRIMARY KEY: `id`
- INDEX: `idx_judgments_user_id` (user_id)
- INDEX: `idx_judgments_content_id` (content_id)
- INDEX: `idx_judgments_created_at` (created_at)
- INDEX: `idx_judgments_guest_id` (guest_id)

---

### 4. achievements 表（成就定义）

**表名**: `achievements`

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| id | VARCHAR(36) | PRIMARY KEY | - | 成就ID |
| name | VARCHAR(100) | NOT NULL | - | 成就名称 |
| description | TEXT | NOT NULL | - | 成就描述 |
| icon | VARCHAR(255) | NULL | NULL | 图标（emoji或图标名） |
| type | VARCHAR(50) | NOT NULL | - | 成就类型 |
| requirement_value | INT | NULL | NULL | 达成条件数值 |
| points | INT | NOT NULL | 0 | 成就积分 |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**成就类型**:
- `judgment_count`: 判定次数成就
- `accuracy`: 准确率成就
- `streak`: 连胜成就
- `special`: 特殊成就

**索引**:
- PRIMARY KEY: `id`

---

### 5. user_achievements 表（用户成就关联）

**表名**: `user_achievements`

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| id | VARCHAR(36) | PRIMARY KEY | UUID | 记录ID |
| user_id | VARCHAR(36) | NOT NULL, FK | - | 用户ID |
| achievement_id | VARCHAR(36) | NOT NULL, FK | - | 成就ID |
| unlocked_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 解锁时间 |

**外键**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE

**索引**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `unique_user_achievement` (user_id, achievement_id)
- INDEX: `idx_user_achievements_user_id` (user_id)
- INDEX: `idx_user_achievements_achievement_id` (achievement_id)

---

### 6. comments 表（评论）

**表名**: `comments`

| 字段名 | 数据类型 | 约束 | 默认值 | 说明 |
|--------|---------|------|--------|------|
| id | VARCHAR(36) | PRIMARY KEY | UUID | 评论ID |
| content_id | VARCHAR(36) | NOT NULL, FK | - | 内容ID |
| user_id | VARCHAR(36) | NULL, FK | NULL | 用户ID（游客为NULL） |
| guest_id | VARCHAR(50) | NULL | NULL | 游客ID |
| content | TEXT | NOT NULL | - | 评论内容 |
| likes | INT | NOT NULL | 0 | 点赞数 |
| parent_id | VARCHAR(36) | NULL, FK | NULL | 父评论ID（支持回复） |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**外键**:
- FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
- FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE

**索引**:
- PRIMARY KEY: `id`
- INDEX: `idx_comments_content_id` (content_id)
- INDEX: `idx_comments_user_id` (user_id)
- INDEX: `idx_comments_guest_id` (guest_id)
- INDEX: `idx_comments_parent_id` (parent_id)
- INDEX: `idx_comments_created_at` (created_at)

---

## 🔄 表关系图

```
users (1) ----< (N) judgments
content (1) ----< (N) judgments
users (1) ----< (N) user_achievements
achievements (1) ----< (N) user_achievements
content (1) ----< (N) comments
users (1) ----< (N) comments
comments (1) ----< (N) comments (自关联，支持回复)
```

---

## 📝 初始数据

### achievements 表初始数据（13个成就）

| ID | 名称 | 描述 | 图标 | 类型 | 条件值 | 积分 |
|----|------|------|------|------|--------|------|
| ach_first_judgment | 初出茅庐 | 完成第一次判定 | target | judgment_count | 1 | 10 |
| ach_10_judgments | 小试牛刀 | 完成10次判定 | search | judgment_count | 10 | 20 |
| ach_100_judgments | 身经百战 | 完成100次判定 | strong | judgment_count | 100 | 50 |
| ach_500_judgments | 经验丰富 | 完成500次判定 | trophy | judgment_count | 500 | 100 |
| ach_1000_judgments | 大师级侦探 | 完成1000次判定 | crown | judgment_count | 1000 | 200 |
| ach_accuracy_70 | 火眼金睛 | 准确率达到70% | eye | accuracy | 70 | 30 |
| ach_accuracy_80 | 明察秋毫 | 准确率达到80% | lens | accuracy | 80 | 50 |
| ach_accuracy_90 | 神机妙算 | 准确率达到90% | brain | accuracy | 90 | 100 |
| ach_accuracy_95 | 料事如神 | 准确率达到95% | star | accuracy | 95 | 150 |
| ach_streak_5 | 连胜新手 | 连续答对5题 | fire | streak | 5 | 20 |
| ach_streak_10 | 连胜达人 | 连续答对10题 | bolt | streak | 10 | 40 |
| ach_streak_20 | 连胜专家 | 连续答对20题 | sparkle | streak | 20 | 80 |
| ach_streak_50 | 连胜传奇 | 连续答对50题 | medal | streak | 50 | 200 |

---

## 🚀 完整建表 SQL

见附件：`database-schema-complete.sql`

---

## 📊 字段命名规则说明

### TypeORM 实体 vs 数据库字段

由于 TypeORM 使用 camelCase，而某些字段在数据库中使用 snake_case，需要注意映射关系：

| TypeORM 属性 | 数据库字段 |
|-------------|-----------|
| isAi | is_bot |
| totalVotes | total_votes |
| aiVotes | ai_votes |
| humanVotes | human_votes |
| correctVotes | correct_votes |
| correctCount | correct_count |
| userChoice | user_choice |
| isCorrect | is_correct |
| guestId | guest_id |
| contentId | content_id |
| userId | user_id |
| parentId | parent_id |
| createdAt | createdAt / created_at |
| updatedAt | updatedAt / updated_at |

**其他字段直接使用 camelCase**:
- totalJudged
- weeklyJudged
- weeklyCorrect
- weeklyAccuracy
- maxStreak
- totalBotsBusted
- lastWeekReset
- modelTag
- deceptionRate

---

## 🔐 数据库配置建议

### 字符集设置

```sql
-- 创建数据库时指定字符集
CREATE DATABASE who_is_the_bot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 修改现有数据库字符集
ALTER DATABASE who_is_the_bot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 连接配置

```env
DB_HOST=sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com
DB_PORT=25988
DB_USER=root
DB_PASS=your_password
DB_NAME=who_is_the_bot
```

---

## 📈 性能优化建议

### 1. 索引策略

- **users 表**: 按 totalJudged、accuracy、weeklyJudged、level 查询频繁
- **content 表**: 按 total_votes、is_bot、createdAt 查询频繁
- **judgments 表**: 按 user_id、content_id、created_at 查询频繁
- **comments 表**: 按 content_id、user_id、created_at 查询频繁

### 2. 分区建议（可选）

对于 judgments 表，如果数据量很大，可以考虑按时间分区：

```sql
-- 按月分区
ALTER TABLE judgments PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
  PARTITION p202601 VALUES LESS THAN (202602),
  PARTITION p202602 VALUES LESS THAN (202603),
  ...
);
```

### 3. 定期维护

```sql
-- 优化表
OPTIMIZE TABLE users, content, judgments, achievements, user_achievements, comments;

-- 分析表
ANALYZE TABLE users, content, judgments, achievements, user_achievements, comments;
```

---

## 🔄 数据迁移策略

### 方案1：完全重建（推荐）

1. 备份现有数据
2. 删除所有表
3. 执行完整建表 SQL
4. 恢复必要数据

### 方案2：增量迁移

1. 创建新表
2. 迁移数据
3. 删除旧表
4. 重命名新表

---

## 📝 注意事项

1. **字符集**: 必须使用 utf8mb4 以支持 emoji
2. **外键**: 确保外键约束正确设置
3. **索引**: 不要过度索引，影响写入性能
4. **备份**: 重建前务必备份数据
5. **TypeORM 同步**: 设置 `synchronize: false` 避免自动修改表结构
