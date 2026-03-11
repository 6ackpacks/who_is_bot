# 数据库迁移执行指南

## 📋 概述

本指南详细说明如何安全地执行数据库迁移，包括迁移文件的执行顺序、备份策略、验证方法和回滚步骤。

---

## 🔢 迁移文件执行顺序

迁移文件必须按照以下顺序执行：

1. **006_add_content_vote_fields.sql** - 添加内容投票统计字段
2. **007_add_guest_id_fields.sql** - 添加游客评论和回复功能字段

> ⚠️ **重要提示**：请严格按照顺序执行，不要跳过或颠倒顺序。

---

## 🔌 数据库连接方式

### 方式一：使用 MySQL 命令行客户端

```bash
mysql -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
      -P 25988 \
      -u root \
      -p \
      who_is_bot
```

输入密码后即可连接到数据库。

### 方式二：使用 MySQL Workbench

1. 打开 MySQL Workbench
2. 创建新连接，填写以下信息：
   - **Connection Name**: Who Is Bot Production
   - **Hostname**: sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com
   - **Port**: 25988
   - **Username**: root
   - **Default Schema**: who_is_bot
3. 点击 "Test Connection" 测试连接
4. 保存并连接

### 方式三：使用 DBeaver

1. 创建新的 MySQL 连接
2. 填写连接信息（同上）
3. 测试并连接

---

## 💾 执行前的备份建议

### 1. 完整数据库备份

在执行任何迁移之前，务必进行完整备份：

```bash
mysqldump -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
          -P 25988 \
          -u root \
          -p \
          who_is_bot > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 备份受影响的表

如果只想备份受影响的表：

```bash
# 备份 content 表
mysqldump -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
          -P 25988 \
          -u root \
          -p \
          who_is_bot content > backup_content_$(date +%Y%m%d_%H%M%S).sql

# 备份 comments 表
mysqldump -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
          -P 25988 \
          -u root \
          -p \
          who_is_bot comments > backup_comments_$(date +%Y%m%d_%H%M%S).sql
```

### 3. 验证备份文件

```bash
# 检查备份文件大小
ls -lh backup_*.sql

# 查看备份文件前几行
head -n 50 backup_*.sql
```

---

## 📝 迁移文件详细说明

### 迁移 006：添加内容投票统计字段

**文件名**: `006_add_content_vote_fields.sql`

**作用**:
- 为 `content` 表添加 4 个投票统计字段：
  - `totalVotes`: 总投票数
  - `aiVotes`: AI 投票数
  - `humanVotes`: 人类投票数
  - `correctVotes`: 正确投票数
- 创建 5 个索引优化查询性能
- 初始化现有数据的投票统计

**影响范围**: `content` 表

**预计执行时间**: 取决于现有数据量，建议在低峰期执行

**执行命令**:
```bash
mysql -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
      -P 25988 \
      -u root \
      -p \
      who_is_bot < 006_add_content_vote_fields.sql
```

---

### 迁移 007：添加游客评论和回复功能字段

**文件名**: `007_add_guest_id_fields.sql`

**作用**:
- 为 `comments` 表添加 2 个字段：
  - `guest_id`: 游客 ID（支持未登录用户评论）
  - `parent_id`: 父评论 ID（支持评论回复功能）
- 创建 3 个索引优化查询性能
- 添加外键约束确保数据完整性
- 执行数据完整性检查

**影响范围**: `comments` 表

**预计执行时间**: 通常在几秒内完成

**执行命令**:
```bash
mysql -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
      -P 25988 \
      -u root \
      -p \
      who_is_bot < 007_add_guest_id_fields.sql
```

---

## ✅ 验证迁移是否成功

### 验证迁移 006

连接到数据库后，执行以下 SQL 查询：

```sql
-- 1. 检查字段是否添加成功
DESCRIBE content;

-- 2. 检查索引是否创建成功
SHOW INDEX FROM content WHERE Key_name IN (
    'idx_content_total_votes',
    'idx_content_ai_votes',
    'idx_content_human_votes',
    'idx_content_correct_votes',
    'idx_content_votes_accuracy'
);

