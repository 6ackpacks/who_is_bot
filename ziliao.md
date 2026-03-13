# 数据库字段参考文档（who_is_bot）

**数据库**：腾讯云 CynosDB MySQL
**库名**：`who_is_bot`

> 重要：后端所有涉及数据库操作时，必须参照本文件的列名。TypeORM `@Column({ name })` 必须与 DB 实际列名完全一致。

---

## 命名规范总览

| 表名 | 命名规范 | 备注 |
|------|---------|------|
| `users` | 驼峰（camelCase） | 全驼峰 |
| `content` | **混合** | `is_bot` 唯一下划线列，其余全驼峰 |
| `comments` | 驼峰（camelCase） | 全驼峰，无 `guestId` / `parentId` / `updatedAt` |
| `judgments` | 下划线（snake_case） | 全下划线 |
| `user_achievements` | 下划线（snake_case） | 全下划线 |
| `achievements` | 下划线（snake_case） | 全下划线 |
| `admins` | 驼峰（camelCase） | 全驼峰 |
| `leaderboard` | 驼峰（camelCase） | AI 模型统计表，非用户排行榜 |
| `uploaded_files` | 下划线（snake_case） | 全下划线 |

> `contents` 表为冗余遗留表，已废弃。执行 `DROP TABLE IF EXISTS contents;` 删除，后端统一使用 `content` 表（`@Entity('content')`）。

---

## 各表字段详情

### 1. `users` — 用户主表

**命名规范：全驼峰（camelCase）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `nickname` | `nickname` | varchar(100) | 否 | — | 用户昵称 |
| `uid` | `uid` | varchar(50) | 否 | — | 微信 openid 或唯一标识，UNIQUE |
| `level` | `level` | int | 否 | 1 | 用户等级 |
| `avatar` | `avatar` | text | 是 | NULL | 头像 URL |
| `gender` | `gender` | int | 是 | NULL | 性别（0=未知, 1=男, 2=女） |
| `city` | `city` | varchar(50) | 是 | NULL | 城市 |
| `accuracy` | `accuracy` | float | 否 | 0 | 总体准确率 |
| `totalJudged` | `totalJudged` | int | 否 | 0 | 总判断次数 |
| `streak` | `streak` | int | 否 | 0 | 当前连胜数 |
| `maxStreak` | `maxStreak` | int | 否 | 0 | 历史最高连胜 |
| `totalBotsBusted` | `totalBotsBusted` | int | 否 | 0 | 总计识破机器人次数 |
| `weeklyAccuracy` | `weeklyAccuracy` | float | 否 | 0 | 本周准确率 |
| `weeklyJudged` | `weeklyJudged` | int | 否 | 0 | 本周判断次数 |
| `weeklyCorrect` | `weeklyCorrect` | int | 否 | 0 | 本周答对次数 |
| `lastWeekReset` | `lastWeekReset` | timestamp | 是 | NULL | 上次周数据重置时间 |
| `avatarUpdateTime` | `avatarUpdateTime` | varchar(50) | 是 | NULL | 头像最后更新时间 |
| `createdAt` | `createdAt` | timestamp | 否 | 自动 | 注册时间 |
| `updatedAt` | `updatedAt` | timestamp | 否 | 自动 | 最后更新时间 |

---

### 2. `content` — 内容表（主要内容存储）

**命名规范：混合——`is_bot` 为唯一下划线列，其余全驼峰（camelCase）**

