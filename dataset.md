# Who-is-Bot 数据库设计文档

## 数据库信息

- **数据库名称**: `who_is_bot`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **引擎**: InnoDB

## 表概览

| 表名 | 说明 | 主要用途 |
|------|------|----------|
| users | 用户表 | 存储用户信息和统计数据 |
| content | 内容表 | 存储判定内容（视频、图片、文本） |
| judgments | 判定记录表 | 存储用户的判定记录 |
| comments | 评论表 | 存储用户评论 |
| achievements | 成就表 | 存储成就定义 |
| user_achievements | 用户成就表 | 存储用户解锁的成就 |

---

## 1. users 表（用户表）

### 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | VARCHAR(36) | - | 用户ID（UUID），主键 |
| nickname | VARCHAR(100) | - | 用户昵称 |
| uid | VARCHAR(50) | - | 微信唯一标识，唯一索引 |
| level | INT | 1 | 用户等级（1-5） |
| avatar | TEXT | NULL | 用户头像URL |
| accuracy | FLOAT | 0 | 总体准确率（百分比） |
| totalJudged | INT | 0 | 总判定次数 |
| correct_count | INT | 0 | 正确判定次数 |
| streak | INT | 0 | 当前连胜次数 |
| maxStreak | INT | 0 | 最高连胜次数 |
| totalBotsBusted | INT | 0 | 识破AI总数 |
| weeklyAccuracy | FLOAT | 0 | 周准确率（百分比） |
| weeklyJudged | INT | 0 | 周判定次数 |
| weeklyCorrect | INT | 0 | 周正确次数 |
| lastWeekReset | TIMESTAMP | NULL | 上次周统计重置时间 |
| createdAt | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间（自动更新） |

### 索引

- **主键**: `id`
- **唯一索引**: `uk_uid` (uid)
- **普通索引**:
  - `idx_total_judged` (totalJudged)
  - `idx_accuracy` (accuracy)
  - `idx_weekly_judged` (weeklyJudged)
  - `idx_level` (level)

### 等级系统

| 等级 | 名称 | 判定次数要求 |
|------|------|--------------|
| 1 | AI小白 | 0-9 |
| 2 | 胜似人机 | 10-49 |
| 3 | 人机杀手 | 50-99 |
| 4 | 硅谷天才 | 100-499 |
| 5 | 传奇侦探 | 500+ |

### TypeORM 实体映射

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  uid: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'float', default: 0 })
  accuracy: number;

  @Column({ type: 'int', default: 0 })
  totalJudged: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ type: 'int', default: 0 })
  maxStreak: number;

  @Column({ type: 'int', default: 0 })
  totalBotsBusted: number;

  @Column({ type: 'float', default: 0 })
  weeklyAccuracy: number;

  @Column({ type: 'int', default: 0 })
  weeklyJudged: number;

  @Column({ type: 'int', default: 0 })
  weeklyCorrect: number;

  @Column({ type: 'timestamp', nullable: true })
  lastWeekReset: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**注意**: 只有 `correct_count` 需要字段映射，其他字段名与数据库一致。

---

## 2. content 表（内容表）

### 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | VARCHAR(36) | - | 内容ID（UUID），主键 |
| type | VARCHAR(20) | - | 内容类型（video/image/text） |
| url | TEXT | NULL | 视频/图片URL |
| text | TEXT | NULL | 文本内容 |
| title | VARCHAR(255) | - | 内容标题 |
| is_bot | TINYINT(1) | - | 是否为AI生成（0=人类，1=AI） |
| modelTag | VARCHAR(100) | - | AI模型标签 |
| provider | VARCHAR(100) | - | 提供商 |
| deceptionRate | FLOAT | - | 欺骗率 |
| explanation | TEXT | - | 解释说明 |
| total_votes | INT | 0 | 总投票数 |
| ai_votes | INT | 0 | 判定为AI的票数 |
| human_votes | INT | 0 | 判定为人类的票数 |
| correct_votes | INT | 0 | 正确判定的票数 |
| createdAt | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间 |

### 索引

