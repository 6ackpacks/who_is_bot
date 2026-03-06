# 数据库迁移管理

本目录包含 Who is the Bot 应用的数据库迁移脚本。

## 迁移脚本命名规范

所有迁移脚本必须遵循以下命名格式：

```
YYYYMMDD_HHMMSS_description.sql
```

**示例：**
- `20260202_143000_add_leaderboard_index.sql`
- `20260204_195900_add_wechat_fields.sql`
- `20260205_120000_optimize_query_performance.sql`

**命名规则说明：**
- `YYYYMMDD`: 年月日（8位数字）
- `HHMMSS`: 时分秒（6位数字）
- `description`: 简短的英文描述，使用下划线分隔单词
- 文件扩展名必须是 `.sql`

## 迁移脚本执行顺序

迁移脚本按文件名的时间戳顺序执行。系统会自动按字母顺序排序，确保按时间顺序应用迁移。

**重要原则：**
1. 已执行的迁移脚本不得修改
2. 新的迁移脚本必须使用当前时间戳
3. 不要手动调整时间戳来改变执行顺序

## 迁移脚本模板

### 标准迁移脚本模板

```sql
-- ============================================
-- 迁移脚本: [简短描述]
-- 版本: YYYYMMDD_HHMMSS
-- 作者: [你的名字]
-- 日期: YYYY-MM-DD
-- 说明: [详细说明此迁移的目的和影响]
-- ============================================

-- 使用正确的数据库
USE `who_is_bot`;

-- ============================================
-- 迁移内容
-- ============================================

-- 示例：添加新字段
ALTER TABLE `users`
ADD COLUMN `new_field` VARCHAR(100) NULL COMMENT '字段说明';

-- 示例：创建索引
CREATE INDEX `idx_new_field` ON `users` (`new_field`);

-- ============================================
-- 验证
-- ============================================

-- 验证字段是否创建成功
SELECT
  CASE WHEN COUNT(*) > 0 THEN '✅ 迁移成功' ELSE '❌ 迁移失败' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'new_field';

SELECT '=== 迁移完成 ===' AS message;
```

### 安全迁移脚本模板（推荐）

```sql
-- ============================================
-- 安全迁移脚本: [简短描述]
-- 版本: YYYYMMDD_HHMMSS
-- 作者: [你的名字]
-- 日期: YYYY-MM-DD
-- 说明: [详细说明]
-- 特性: 可重复执行，自动检查是否已应用
-- ============================================

USE `who_is_bot`;

-- ============================================
-- 检查并添加字段
-- ============================================

-- 检查字段是否存在
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'who_is_bot'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'new_field'
);

-- 仅在字段不存在时添加
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `new_field` VARCHAR(100) NULL',
  'SELECT "字段已存在，跳过" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 检查并创建索引
-- ============================================

SET @index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'who_is_bot'
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'idx_new_field'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `idx_new_field` ON `users` (`new_field`)',
  'SELECT "索引已存在，跳过" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 验证
-- ============================================

SELECT '=== 迁移验证 ===' AS '';

SELECT
  CASE WHEN COUNT(*) > 0 THEN '✅ 字段创建成功' ELSE '❌ 字段不存在' END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'new_field';

SELECT
  CASE WHEN COUNT(*) > 0 THEN '✅ 索引创建成功' ELSE '❌ 索引不存在' END AS status
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'who_is_bot'
  AND TABLE_NAME = 'users'
  AND INDEX_NAME = 'idx_new_field';

SELECT '=== 迁移完成 ===' AS '';
```

## 已应用的迁移

### 20260305120000 - 修复数据库约束和数据完整性 (关键迁移)
**状态**: 待应用
**文件**:
- `20260305120000-pre-migration-check.sql` - 迁移前数据检查（必须先运行）
- `20260305120000-fix-database-constraints.sql` - 主迁移脚本
- `20260305120000-fix-database-constraints-rollback.sql` - 回滚脚本
- `README-MIGRATION-20260305.md` - 详细迁移指南

**目的**: 添加关键数据库约束、索引并修复数据类型问题

**功能**:
- 添加外键约束确保引用完整性
- 添加唯一约束防止重复判定
- 添加性能索引优化常见查询
- 修复 FLOAT 到 DECIMAL(5,2) 的精度字段
- 清理孤立和重复数据

**影响**: 高 - 对数据完整性和生产就绪至关重要

**详细文档**: 查看 `README-MIGRATION-20260305.md` 获取完整说明

