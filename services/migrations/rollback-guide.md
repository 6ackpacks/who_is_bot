# 数据库迁移回滚指南

本文档提供数据库迁移回滚的详细指南和最佳实践。

---

## 回滚概述

数据库回滚是将数据库架构恢复到迁移前状态的过程。回滚应该是每次迁移计划的重要组成部分。

### 何时需要回滚

- 迁移执行失败且无法修复
- 迁移导致数据完整性问题
- 迁移导致应用功能异常
- 迁移导致性能严重下降
- 发现迁移脚本存在严重错误
- 业务需求变更需要撤销迁移

---

## 回滚脚本规范

### 命名规范

回滚脚本必须与对应的迁移脚本配对，命名格式：

```
YYYYMMDD_HHMMSS_description.rollback.sql
```

**示例：**
- 迁移脚本：`20260202_143000_add_leaderboard_index.sql`
- 回滚脚本：`20260202_143000_add_leaderboard_index.rollback.sql`

### 回滚脚本模板

```sql
-- ============================================
-- 回滚脚本: [迁移描述]
-- 版本: YYYYMMDD_HHMMSS
-- 对应迁移: YYYYMMDD_HHMMSS_description.sql
-- 作者: [你的名字]
-- 日期: YYYY-MM-DD
-- 说明: 回滚 [迁移描述] 的所有更改
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 回滚操作
-- ============================================

-- 按照与迁移相反的顺序执行回滚操作

-- 示例：删除索引
DROP INDEX IF EXISTS `idx_new_field` ON `users`;

-- 示例：删除字段
ALTER TABLE `users` DROP COLUMN IF EXISTS `new_field`;

-- 示例：删除表
DROP TABLE IF EXISTS `new_table`;

-- ============================================
-- 验证回滚
-- ============================================

-- 验证索引已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ 索引已删除' ELSE '❌ 索引仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'idx_new_field';

-- 验证字段已删除
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ 字段已删除' ELSE '❌ 字段仍存在' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'new_field';

SELECT '=== 回滚完成 ===' AS message;
```

---

## 回滚操作对照表

### 常见迁移操作的回滚方法

| 迁移操作 | 回滚操作 |
|---------|---------|
| `CREATE TABLE` | `DROP TABLE IF EXISTS` |
| `ALTER TABLE ADD COLUMN` | `ALTER TABLE DROP COLUMN IF EXISTS` |
| `ALTER TABLE MODIFY COLUMN` | `ALTER TABLE MODIFY COLUMN` (恢复原类型) |
| `ALTER TABLE RENAME COLUMN` | `ALTER TABLE RENAME COLUMN` (恢复原名称) |
| `CREATE INDEX` | `DROP INDEX IF EXISTS` |
| `DROP INDEX` | `CREATE INDEX` (重新创建) |
| `INSERT INTO` | `DELETE FROM WHERE` (删除插入的数据) |
| `UPDATE` | `UPDATE` (恢复原值，需要备份) |
| `DELETE` | `INSERT INTO` (恢复删除的数据，需要备份) |

---

## 回滚脚本示例

### 示例 1: 回滚添加字段的迁移

**迁移脚本** (`20260204_195900_add_wechat_fields.sql`):
```sql
ALTER TABLE users
ADD COLUMN openid VARCHAR(100) UNIQUE NULL,
ADD INDEX idx_openid (openid);

ALTER TABLE users
ADD COLUMN unionid VARCHAR(100) UNIQUE NULL,
ADD INDEX idx_unionid (unionid);

ALTER TABLE users
ADD COLUMN sessionKey VARCHAR(255) NULL;
```

**回滚脚本** (`20260204_195900_add_wechat_fields.rollback.sql`):
```sql
-- ============================================
-- 回滚脚本: 添加微信登录字段
-- 版本: 20260204_195900
-- ============================================

USE `who_is_bot`;

-- 删除索引
DROP INDEX IF EXISTS `idx_openid` ON `users`;
DROP INDEX IF EXISTS `idx_unionid` ON `users`;

-- 删除字段
ALTER TABLE `users` DROP COLUMN IF EXISTS `sessionKey`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `unionid`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `openid`;

-- 验证
SELECT '=== 回滚完成 ===' AS message;
```

### 示例 2: 回滚添加索引的迁移

**迁移脚本** (`20260202_143000_add_leaderboard_index.sql`):
```sql
CREATE INDEX IDX_USER_LEADERBOARD ON users (accuracy DESC, totalJudged DESC);
```

**回滚脚本** (`20260202_143000_add_leaderboard_index.rollback.sql`):
```sql
-- ============================================
-- 回滚脚本: 添加排行榜索引
-- 版本: 20260202_143000
-- ============================================

USE `who_is_bot`;

-- 删除索引
DROP INDEX IF EXISTS `IDX_USER_LEADERBOARD` ON `users`;

-- 验证
SELECT
  CASE WHEN COUNT(*) = 0 THEN '✅ 索引已删除' ELSE '❌ 索引仍存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'IDX_USER_LEADERBOARD';

SELECT '=== 回滚完成 ===' AS message;
```

### 示例 3: 回滚创建表的迁移

**迁移脚本** (`20260129_150700_create_achievements.sql`):
```sql
CREATE TABLE achievements (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  -- ... 其他字段
);

CREATE TABLE user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_id VARCHAR(36) NOT NULL,
  -- ... 其他字段
);
```

