# 并发测试脚本使用指南

本目录包含用于测试认证和用户管理系统并发性能的测试脚本。

## 测试脚本列表

### 1. concurrent-auth-test.js
**主并发测试脚本**

模拟 20 个用户同时进行认证和用户操作，测试系统的并发处理能力。

**测试场景**:
- 并发登录测试 (20个用户同时登录)
- 并发获取用户信息 (20个用户同时获取自己的信息)
- 并发更新用户统计 (20个用户同时更新统计)

**运行方式**:
```bash
node concurrent-auth-test.js
```

**输出内容**:
- 每个测试场景的详细结果
- 响应时间统计 (平均/最大/最小)
- Token 唯一性检查
- 数据一致性检查
- 最终测试报告

**配置**:
```javascript
const CONFIG = {
  BASE_URL: 'localhost',
  PORT: 80,
  CONCURRENT_USERS: 20,  // 可修改并发用户数
  TIMEOUT: 10000,        // 请求超时时间
};
```

---

### 2. verify-db-consistency.js
**数据库一致性验证脚本**

在并发测试后验证数据库中的数据一致性。

**验证项目**:
- 测试用户数量
- UID 唯一性
- ID 唯一性
- 昵称唯一性
- 数据完整性
- 统计数据准确性
- 时间戳一致性

**运行方式**:
```bash
node verify-db-consistency.js
```

**前置条件**:
- 需要配置 `.env` 文件中的数据库连接信息
- 需要安装 `mysql2` 包

---

### 3. check-tables.js
**数据库表检查脚本**

列出数据库中的所有表。

**运行方式**:
```bash
node check-tables.js
```

---

### 4. check-users-table.js
**用户表结构检查脚本**

显示 users 表的详细结构。

**运行方式**:
```bash
node check-users-table.js
```

---

## 完整测试流程

### 步骤 1: 确保服务器运行

```bash
# 检查服务器是否在运行
curl http://localhost:80/auth/me

# 或者启动服务器
npm run start:dev
```

### 步骤 2: 运行并发测试

```bash
node concurrent-auth-test.js
```

**预期输出**:
```
================================================================================
测试1: 并发登录测试 (20个用户同时登录)
================================================================================

发起 20 个并发登录请求...

--------------------------------------------------------------------------------
登录测试结果:
--------------------------------------------------------------------------------
总请求数: 20
成功: 20
失败: 0
成功率: 100.00%

响应时间统计:
  平均: 233.90ms
  最大: 289.00ms
  最小: 192.00ms

Token 唯一性检查:
  生成的唯一 Token 数: 20
  Token 冲突: 0
...
```

### 步骤 3: 验证数据库一致性

```bash
node verify-db-consistency.js
```

**预期输出**:
```
================================================================================
数据库一致性验证
================================================================================

连接数据库...
数据库连接成功

1. 检查测试用户数量:
   找到 20 个测试用户

2. 检查 UID 唯一性:
   ✅ 所有 UID 都是唯一的

3. 检查 ID 唯一性:
   ✅ 所有 ID 都是唯一的
...
```

### 步骤 4: 查看测试报告

测试完成后，查看生成的报告文件：

- `concurrent-test-report.md` - 简要报告
- `CONCURRENT_TEST_FULL_REPORT.md` - 完整详细报告
- `CONCURRENT_TEST_SUMMARY.md` - 快速参考摘要

---

## 环境要求

### 必需的依赖

测试脚本使用 Node.js 原生模块，无需额外安装依赖：
- `http` - 原生 HTTP 模块
- `mysql2/promise` - 数据库连接 (仅数据库验证脚本需要)

### 环境变量

数据库验证脚本需要 `.env` 文件配置：

```env
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_username
DB_PASS=your_password
DB_NAME=who_is_bot
```

---

## 测试配置

### 修改并发用户数

编辑 `concurrent-auth-test.js`:

```javascript
const CONFIG = {
  BASE_URL: 'localhost',
  PORT: 80,
  CONCURRENT_USERS: 50,  // 修改为 50 个并发用户
  TIMEOUT: 10000,
};
```

### 修改服务器地址

```javascript
const CONFIG = {
  BASE_URL: 'your-server.com',  // 修改服务器地址
  PORT: 3000,                    // 修改端口
  CONCURRENT_USERS: 20,
  TIMEOUT: 10000,
};
```

### 修改超时时间

```javascript
const CONFIG = {
  BASE_URL: 'localhost',
  PORT: 80,
  CONCURRENT_USERS: 20,
  TIMEOUT: 30000,  // 30 秒超时
};
```

---

## 测试结果解读

### 成功的测试

```
测试结果: 全部通过
```

**指标**:
- 成功率: 100%
- Token 冲突: 0
- 数据不匹配: 0
- 数据冲突: 0
- 响应时间: < 1秒

