# 数据库字段汇总（who_is_bot）

> 重要：后端所有涉及数据库操作时，必须参照本文件的列名。

## 命名规范说明

- **驼峰命名（camelCase）** 的表：`users`、`content`、`comments`、`admins`、`leaderboard`
- **下划线命名（snake_case）** 的表：`judgments`、`user_achievements`、`achievements`、`uploaded_files`
- 特例：`content` 表中 `is_bot` 字段为下划线（其余字段为驼峰）
- 特例：`comments` 表中 DB 列名 `text` 对应 TS 属性名 `content`（字段名不一致，需注意）

---

## 各表字段详情

### users 表

> 命名规范：**驼峰（camelCase）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| nickname | nickname | varchar(100) | 否 | — | 用户昵称 |
| uid | uid | varchar(50) | 否 | — | 唯一标识，UNIQUE |
| level | level | int | 否 | 1 | 用户等级 |
| avatar | avatar | text | 是 | NULL | 头像 URL |
| avatarUpdateTime | avatarUpdateTime | varchar(50) | 是 | NULL | 头像更新时间 |
| gender | gender | int | 是 | NULL | 性别（0/1/2） |
| city | city | varchar(50) | 是 | NULL | 城市 |
| accuracy | accuracy | float | 否 | 0 | 总准确率 |
| totalJudged | totalJudged | int | 否 | 0 | 总判断次数 |
| streak | streak | int | 否 | 0 | 当前连胜数 |
| maxStreak | maxStreak | int | 否 | 0 | 历史最高连胜 |
| totalBotsBusted | totalBotsBusted | int | 否 | 0 | 总识破机器人次数 |
| weeklyAccuracy | weeklyAccuracy | float | 否 | 0 | 本周准确率 |
| weeklyJudged | weeklyJudged | int | 否 | 0 | 本周判断次数 |
| weeklyCorrect | weeklyCorrect | int | 否 | 0 | 本周答对次数 |
| lastWeekReset | lastWeekReset | timestamp | 是 | NULL | 上周数据重置时间 |
| createdAt | createdAt | timestamp | 否 | 自动 | 创建时间 |
| updatedAt | updatedAt | timestamp | 否 | 自动 | 更新时间 |

---

### content 表

> 命名规范：**驼峰（camelCase）**，但 `is_bot` 字段为下划线（特例）

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| type | type | varchar(20) | 否 | — | 内容类型（text/image 等） |
| url | url | text | 是 | NULL | 媒体 URL |
| text | text | text | 是 | NULL | 文本内容 |
| title | title | varchar(255) | 否 | — | 标题 |
| is_bot | isAi | boolean | 否 | — | 是否为 AI 生成（特例：DB 列名为下划线） |
| modelTag | modelTag | varchar(100) | 是 | NULL | AI 模型标签 |
| provider | provider | varchar(100) | 是 | NULL | 提供方 |
| deceptionRate | deceptionRate | float | 否 | — | 迷惑率 |
| explanation | explanation | text | 否 | — | 解释说明 |
| totalVotes | totalVotes | int | 否 | 0 | 总投票数 |
| aiVotes | aiVotes | int | 否 | 0 | 投"AI"票数 |
| humanVotes | humanVotes | int | 否 | 0 | 投"人类"票数 |
| correctVotes | correctVotes | int | 否 | 0 | 答对票数 |
| authorId | authorId | varchar(36) | 是 | NULL | 外键 → users.id |
| createdAt | createdAt | timestamp | 否 | 自动 | 创建时间 |
| updatedAt | updatedAt | timestamp | 否 | 自动 | 更新时间 |

---

### comments 表

> 命名规范：**驼峰（camelCase）**
> 注意：DB 列名 `text` 对应 TS 属性名 `content`（两者不同，写 QueryBuilder 时用 `text`）

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| contentId | contentId | varchar(36) | 否 | — | 外键 → content.id |
| userId | userId | varchar(36) | 是 | NULL | 外键 → users.id，游客可为空 |
| text | content | text | 否 | — | 评论文字（DB 列名为 text，TS 属性为 content） |
| likes | likes | int | 否 | 0 | 点赞数 |
| createdAt | createdAt | timestamp | 否 | 自动 | 创建时间 |

---

### judgments 表