-- 3. 验证投票统计数据是否正确初始化
SELECT
    id,
    type,
    totalVotes,
    aiVotes,
    humanVotes,
    correctVotes,
    (SELECT COUNT(*) FROM judgments WHERE content_id = content.id) AS actual_total
FROM content
LIMIT 10;

-- 4. 检查统计数据一致性
SELECT
    COUNT(*) AS total_content,
    SUM(totalVotes) AS sum_total_votes,
    SUM(aiVotes) AS sum_ai_votes,
    SUM(humanVotes) AS sum_human_votes,
    SUM(correctVotes) AS sum_correct_votes
FROM content;
```

**预期结果**:
- `DESCRIBE` 应显示 4 个新字段
- `SHOW INDEX` 应显示 5 个新索引
- 投票统计数据应与实际 judgments 表数据一致

---

### 验证迁移 007

```sql
-- 1. 检查字段是否添加成功
DESCRIBE comments;

-- 2. 检查索引是否创建成功
SHOW INDEX FROM comments WHERE Key_name IN (
    'idx_comments_guest_id',
    'idx_comments_parent_id',
    'idx_comments_content_created'
);

-- 3. 检查外键约束是否创建成功
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'comments'
  AND CONSTRAINT_NAME = 'fk_comments_parent_id';

-- 4. 检查是否存在孤立的回复（应该返回 0）
SELECT
    COUNT(*) AS orphaned_replies
FROM comments c
LEFT JOIN comments p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL
  AND p.id IS NULL;

-- 5. 验证字段可用性
SELECT
    id,
    contentId,
    user_id,
    guest_id,
    parent_id,
    content,
    createdAt
FROM comments
LIMIT 5;
```

**预期结果**:
- `DESCRIBE` 应显示 `guest_id` 和 `parent_id` 字段
- `SHOW INDEX` 应显示 3 个新索引
- 外键约束 `fk_comments_parent_id` 应存在
- 孤立回复数量应为 0

---

## 🔄 回滚步骤

如果迁移出现问题，可以按照以下步骤回滚。

### 回滚迁移 007

```sql
-- 删除外键约束
ALTER TABLE comments DROP FOREIGN KEY IF EXISTS fk_comments_parent_id;

-- 删除索引
DROP INDEX IF EXISTS idx_comments_content_created ON comments;
DROP INDEX IF EXISTS idx_comments_parent_id ON comments;
DROP INDEX IF EXISTS idx_comments_guest_id ON comments;

-- 删除字段
ALTER TABLE comments DROP COLUMN IF EXISTS parent_id;
ALTER TABLE comments DROP COLUMN IF EXISTS guest_id;
```

### 回滚迁移 006

```sql
-- 删除索引
DROP INDEX IF EXISTS idx_content_votes_accuracy ON content;
DROP INDEX IF EXISTS idx_content_correct_votes ON content;
DROP INDEX IF EXISTS idx_content_human_votes ON content;
DROP INDEX IF EXISTS idx_content_ai_votes ON content;
DROP INDEX IF EXISTS idx_content_total_votes ON content;

-- 删除字段
ALTER TABLE content DROP COLUMN IF EXISTS correctVotes;
ALTER TABLE content DROP COLUMN IF EXISTS humanVotes;
ALTER TABLE content DROP COLUMN IF EXISTS aiVotes;
ALTER TABLE content DROP COLUMN IF EXISTS totalVotes;
```

### 从备份恢复

如果需要完全恢复到迁移前的状态：

```bash
# 恢复完整数据库
mysql -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
      -P 25988 \
      -u root \
      -p \
      who_is_bot < backup_20260311_120000.sql

# 或者只恢复特定表
mysql -h sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com \
      -P 25988 \
      -u root \
      -p \
      who_is_bot < backup_content_20260311_120000.sql
```

---

## ❓ 常见问题和解决方案

### 问题 1：连接超时

**症状**: `ERROR 2003 (HY000): Can't connect to MySQL server`

**解决方案**:
1. 检查网络连接
2. 确认 IP 地址是否在数据库白名单中
3. 验证端口 25988 是否开放
4. 尝试使用 telnet 测试连接：
   ```bash
   telnet sh-cynosdbmysql-grp-ac7927g6.sql.tencentcdb.com 25988
   ```