- **主键**: `id`
- **普通索引**:
  - `idx_total_votes` (total_votes)
  - `idx_is_bot` (is_bot)
  - `idx_created_at` (createdAt)

### 内容类型

- **video**: 视频内容
- **image**: 图片内容
- **text**: 文本内容

---

## 3. judgments 表（判定记录表）

### 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | VARCHAR(36) | - | 判定ID（UUID），主键 |
| user_id | VARCHAR(36) | NULL | 用户ID（登录用户） |
| content_id | VARCHAR(36) | - | 内容ID |
| user_choice | VARCHAR(10) | - | 用户选择（ai/human） |
| is_correct | TINYINT(1) | - | 是否正确（0=错误，1=正确） |
| guest_id | VARCHAR(50) | NULL | 游客ID（未登录用户） |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 |

### 索引

- **主键**: `id`
- **普通索引**:
  - `idx_user_id` (user_id)
  - `idx_content_id` (content_id)
  - `idx_created_at` (created_at)
  - `idx_guest_id` (guest_id)

### TypeORM 实体映射

```typescript
@Entity('judgments')
export class Judgment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'content_id', type: 'varchar', length: 36 })
  contentId: string;

  @Column({ name: 'user_choice', type: 'varchar', length: 10 })
  userChoice: string; // 'ai' or 'human'

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @Column({ name: 'guest_id', type: 'varchar', length: 50, nullable: true })
  guestId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### 业务逻辑

- 每个用户/游客对每个内容只能判定一次
- 判定后实时更新：
  - 内容统计（total_votes, ai_votes, human_votes, correct_votes）
  - 用户统计（totalJudged, accuracy, streak, maxStreak 等）

---

## 4. comments 表（评论表）

### 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | VARCHAR(36) | - | 评论ID（UUID），主键 |
| content_id | VARCHAR(36) | - | 内容ID |
| user_id | VARCHAR(36) | NULL | 用户ID（登录用户） |
| guest_id | VARCHAR(50) | NULL | 游客ID（未登录用户） |
| content | TEXT | - | 评论内容 |
| likes | INT | 0 | 点赞数 |
| parent_id | VARCHAR(36) | NULL | 父评论ID（用于回复） |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | 更新时间 |

### 索引

- **主键**: `id`
- **普通索引**:
  - `idx_content_id` (content_id)
  - `idx_user_id` (user_id)
  - `idx_guest_id` (guest_id)
  - `idx_parent_id` (parent_id)
  - `idx_created_at` (created_at)

---

## 5. achievements 表（成就表）

### 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | VARCHAR(36) | - | 成就ID，主键 |
| name | VARCHAR(100) | - | 成就名称 |
| description | TEXT | - | 成就描述 |
| icon | VARCHAR(255) | NULL | 图标 |
| type | VARCHAR(50) | - | 成就类型 |
| requirement_value | INT | NULL | 要求值 |
| points | INT | 0 | 积分 |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | 创建时间 |

### 成就类型

- **judgment_count**: 判定次数成就
- **accuracy**: 准确率成就
- **streak**: 连胜成就

### 初始成就数据

| ID | 名称 | 描述 | 类型 | 要求值 | 积分 |
|----|------|------|------|--------|------|
| ach_first_judgment | 初出茅庐 | 完成第一次判定 | judgment_count | 1 | 10 |
| ach_10_judgments | 小试牛刀 | 完成10次判定 | judgment_count | 10 | 20 |
| ach_100_judgments | 身经百战 | 完成100次判定 | judgment_count | 100 | 50 |
| ach_500_judgments | 经验丰富 | 完成500次判定 | judgment_count | 500 | 100 |
| ach_1000_judgments | 大师级侦探 | 完成1000次判定 | judgment_count | 1000 | 200 |
| ach_accuracy_70 | 火眼金睛 | 准确率达到70% | accuracy | 70 | 30 |
| ach_accuracy_80 | 明察秋毫 | 准确率达到80% | accuracy | 80 | 50 |
| ach_accuracy_90 | 神机妙算 | 准确率达到90% | accuracy | 90 | 100 |
| ach_accuracy_95 | 料事如神 | 准确率达到95% | accuracy | 95 | 150 |
| ach_streak_5 | 连胜新手 | 连续答对5题 | streak | 5 | 20 |
| ach_streak_10 | 连胜达人 | 连续答对10题 | streak | 10 | 40 |
| ach_streak_20 | 连胜专家 | 连续答对20题 | streak | 20 | 80 |
| ach_streak_50 | 连胜传奇 | 连续答对50题 | streak | 50 | 200 |

---

## 6. user_achievements 表（用户成就表）

### 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | VARCHAR(36) | - | 记录ID（UUID），主键 |
| user_id | VARCHAR(36) | - | 用户ID |
| achievement_id | VARCHAR(36) | - | 成就ID |
| unlocked_at | TIMESTAMP | CURRENT_TIMESTAMP | 解锁时间 |

### 索引

- **主键**: `id`
- **唯一索引**: `uk_user_achievement` (user_id, achievement_id)
- **普通索引**:
  - `idx_user_id` (user_id)
  - `idx_achievement_id` (achievement_id)

---

## 表关系说明

### 逻辑关系（无外键约束）

```
users (1) ----< (N) judgments
users (1) ----< (N) comments
users (1) ----< (N) user_achievements