> **特别注意**：`is_bot` 使用下划线，是该表唯一的例外字段。TypeORM 实体中必须显式声明 `@Column({ name: 'is_bot' })`。

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `title` | `title` | varchar(255) | 否 | — | 内容标题 |
| `is_bot` | `isBot` / `isAi` | boolean / tinyint | 否 | — | **下划线特例**，是否为 AI 生成（1=是，0=否） |
| `type` | `type` | varchar(20) | 否 | — | 内容类型（text / image / video 等） |
| `text` | `text` | text | 是 | NULL | 文字内容 |
| `url` | `url` | text | 是 | NULL | 媒体资源 URL（图片/视频） |
| `modelTag` | `modelTag` | varchar(100) | 是 | NULL | AI 模型标签（如 GPT-4、Claude） |
| `provider` | `provider` | varchar(100) | 是 | NULL | AI 服务提供商 |
| `deceptionRate` | `deceptionRate` | float | 否 | — | 欺骗率（被误判为人类的比率） |
| `explanation` | `explanation` | text | 否 | — | 解释说明 |
| `totalVotes` | `totalVotes` | int | 否 | 0 | 总投票数 |
| `aiVotes` | `aiVotes` | int | 否 | 0 | 投票认为是 AI 的次数 |
| `humanVotes` | `humanVotes` | int | 否 | 0 | 投票认为是人类的次数 |
| `correctVotes` | `correctVotes` | int | 否 | 0 | 投票正确次数 |
| `statsSource` | `statsSource` | varchar(10) | 否 | `'real'` | 数据来源：`manual`（预设）或 `real`（真实投票） |
| `manualAiPercent` | `manualAiPercent` | float | 是 | NULL | 管理员手动设置的 AI 判定百分比（0-100） |
| `manualHumanPercent` | `manualHumanPercent` | float | 是 | NULL | 管理员手动设置的真人判定百分比（0-100） |
| `authorId` | `authorId` | varchar(36) | 是 | NULL | 作者 ID，外键 → `users.id` |
| `createdAt` | `createdAt` | timestamp | 否 | 自动 | 创建时间 |
| `updatedAt` | `updatedAt` | timestamp | 否 | 自动 | 更新时间 |

---

### 3. `comments` — 评论表

**命名规范：全驼峰（camelCase）**

> 注意：无 `guestId`、`parentId`、`updatedAt` 字段。

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `text` | `text` / `content` | text | 否 | — | 评论文字内容（DB 列名为 `text`） |
| `likes` | `likes` | int | 否 | 0 | 点赞数 |
| `createdAt` | `createdAt` | timestamp | 否 | 自动 | 评论创建时间 |
| `userId` | `userId` | varchar(36) | 是 | NULL | 评论者 ID，外键 → `users.id` |
| `contentId` | `contentId` | varchar(36) | 否 | — | 所属内容 ID，外键 → `content.id` |

---

### 4. `judgments` — 判断记录表

**命名规范：全下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `user_choice` | `userChoice` | varchar(10) | 否 | — | 用户选择：`'ai'` 或 `'human'` |
| `is_correct` | `isCorrect` | boolean / tinyint | 否 | — | 是否判断正确（1=正确，0=错误） |
| `guest_id` | `guestId` | varchar(50) | 是 | NULL | 游客 ID（未登录用户标识） |
| `created_at` | `createdAt` | timestamp | 否 | 自动 | 判断时间 |
| `user_id` | `userId` | varchar(36) | 是 | NULL | 用户 ID，外键 → `users.id`（游客为 NULL） |
| `content_id` | `contentId` | varchar(36) | 否 | — | 内容 ID，外键 → `content.id` |

---

### 5. `user_achievements` — 用户成就关联表

**命名规范：全下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `unlocked_at` | `unlockedAt` | timestamp | 否 | 自动 | 成就解锁时间 |
| `user_id` | `userId` | varchar(36) | 否 | — | 用户 ID，外键 → `users.id` |
| `achievement_id` | `achievementId` | varchar(36) | 否 | — | 成就 ID，外键 → `achievements.id` |

---

### 6. `achievements` — 成就定义表

**命名规范：全下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | varchar(36) | 否 | 手动指定 | 主键 |
| `name` | `name` | varchar(100) | 否 | — | 成就名称 |
| `description` | `description` | text | 否 | — | 成就描述 |
| `icon` | `icon` | varchar(255) | 是 | NULL | 成就图标（URL 或图标名） |
| `type` | `type` | varchar(50) | 否 | — | 成就类型（judgment_count / accuracy / streak / special） |
| `requirement_value` | `requirementValue` | int | 是 | NULL | 达成所需数值（如连胜 10 次） |
| `points` | `points` | int | 否 | 0 | 成就积分 |
| `created_at` | `createdAt` | timestamp | 否 | 自动 | 成就创建时间 |

---

### 7. `admins` — 管理员表

**命名规范：全驼峰（camelCase）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `username` | `username` | varchar(50) | 否 | — | 管理员用户名，UNIQUE |
| `password` | `password` | varchar(255) | 否 | — | bcrypt 哈希密码 |
| `role` | `role` | enum / varchar | 否 | `'normal'` | 角色（super / normal） |
| `createdAt` | `createdAt` | timestamp | 否 | 自动 | 账号创建时间 |
| `lastLoginAt` | `lastLoginAt` | timestamp | 是 | NULL | 最后登录时间 |
| `updatedAt` | `updatedAt` | timestamp | 否 | 自动 | 账号更新时间 |

