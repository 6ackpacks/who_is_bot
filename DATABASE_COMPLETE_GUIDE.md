# Who-is-the-Bot 完整数据库创建指南

## 📋 目录
1. [数据库概览](#数据库概览)
2. [逻辑漏洞分析](#逻辑漏洞分析)
3. [完整表结构](#完整表结构)
4. [创建步骤](#创建步骤)
5. [初始数据](#初始数据)
6. [验证脚本](#验证脚本)

---

## 数据库概览

- **数据库名称**: `who_is_the_bot`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **引擎**: InnoDB
- **总表数**: 6 张表

---

## 逻辑漏洞分析

### 🔴 发现的问题

#### 1. 游客ID管理问题
**问题**:
- 前端 feed.js 使用 `wx.getStorageSync('guestId')`，但从未设置过
- 登录失败时创建的是 `userId: 'guest_xxx'`，不是 `guestId`

**解决方案**:
- 在 auth.js 中添加 `getOrCreateGuestId()` 函数
- 首次访问时生成唯一的 guestId 并持久化存储

#### 2. 点赞重复问题
**问题**:
- `likeComment()` 没有防止重复点赞
- 用户可以无限点赞同一条评论

**解决方案**:
- 创建 `comment_likes` 表记录点赞关系
- 添加唯一约束防止重复点赞

#### 3. 时间格式问题
**问题**:
- 后端返回 ISO 时间字符串，前端直接显示不友好

**解决方案**:
- 前端添加时间格式化工具函数
- 显示为 "刚刚"、"5分钟前"、"2小时前" 等

#### 4. 评论内容验证
**问题**:
- 后端 DTO 缺少内容长度验证
- 没有敏感词过滤

**解决方案**:
- 在 CreateCommentDto 中添加 `@MaxLength(500)` 验证
- 集成微信内容安全 API

#### 5. 分页问题
**问题**:
- `getCommentsByContentId` 没有分页
- 评论多了会有性能问题

**解决方案**:
- 添加分页参数 (limit, offset)
- 前端实现无限滚动加载

---

## 完整表结构

### 1. users 表（用户信息）

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT '用户ID (UUID)',
  nickname VARCHAR(100) NOT NULL COMMENT '用户昵称',
  uid VARCHAR(50) NOT NULL UNIQUE COMMENT '微信唯一标识',
  level INT NOT NULL DEFAULT 1 COMMENT '用户等级(1-4)',
  avatar TEXT COMMENT '头像URL',
  accuracy FLOAT NOT NULL DEFAULT 0 COMMENT '总体准确率(%)',
  totalJudged INT NOT NULL DEFAULT 0 COMMENT '总判定次数',
  correct_count INT NOT NULL DEFAULT 0 COMMENT '总正确次数',
  streak INT NOT NULL DEFAULT 0 COMMENT '当前连胜数',
  maxStreak INT NOT NULL DEFAULT 0 COMMENT '历史最大连胜数',
  totalBotsBusted INT NOT NULL DEFAULT 0 COMMENT '识破AI总数',
  weeklyAccuracy FLOAT NOT NULL DEFAULT 0 COMMENT '本周准确率(%)',
  weeklyJudged INT NOT NULL DEFAULT 0 COMMENT '本周判定次数',
  weeklyCorrect INT NOT NULL DEFAULT 0 COMMENT '本周正确次数',
  lastWeekReset TIMESTAMP NULL COMMENT '上次周统计重置时间',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX idx_users_total_judged (totalJudged),
  INDEX idx_users_accuracy (accuracy),
  INDEX idx_users_weekly_judged (weeklyJudged),
  INDEX idx_users_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';
```

### 2. content 表（内容）

```sql
CREATE TABLE content (
  id VARCHAR(36) PRIMARY KEY COMMENT '内容ID',
  type VARCHAR(20) NOT NULL COMMENT '内容类型(text/image/video)',
  url TEXT COMMENT '内容URL',
  text TEXT COMMENT '文本内容',
  title VARCHAR(255) NOT NULL COMMENT '标题',
  is_bot BOOLEAN NOT NULL COMMENT '是否是AI生成',
  modelTag VARCHAR(100) NOT NULL COMMENT '模型标签',
  provider VARCHAR(100) NOT NULL COMMENT '提供者',
  deceptionRate FLOAT NOT NULL COMMENT '欺骗率',
  explanation TEXT NOT NULL COMMENT '解释说明',
  total_votes INT NOT NULL DEFAULT 0 COMMENT '总投票数',
  ai_votes INT NOT NULL DEFAULT 0 COMMENT '认为是AI的投票数',
  human_votes INT NOT NULL DEFAULT 0 COMMENT '认为是人类的投票数',
  correct_votes INT NOT NULL DEFAULT 0 COMMENT '正确投票数',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX idx_content_total_votes (total_votes),
  INDEX idx_content_is_bot (is_bot),
  INDEX idx_content_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容表';
```

### 3. judgments 表（判定记录）

```sql
CREATE TABLE judgments (
  id VARCHAR(36) PRIMARY KEY COMMENT '判定记录ID (UUID)',
  user_id VARCHAR(36) COMMENT '用户ID（游客为NULL）',
  content_id VARCHAR(36) NOT NULL COMMENT '内容ID',
  user_choice VARCHAR(10) NOT NULL COMMENT '用户选择(ai/human)',
  is_correct BOOLEAN NOT NULL COMMENT '是否正确',
  guest_id VARCHAR(50) COMMENT '游客ID',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,

  INDEX idx_judgments_user_id (user_id),
  INDEX idx_judgments_content_id (content_id),
  INDEX idx_judgments_created_at (created_at),
  INDEX idx_judgments_guest_id (guest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='判定记录表';
```

### 4. achievements 表（成就定义）

```sql
CREATE TABLE achievements (
  id VARCHAR(36) PRIMARY KEY COMMENT '成就ID',
  name VARCHAR(100) NOT NULL COMMENT '成就名称',
  description TEXT NOT NULL COMMENT '成就描述',
  icon VARCHAR(255) COMMENT '图标（emoji或图标名）',
  type VARCHAR(50) NOT NULL COMMENT '成就类型(judgment_count/accuracy/streak/special)',
  requirement_value INT COMMENT '达成条件数值',
  points INT NOT NULL DEFAULT 0 COMMENT '成就积分',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就定义表';
```

### 5. user_achievements 表（用户成就关联）

```sql
CREATE TABLE user_achievements (
  id VARCHAR(36) PRIMARY KEY COMMENT '记录ID (UUID)',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  achievement_id VARCHAR(36) NOT NULL COMMENT '成就ID',
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id),

  INDEX idx_user_achievements_user_id (user_id),
  INDEX idx_user_achievements_achievement_id (achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就关联表';
```

### 6. comments 表（评论）

```sql
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY COMMENT '评论ID (UUID)',
  content_id VARCHAR(36) NOT NULL COMMENT '内容ID',
  user_id VARCHAR(36) COMMENT '用户ID（游客为NULL）',
  guest_id VARCHAR(50) COMMENT '游客ID',
  content TEXT NOT NULL COMMENT '评论内容',
  likes INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  parent_id VARCHAR(36) COMMENT '父评论ID（支持回复）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,

  INDEX idx_comments_content_id (content_id),
  INDEX idx_comments_user_id (user_id),
  INDEX idx_comments_guest_id (guest_id),
  INDEX idx_comments_parent_id (parent_id),
  INDEX idx_comments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';
```

---

## 创建步骤

### 步骤 1: 连接数据库

```bash
mysql -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com -P 25988 -u root -p
```

### 步骤 2: 创建数据库（如果不存在）

```sql
CREATE DATABASE IF NOT EXISTS who_is_the_bot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE who_is_the_bot;
```

### 步骤 3: 设置字符集

```sql
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
```

### 步骤 4: 禁用外键检查

```sql
SET FOREIGN_KEY_CHECKS = 0;
```

### 步骤 5: 删除旧表（保留 content 表）

```sql
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS judgments;
DROP TABLE IF EXISTS users;

-- content 表保留不删除！
```

### 步骤 6: 启用外键检查

```sql
SET FOREIGN_KEY_CHECKS = 1;
```

### 步骤 7: 创建所有表

按照上面的表结构依次创建：
1. users 表
2. content 表（如果不存在）
3. judgments 表
4. achievements 表
5. user_achievements 表
6. comments 表

### 步骤 8: 确保 content 表字符集正确

```sql
ALTER TABLE content CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 步骤 9: 添加 content 表索引（如果不存在）

```sql
CREATE INDEX idx_content_total_votes ON content(total_votes);
CREATE INDEX idx_content_is_bot ON content(is_bot);
CREATE INDEX idx_content_created_at ON content(createdAt);
```

---

## 初始数据

### 插入成就数据

```sql
INSERT INTO achievements (id, name, description, icon, type, requirement_value, points) VALUES
  ('ach_first_judgment', '初出茅庐', '完成第一次判定', 'target', 'judgment_count', 1, 10),
  ('ach_10_judgments', '小试牛刀', '完成10次判定', 'search', 'judgment_count', 10, 20),
  ('ach_100_judgments', '身经百战', '完成100次判定', 'strong', 'judgment_count', 100, 50),
  ('ach_500_judgments', '经验丰富', '完成500次判定', 'trophy', 'judgment_count', 500, 100),
  ('ach_1000_judgments', '大师级侦探', '完成1000次判定', 'crown', 'judgment_count', 1000, 200),

  ('ach_accuracy_70', '火眼金睛', '准确率达到70%', 'eye', 'accuracy', 70, 30),
  ('ach_accuracy_80', '明察秋毫', '准确率达到80%', 'lens', 'accuracy', 80, 50),
  ('ach_accuracy_90', '神机妙算', '准确率达到90%', 'brain', 'accuracy', 90, 100),
  ('ach_accuracy_95', '料事如神', '准确率达到95%', 'star', 'accuracy', 95, 150),

  ('ach_streak_5', '连胜新手', '连续答对5题', 'fire', 'streak', 5, 20),
  ('ach_streak_10', '连胜达人', '连续答对10题', 'bolt', 'streak', 10, 40),
  ('ach_streak_20', '连胜专家', '连续答对20题', 'sparkle', 'streak', 20, 80),
  ('ach_streak_50', '连胜传奇', '连续答对50题', 'medal', 'streak', 50, 200);
```

---

## 验证脚本

### 验证所有表是否创建成功

```sql
-- 显示所有表
SHOW TABLES;

-- 显示成就数量
SELECT COUNT(*) AS achievement_count FROM achievements;

-- 显示 content 表记录数
SELECT COUNT(*) AS content_count FROM content;

-- 显示表结构和统计信息
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  DATA_LENGTH,
  INDEX_LENGTH,
  TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'content', 'judgments', 'achievements', 'user_achievements', 'comments')
ORDER BY TABLE_NAME;

-- 验证外键约束
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- 验证索引
SELECT
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME,
  NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'content', 'judgments', 'achievements', 'user_achievements', 'comments')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

---

## 表关系图

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

## 字段命名规则

### TypeORM 实体 vs 数据库字段

| TypeORM 属性 | 数据库字段 | 说明 |
|-------------|-----------|------|
| isAi | is_bot | 布尔值 |
| totalVotes | total_votes | 总投票数 |
| aiVotes | ai_votes | AI投票数 |
| humanVotes | human_votes | 人类投票数 |
| correctVotes | correct_votes | 正确投票数 |
| correctCount | correct_count | 正确次数 |
| userChoice | user_choice | 用户选择 |
| isCorrect | is_correct | 是否正确 |
| guestId | guest_id | 游客ID |
| contentId | content_id | 内容ID |
| userId | user_id | 用户ID |
| parentId | parent_id | 父评论ID |
| createdAt | createdAt / created_at | 创建时间 |
| updatedAt | updatedAt / updated_at | 更新时间 |

**其他字段直接使用 camelCase**:
- totalJudged, weeklyJudged, weeklyCorrect, weeklyAccuracy
- maxStreak, totalBotsBusted, lastWeekReset
- modelTag, deceptionRate

---

## 需要修复的前端代码

### 1. 修复游客ID管理 (utils/auth.js)

在 `auth.js` 中添加：

```javascript
const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER_ID: 'user_id',
  USER_INFO: 'user_info',
  GUEST_MODE: 'guest_mode',
  GUEST_ID: 'guest_id',  // 新增
  LOGIN_TIME: 'login_time'
};

/**
 * 获取或创建游客ID
 */
function getOrCreateGuestId() {
  try {
    let guestId = wx.getStorageSync(STORAGE_KEYS.GUEST_ID);
    if (!guestId) {
      // 生成唯一的游客ID
      guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync(STORAGE_KEYS.GUEST_ID, guestId);
      console.log('创建新的游客ID:', guestId);
    }
    return guestId;
  } catch (err) {
    console.error('获取游客ID失败:', err);
    return 'guest_' + Date.now();
  }
}

// 导出新函数
module.exports = {
  // ... 现有导出
  getOrCreateGuestId
};
```

### 2. 修复 feed.js 中的游客ID获取

```javascript
// 加载用户信息
loadUserInfo() {
  const auth = require('../../utils/auth.js');
  const userId = auth.getUserId();
  const guestId = auth.getOrCreateGuestId();  // 使用新函数

  this.setData({
    userId: userId || null,
    guestId: guestId
  });
},
```

### 3. 添加时间格式化工具 (utils/time.js)

创建新文件 `utils/time.js`:

```javascript
/**
 * 格式化时间为相对时间
 */
function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    // 超过7天显示具体日期
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }
}

module.exports = {
  formatRelativeTime
};
```

在 feed.js 中使用：

```javascript
const timeUtil = require('../../utils/time.js');

// 在 loadComments 成功后格式化时间
.then(res => {
  if (res.success && res.data) {
    const comments = res.data.comments.map(comment => ({
      ...comment,
      createdAt: timeUtil.formatRelativeTime(comment.createdAt),
      replies: comment.replies.map(reply => ({
        ...reply,
        createdAt: timeUtil.formatRelativeTime(reply.createdAt)
      }))
    }));

    this.setData({ comments });
  }
})
```

---

## 后续优化建议

### 1. 点赞防重复

创建 `comment_likes` 表：

```sql
CREATE TABLE comment_likes (
  id VARCHAR(36) PRIMARY KEY,
  comment_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  guest_id VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_comment_like (comment_id, user_id),
  UNIQUE KEY unique_guest_comment_like (comment_id, guest_id),

  INDEX idx_comment_likes_comment_id (comment_id),
  INDEX idx_comment_likes_user_id (user_id),
  INDEX idx_comment_likes_guest_id (guest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 评论分页

修改 CommentController:

```typescript
@Get()
async getComments(
  @Query('contentId') contentId: string,
  @Query('limit') limit: number = 20,
  @Query('offset') offset: number = 0
) {
  // 实现分页逻辑
}
```

### 3. 内容安全审核

集成微信内容安全 API：

```javascript
// 在 CommentService.createComment 中添加
const checkResult = await this.checkContentSecurity(dto.content);
if (!checkResult.pass) {
  throw new BadRequestException('评论内容包含敏感信息');
}
```

---

## 完成检查清单

- [ ] 数据库已创建
- [ ] 所有表已创建成功
- [ ] 成就数据已插入
- [ ] 外键约束已验证
- [ ] 索引已创建
- [ ] content 表数据已保留
- [ ] 前端游客ID逻辑已修复
- [ ] 时间格式化已实现
- [ ] 后端服务已重启
- [ ] 评论功能已测试

---

## 联系与支持

如果在创建数据库过程中遇到问题，请检查：
1. 数据库连接信息是否正确
2. 用户权限是否足够
3. 字符集设置是否正确
4. 外键约束是否冲突

**重要提示**: 执行前请务必备份现有数据！