### 失败的测试

如果测试失败，检查以下内容：

1. **Token 冲突**
   - 问题: JWT token 生成不唯一
   - 解决: 检查 JWT secret 配置和 token 生成逻辑

2. **数据串号**
   - 问题: 用户获取到其他用户的数据
   - 解决: 检查 JWT 认证中间件和权限验证

3. **数据冲突**
   - 问题: 并发更新导致数据不一致
   - 解决: 检查数据库事务处理和锁机制

4. **响应超时**
   - 问题: 请求超过 10 秒未响应
   - 解决: 检查数据库连接池配置和查询性能

5. **连接失败**
   - 问题: 无法连接到服务器
   - 解决: 确保服务器正在运行，检查端口配置

---

## 性能基准

### 优秀性能指标

- 平均响应时间: < 200ms
- 最大响应时间: < 500ms
- 成功率: 100%
- Token 唯一性: 100%
- 数据一致性: 100%

### 可接受性能指标

- 平均响应时间: < 1000ms
- 最大响应时间: < 2000ms
- 成功率: > 95%
- Token 唯一性: 100%
- 数据一致性: 100%

### 需要优化的指标

- 平均响应时间: > 1000ms
- 最大响应时间: > 2000ms
- 成功率: < 95%
- Token 冲突: > 0
- 数据不一致: > 0

---

## 故障排查

### 问题: 测试脚本无法运行

**检查**:
1. Node.js 是否已安装
2. 当前目录是否正确
3. 文件权限是否正确

**解决**:
```bash
# 检查 Node.js 版本
node --version

# 确保在正确的目录
cd C:\Users\li\Downloads\who-is-the-bot\services

# 运行测试
node concurrent-auth-test.js
```

### 问题: 连接数据库失败

**检查**:
1. `.env` 文件是否存在
2. 数据库连接信息是否正确
3. 数据库是否可访问

**解决**:
```bash
# 检查 .env 文件
cat .env

# 测试数据库连接
node check-tables.js
```

### 问题: 服务器未运行

**检查**:
```bash
# 检查端口是否被占用
netstat -ano | grep ":80"

# 启动服务器
npm run start:dev
```

### 问题: 测试失败率高

**可能原因**:
1. 数据库连接池不足
2. 服务器资源不足
3. 网络延迟
4. 代码存在 bug

**解决**:
1. 增加数据库连接池大小
2. 优化数据库查询
3. 检查服务器资源使用情况
4. 查看服务器日志排查错误

---

## 扩展测试

### 测试更多并发用户

```javascript
// 修改配置
const CONFIG = {
  CONCURRENT_USERS: 50,  // 或 100, 200
};
```

### 测试不同的 API 端点

在 `concurrent-auth-test.js` 中添加新的测试场景：

```javascript
async function testConcurrentGetLeaderboard() {
  logSection('测试4: 并发获取排行榜');

  const promises = [];
  for (let i = 0; i < CONFIG.CONCURRENT_USERS; i++) {
    promises.push(makeRequest('GET', '/user/leaderboard/top?limit=50'));
  }

  await Promise.all(promises);
  // 处理结果...
}
```

### 压力测试

创建长时间运行的测试：

```javascript
async function stressTest() {
  for (let round = 1; round <= 100; round++) {
    console.log(`\n第 ${round} 轮测试`);
    await runTests();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

## 最佳实践

1. **定期运行测试**: 在每次重大更新后运行并发测试
2. **保存测试结果**: 记录每次测试的结果，跟踪性能变化
3. **逐步增加负载**: 从小规模开始，逐步增加并发用户数
4. **监控系统资源**: 测试时监控 CPU、内存、数据库连接等
5. **清理测试数据**: 测试后清理测试用户数据

---

## 清理测试数据

测试完成后，可以清理测试用户：

```sql
-- 删除测试用户
DELETE FROM users WHERE nickname LIKE 'TestUser%';

-- 验证删除
SELECT COUNT(*) FROM users WHERE nickname LIKE 'TestUser%';
```

或者创建清理脚本：

```javascript
// cleanup-test-users.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [result] = await connection.execute(
    "DELETE FROM users WHERE nickname LIKE 'TestUser%'"
  );

  console.log(`已删除 ${result.affectedRows} 个测试用户`);
  await connection.end();
}

cleanup();
```

---

## 相关文档

- [完整测试报告](./CONCURRENT_TEST_FULL_REPORT.md)
- [测试摘要](./CONCURRENT_TEST_SUMMARY.md)
- [API 文档](./README.md)
- [安全修复文档](./SECURITY_FIXES.md)

---

## 联系和支持

如有问题或建议，请查看项目文档或联系开发团队。

**测试脚本版本**: 1.0
**最后更新**: 2026-02-02