---

### 8. `leaderboard` — AI 模型统计表

**命名规范：全驼峰（camelCase）**

> **重要说明**：此表存储的是 **AI 模型** 的欺骗率统计，不是用户排行榜。用户排行需从 `users` 表查询 `weeklyAccuracy`、`totalJudged`、`streak` 等字段。

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | int / uuid | 否 | 自动生成 | 主键 |
| `modelName` | `modelName` | varchar | 否 | — | AI 模型名称（如 GPT-4、Claude 3） |
| `company` | `company` | varchar | 否 | — | 所属公司（如 OpenAI、Anthropic） |
| `type` | `type` | varchar | 否 | — | 模型类型（text / image 等） |
| `deceptionRate` | `deceptionRate` | float | 否 | — | 欺骗率（被误判为人类的比率） |
| `totalTests` | `totalTests` | int | 否 | — | 总测试次数 |
| `createdAt` | `createdAt` | timestamp | 否 | 自动 | 记录创建时间 |
| `updatedAt` | `updatedAt` | timestamp | 否 | 自动 | 记录更新时间 |

---

### 9. `uploaded_files` — 已上传文件表

**命名规范：全下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---------|-----------|------|------|--------|------|
| `id` | `id` | uuid / varchar | 否 | 自动生成 | 主键 |
| `key` | `key` | varchar(500) | 否 | — | 文件存储 key（COS 对象存储路径） |
| `url` | `url` | varchar(1000) | 否 | — | 文件访问 URL |
| `filename` | `filename` | varchar(255) | 否 | — | 原始文件名 |
| `content_type` | `contentType` | varchar(100) | 否 | — | MIME 类型（如 image/jpeg） |
| `size` | `size` | bigint | 否 | — | 文件大小（字节） |
| `reference_count` | `referenceCount` | int | 否 | 0 | 引用计数（用于文件复用） |
| `uploaded_at` | `uploadedAt` | timestamp | 否 | 自动 | 上传时间 |

---

## 两个内容表说明

### 保留：`content` 表（当前唯一有效内容表）

- 包含完整的投票统计字段：`totalVotes`、`aiVotes`、`humanVotes`、`correctVotes`
- 与 `judgments` 表联动统计用户判断结果
- 对应 TypeORM 实体：`Content`（`@Entity('content')`）

### 废弃：`contents` 表（冗余，已删除）

- 早期遗留表，字段不完整（缺少投票字段，使用 `isAi` 而非 `is_bot`）
- 执行 `DROP TABLE IF EXISTS contents;` 彻底删除
- 所有内容相关操作一律使用 `content` 表

---

## 注意事项

### TypeORM 实体与字段映射规则

1. **`@Column({ name: '实际DB列名' })` 必须与 DB 实际列名完全一致**，不能依赖 TypeORM 的自动命名转换，因为项目中存在驼峰与下划线混用的情况。

2. **全驼峰表**（`users`、`comments`、`admins`、`leaderboard`）：实体属性名与列名一致，可省略 `name`，但建议显式声明以防歧义。

3. **全下划线表**（`judgments`、`user_achievements`、`achievements`、`uploaded_files`）：实体属性通常用驼峰，但 `@Column` 必须通过 `name` 指定实际列名，例如：

   ```typescript
   @Column({ name: 'user_id' })
   userId: number;

   @Column({ name: 'is_correct' })
   isCorrect: boolean;

   @Column({ name: 'created_at' })
   createdAt: Date;
   ```

4. **`content` 表特例**：`is_bot` 是唯一的下划线列，实体中必须：

   ```typescript
   @Column({ name: 'is_bot' })
   isBot: boolean;
   ```

   其他驼峰字段（`modelTag`、`totalVotes`、`aiVotes` 等）无需指定 `name`。

5. **QueryBuilder 中的列名引用规则**：
   - `.where('entity.propertyName = :val')` → 使用**实体属性名**（TypeORM 自动映射到 DB 列名）
   - 原生 SQL 或 `.where('table_name.column_name = :val')` → 必须使用**实际 DB 列名**

6. **`synchronize: false`**：项目已禁用 TypeORM 自动同步，任何表结构变更须手动编写迁移 SQL 执行，不可依赖 TypeORM 自动建表或修改列。

7. **`contents` 表已废弃**：勿向 `contents` 表写入数据，所有内容相关代码统一使用 `content` 表（`@Entity('content')`）。