**回滚脚本** (`20260129_150700_create_achievements.rollback.sql`):
```sql
-- ============================================
-- 回滚脚本: 创建成就系统表
-- 版本: 20260129_150700
-- ============================================

USE `who_is_bot`;

-- ⚠️ 警告：此操作会删除表中的所有数据
-- 按照依赖关系的相反顺序删除表

-- 先删除有外键依赖的表
DROP TABLE IF EXISTS `user_achievements`;

-- 再删除被依赖的表
DROP TABLE IF EXISTS `achievements`;

-- 验证
SELECT '=== 回滚完成 ===' AS message;
```

---

## 回滚执行流程

### 1. 回滚前准备

```bash
# 1. 再次备份当前数据库状态
mysqldump -u username -p database_name > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# 2. 验证回滚脚本存在
ls -l migrations/*rollback.sql

# 3. 检查回滚脚本内容
cat migrations/YYYYMMDD_HHMMSS_description.rollback.sql
```

### 2. 执行回滚

```bash
# 停止应用服务（如需要）
# systemctl stop your-app

# 执行回滚脚本
mysql -u username -p database_name < migrations/YYYYMMDD_HHMMSS_description.rollback.sql

# 检查执行结果
echo $?  # 0 表示成功
```

### 3. 回滚后验证

```sql
-- 验证架构已恢复
SHOW TABLES;
DESCRIBE table_name;
SHOW INDEX FROM table_name;

-- 验证数据完整性
SELECT COUNT(*) FROM important_table;

-- 检查应用功能
-- 重启应用并测试核心功能
```

### 4. 记录回滚

在 `migration-history.md` 中记录回滚信息：

```markdown
### 回滚记录

#### 版本: 20260204_195900
- **原迁移**: 添加微信登录字段
- **回滚日期**: 2026-03-05 14:30:00
- **回滚原因**: 发现字段类型定义错误
- **执行人**: 张三
- **状态**: ✅ 成功
- **备注**: 已修复问题，准备重新执行迁移
```

---

## 特殊情况处理

### 无法完全回滚的情况

某些迁移操作无法完全回滚，需要特殊处理：

#### 1. 数据删除操作

**问题**: 迁移中删除了数据，回滚时无法恢复

**解决方案**:
- 从备份中恢复删除的数据
- 使用数据恢复脚本

```sql
-- 从备份表恢复数据
INSERT INTO users
SELECT * FROM users_backup
WHERE id NOT IN (SELECT id FROM users);
```

#### 2. 数据类型转换

**问题**: 字段类型转换可能导致数据丢失

**解决方案**:
- 迁移前备份原始数据
- 回滚时从备份恢复

```sql
-- 迁移前创建备份列
ALTER TABLE users ADD COLUMN old_field_backup TEXT;
UPDATE users SET old_field_backup = old_field;

-- 回滚时恢复
UPDATE users SET old_field = old_field_backup;
ALTER TABLE users DROP COLUMN old_field_backup;
```

#### 3. 复杂的数据迁移

**问题**: 涉及多表数据转换的迁移

**解决方案**:
- 使用事务确保原子性
- 创建详细的回滚脚本
- 从完整备份恢复

---

## 回滚最佳实践

### 1. 设计阶段

- ✅ 每个迁移都要设计回滚方案
- ✅ 回滚脚本与迁移脚本同时创建
- ✅ 考虑回滚的可行性
- ✅ 对于不可回滚的操作，准备数据恢复方案

### 2. 测试阶段

- ✅ 在测试环境测试回滚脚本
- ✅ 验证回滚后数据完整性
- ✅ 测试回滚后应用功能
- ✅ 记录回滚所需时间

### 3. 执行阶段

- ✅ 回滚前再次备份
- ✅ 在低峰期执行回滚
- ✅ 监控回滚执行过程
- ✅ 验证回滚结果

### 4. 文档记录

- ✅ 记录回滚原因
- ✅ 记录回滚过程
- ✅ 记录遇到的问题
- ✅ 总结经验教训

---

## 回滚决策树

```
迁移出现问题
    │
    ├─ 问题严重吗？
    │   ├─ 是 → 立即回滚
    │   └─ 否 → 尝试修复
    │
    ├─ 能快速修复吗？
    │   ├─ 是 → 修复并验证
    │   └─ 否 → 执行回滚
    │
    ├─ 影响用户吗？
    │   ├─ 是 → 立即回滚
    │   └─ 否 → 评估后决定
    │
    └─ 数据完整性受影响吗？
        ├─ 是 → 立即回滚
        └─ 否 → 继续监控
```

---

## 常见问题

### Q: 回滚会丢失数据吗？

A: 取决于迁移的类型：
- 架构变更（添加字段、索引）：不会丢失数据
- 数据变更（UPDATE、DELETE）：可能丢失，需要从备份恢复
- 建议：迁移前始终备份

### Q: 回滚需要多长时间？

A: 取决于操作类型：
- 删除索引：几秒到几分钟
- 删除字段：几秒到几分钟
- 恢复数据：取决于数据量，可能需要较长时间

### Q: 回滚失败怎么办？

A:
1. 检查错误信息
2. 手动执行回滚操作
3. 从完整备份恢复
4. 联系数据库管理员

### Q: 如何测试回滚脚本？

A:
1. 在测试环境执行迁移
2. 执行回滚脚本
3. 验证数据库状态恢复
4. 测试应用功能正常

---

## 相关文档

- [README.md](./README.md) - 迁移管理文档
- [migration-history.md](./migration-history.md) - 迁移历史记录
- [pre-deployment-checklist.md](./pre-deployment-checklist.md) - 部署前检查清单

---

**最后更新**: 2026-03-05
**文档版本**: 1.0
**维护人**: 数据库管理团队