content (1) ----< (N) judgments
content (1) ----< (N) comments

achievements (1) ----< (N) user_achievements

comments (1) ----< (N) comments (parent_id 自关联)
```

**注意**: 数据库中**不使用外键约束**，因为腾讯云 DMC 不支持外键。所有关系在应用层维护。

---

## 重要说明

### 字段命名规则

数据库中使用**混合命名**：
- 大部分字段使用**驼峰命名**（camelCase）：`totalJudged`, `maxStreak`, `createdAt`
- 少数字段使用**下划线命名**（snake_case）：`correct_count`, `user_id`, `content_id`, `is_correct`, `created_at`

### TypeORM 映射规则

- 驼峰命名字段：**不需要** `@Column({ name: 'xxx' })` 映射
- 下划线命名字段：**需要** `@Column({ name: 'xxx' })` 映射

### 统计数据更新

用户统计数据在每次判定后**实时更新**：
1. 用户提交判定 → `judgments` 表插入记录
2. 更新 `content` 表的投票统计
3. 更新 `users` 表的用户统计（totalJudged, accuracy, streak 等）

### 排行榜规则

- **上榜条件**: `totalJudged >= 5`（至少完成5次判定）
- **排序规则**:
  1. 按 `accuracy` 降序
  2. 准确率相同时按 `totalJudged` 降序

---

## 常用 SQL 查询

### 查看用户统计
```sql
SELECT id, nickname, totalJudged, accuracy, maxStreak
FROM users
WHERE totalJudged > 0
ORDER BY accuracy DESC, totalJudged DESC;
```

### 查看排行榜
```sql
SELECT nickname, accuracy, totalJudged, maxStreak
FROM users
WHERE totalJudged >= 5
ORDER BY accuracy DESC, totalJudged DESC
LIMIT 50;
```

### 查看用户判定历史
```sql
SELECT j.*, c.title, c.type
FROM judgments j
LEFT JOIN content c ON j.content_id = c.id
WHERE j.user_id = 'your-user-id'
ORDER BY j.created_at DESC
LIMIT 20;
```

### 查看内容统计
```sql
SELECT
    id,
    title,
    type,
    total_votes,
    ROUND(ai_votes * 100.0 / total_votes, 1) as ai_percentage,
    ROUND(correct_votes * 100.0 / total_votes, 1) as correct_percentage
FROM content
WHERE total_votes > 0
ORDER BY total_votes DESC;
```

---

## 数据库创建脚本

完整的数据库创建脚本位于：`services/main.sql`

快速创建数据库：
```bash
# 在 DMC 中执行
source /path/to/services/main.sql
```

或者直接复制 `main.sql` 的内容到 DMC 中执行。

---

**文档版本**: 1.0
**最后更新**: 2026-01-30
**维护者**: Claude Code