> 命名规范：**下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| user_id | userId | varchar(36) | 是 | NULL | 外键 → users.id，游客可为空 |
| content_id | contentId | varchar(36) | 否 | — | 外键 → content.id |
| user_choice | userChoice | varchar(10) | 否 | — | 用户选择：'ai' 或 'human' |
| is_correct | isCorrect | boolean | 否 | — | 是否回答正确 |
| guest_id | guestId | varchar(50) | 是 | NULL | 游客 ID（未登录时使用） |
| created_at | createdAt | timestamp | 否 | 自动 | 创建时间 |

---

### achievements 表

> 命名规范：**下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | varchar(36) | 否 | — | 主键（手动指定） |
| name | name | varchar(100) | 否 | — | 成就名称 |
| description | description | text | 否 | — | 成就描述 |
| icon | icon | varchar(255) | 是 | NULL | 图标 URL |
| type | type | varchar(50) | 否 | — | 成就类型：judgment_count / accuracy / streak / special |
| requirement_value | requirementValue | int | 是 | NULL | 解锁条件数值 |
| points | points | int | 否 | 0 | 成就积分 |
| created_at | createdAt | timestamp | 否 | 自动 | 创建时间 |

---

### user_achievements 表

> 命名规范：**下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| user_id | user（关联） | varchar(36) | 否 | — | 外键 → users.id，CASCADE 删除 |
| achievement_id | achievement（关联） | varchar(36) | 否 | — | 外键 → achievements.id，CASCADE 删除 |
| unlocked_at | unlockedAt | timestamp | 否 | 自动 | 成就解锁时间 |

---

### admins 表

> 命名规范：**驼峰（camelCase）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| username | username | varchar(50) | 否 | — | 管理员用户名，UNIQUE |
| password | password | varchar(255) | 否 | — | bcrypt 哈希密码 |
| role | role | enum('super','normal') | 否 | 'normal' | 角色权限 |
| createdAt | createdAt | timestamp | 否 | 自动 | 创建时间 |
| lastLoginAt | lastLoginAt | timestamp | 是 | NULL | 最后登录时间 |
| updatedAt | updatedAt | timestamp | 否 | 自动 | 更新时间 |

---

### leaderboard 表

> 命名规范：**驼峰（camelCase）**
> 注意：该表无对应 TypeORM 实体文件，由原生 SQL 或 QueryBuilder 直接操作

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | — | 否 | 自动生成 | 主键 |
| modelName | modelName | varchar | 否 | — | AI 模型名称 |
| company | company | varchar | 否 | — | 公司/组织 |
| type | type | varchar | 否 | — | 模型类型 |
| deceptionRate | deceptionRate | float | 否 | — | 迷惑率 |
| totalTests | totalTests | int | 否 | — | 总测试次数 |
| createdAt | createdAt | timestamp | 否 | 自动 | 创建时间 |
| updatedAt | updatedAt | timestamp | 否 | 自动 | 更新时间 |

---

### uploaded_files 表

> 命名规范：**下划线（snake_case）**

| DB 列名 | TS 属性名 | 类型 | 可空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | id | uuid | 否 | 自动生成 | 主键 |
| key | key | varchar(500) | 否 | — | 对象存储 Key |
| url | url | varchar(1000) | 否 | — | 文件访问 URL |
| filename | filename | varchar(255) | 否 | — | 原始文件名 |
| content_type | contentType | varchar(100) | 否 | — | MIME 类型 |
| size | size | bigint | 否 | — | 文件大小（字节） |
| reference_count | referenceCount | int | 否 | 0 | 引用计数 |
| uploaded_at | uploadedAt | timestamp | 否 | 自动 | 上传时间 |

---

## 两个内容表说明

### 保留：content 表（当前使用）

`content` 表为当前项目**唯一有效的内容表**，包含完整的投票字段（`totalVotes`、`aiVotes`、`humanVotes`、`correctVotes`），与 `judgments` 表联动统计用户的判断结果。对应 TypeORM 实体为 `Content`（`content.entity.ts`）。

### 废弃：contents 表（已删除）

`contents` 表为早期遗留表，字段不完整（缺少投票统计字段，使用 `isAi` 而非 `is_bot` 列名），已从数据库和代码中**彻底删除**，不再使用。所有内容相关操作一律使用 `content` 表。