---

### 问题 2：权限不足

**症状**: `ERROR 1142 (42000): ALTER command denied`

**解决方案**:
1. 确认使用的是 root 用户
2. 检查用户权限：
   ```sql
   SHOW GRANTS FOR CURRENT_USER();
   ```
3. 如果权限不足，联系数据库管理员

---

### 问题 3：索引已存在

**症状**: `ERROR 1061 (42000): Duplicate key name 'idx_xxx'`

**解决方案**:
1. 检查索引是否已存在：
   ```sql
   SHOW INDEX FROM content WHERE Key_name = 'idx_content_total_votes';
   ```
2. 如果索引已存在，可以跳过该索引创建语句
3. 或者先删除旧索引再创建：
   ```sql
   DROP INDEX idx_content_total_votes ON content;
   ```

---

### 问题 4：字段已存在

**症状**: `ERROR 1060 (42S21): Duplicate column name 'totalVotes'`

**解决方案**:
1. 检查字段是否已存在：
   ```sql
   DESCRIBE content;
   ```
2. 如果字段已存在，说明迁移可能已经执行过，无需重复执行

---

### 问题 5：外键约束失败

**症状**: `ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`

**解决方案**:
1. 检查是否存在孤立的回复：
   ```sql
   SELECT COUNT(*) FROM comments c
   LEFT JOIN comments p ON c.parent_id = p.id
   WHERE c.parent_id IS NOT NULL AND p.id IS NULL;
   ```
2. 清理孤立数据：
   ```sql
   UPDATE comments SET parent_id = NULL
   WHERE parent_id NOT IN (SELECT id FROM comments);
   ```
3. 重新执行外键创建语句

---

### 问题 6：迁移执行时间过长

**症状**: 迁移 006 在更新现有数据时长时间无响应

**解决方案**:
1. 检查数据量：
   ```sql
   SELECT COUNT(*) FROM content;
   SELECT COUNT(*) FROM judgments;
   ```
2. 如果数据量很大（超过 10 万条），考虑分批更新：
   ```sql
   -- 分批更新，每次 1000 条
   UPDATE content c
   SET totalVotes = (SELECT COUNT(*) FROM judgments WHERE content_id = c.id)
   WHERE c.id IN (SELECT id FROM content LIMIT 1000);
   ```
3. 在低峰期执行迁移

---

### 问题 7：备份文件过大

**症状**: 备份文件太大，难以传输或存储

**解决方案**:
1. 使用压缩备份：
   ```bash
   mysqldump ... | gzip > backup.sql.gz
   ```
2. 只备份表结构和必要数据：
   ```bash
   mysqldump --no-data ... > schema_backup.sql
   ```

---

## 📊 迁移执行检查清单

执行迁移前，请确认以下事项：

- [ ] 已阅读完整的迁移指南
- [ ] 已完成数据库完整备份
- [ ] 已验证备份文件完整性
- [ ] 已确认在低峰期执行（如适用）
- [ ] 已通知相关团队成员
- [ ] 已准备好回滚方案
- [ ] 已测试数据库连接
- [ ] 已确认有足够的权限执行迁移

执行迁移后，请确认：

- [ ] 所有迁移文件已成功执行
- [ ] 已执行验证 SQL 查询
- [ ] 验证结果符合预期
- [ ] 应用程序功能正常
- [ ] 性能指标正常
- [ ] 已记录迁移执行时间和结果

---

## 📞 支持与联系

如果在迁移过程中遇到问题，请：

1. 查阅本指南的"常见问题和解决方案"部分
2. 检查迁移文件中的注释说明
3. 联系数据库管理员或开发团队

---

## 📅 迁移历史记录

建议在每次执行迁移后记录以下信息：

| 迁移文件 | 执行日期 | 执行人 | 执行时长 | 状态 | 备注 |
|---------|---------|--------|---------|------|------|
| 006_add_content_vote_fields.sql | | | | | |
| 007_add_guest_id_fields.sql | | | | | |

---

**最后更新**: 2026-03-11
**文档版本**: 1.0