**快速开始**:
```bash
# 1. 备份数据库
mysqldump -u username -p who_is_bot > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 运行迁移前检查
mysql -u username -p who_is_bot < migrations/20260305120000-pre-migration-check.sql > check_report.txt

# 3. 查看检查报告
cat check_report.txt

# 4. 执行迁移
mysql -u username -p who_is_bot < migrations/20260305120000-fix-database-constraints.sql > migration_log.txt

# 5. 验证结果
cat migration_log.txt
```

---

### add-leaderboard-index.sql (历史迁移)
**状态**: 已应用
**目的**: 优化排行榜查询性能

请查看 [migration-history.md](./migration-history.md) 了解已执行的迁移记录。

## 如何应用迁移

### 开发环境

```bash
# 方法1: 使用 MySQL CLI
mysql -u username -p database_name < migrations/YYYYMMDD_HHMMSS_description.sql

# 方法2: 使用 MySQL Workbench
# 1. 打开 SQL 文件
# 2. 检查脚本内容
# 3. 执行脚本
```

### 生产环境

**⚠️ 生产环境迁移必须遵循以下流程：**

1. **备份数据库**
   ```bash
   mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **在测试环境验证**
   - 在与生产环境相同配置的测试环境中执行迁移
   - 验证迁移成功且无错误
   - 测试应用功能正常

3. **准备回滚脚本**
   - 确保有对应的回滚脚本
   - 测试回滚脚本可用

4. **执行迁移**
   ```bash
   # 在低峰期执行
   mysql -u username -p database_name < migrations/YYYYMMDD_HHMMSS_description.sql
   ```

5. **验证结果**
   - 检查迁移是否成功
   - 验证应用功能正常
   - 监控性能指标

6. **记录迁移**
   - 更新 migration-history.md
   - 记录执行时间和结果

## 回滚脚本

每个迁移脚本都应该有对应的回滚脚本，命名格式：

```
YYYYMMDD_HHMMSS_description.rollback.sql
```

**回滚脚本示例：**

```sql
-- ============================================
-- 回滚脚本: [对应的迁移描述]
-- 版本: YYYYMMDD_HHMMSS
-- 说明: 回滚 YYYYMMDD_HHMMSS_description.sql 的更改
-- ============================================

USE `who_is_bot`;

-- 删除索引
DROP INDEX IF EXISTS `idx_new_field` ON `users`;

-- 删除字段
ALTER TABLE `users` DROP COLUMN IF EXISTS `new_field`;

-- 验证回滚
SELECT '=== 回滚完成 ===' AS message;
```

## 迁移最佳实践

### 1. 安全性

- ✅ 始终在开发环境测试
- ✅ 生产环境执行前备份数据库
- ✅ 使用事务（如果可能）
- ✅ 准备回滚计划
- ❌ 不要在迁移中使用 `DROP DATABASE`
- ❌ 不要在迁移中使用 `TRUNCATE TABLE`
- ❌ 不要删除生产数据

### 2. 可维护性

- ✅ 使用清晰的命名和注释
- ✅ 每个迁移只做一件事
- ✅ 使用幂等性设计（可重复执行）
- ✅ 包含验证步骤
- ❌ 不要修改已执行的迁移
- ❌ 不要在一个迁移中做太多事情

### 3. 性能

- ✅ 在低峰期执行大型迁移
- ✅ 对大表的操作要考虑锁表时间
- ✅ 使用 `ALGORITHM=INPLACE` 减少锁表时间
- ✅ 监控迁移执行时间
- ⚠️ 注意索引创建可能需要较长时间

### 4. 兼容性

- ✅ 考虑向后兼容性
- ✅ 分阶段迁移（先添加字段，再修改代码，最后删除旧字段）
- ✅ 使用默认值避免 NULL 问题
- ⚠️ 注意数据类型转换可能导致数据丢失

## 常见问题

### Q: 迁移执行失败怎么办？

A:
1. 检查错误信息
2. 确认数据库状态
3. 如果部分执行成功，手动清理已执行的部分
4. 修复问题后重新执行
5. 如果无法修复，执行回滚脚本

### Q: 如何处理大表的迁移？

A:
1. 使用 `ALGORITHM=INPLACE, LOCK=NONE` 减少锁表
2. 在低峰期执行
3. 考虑分批处理
4. 监控执行进度

### Q: 多人协作时如何避免冲突？

A:
1. 使用时间戳命名避免文件名冲突
2. 及时同步 migration-history.md
3. 在团队中沟通迁移计划
4. 使用版本控制管理迁移脚本

## 相关文档

- [migration-history.md](./migration-history.md) - 迁移历史记录
- [pre-deployment-checklist.md](./pre-deployment-checklist.md) - 部署前检查清单
- [rollback-guide.md](./rollback-guide.md) - 回滚指南

## 联系方式

如有问题，请联系数据库管理员或查看项目文档。
