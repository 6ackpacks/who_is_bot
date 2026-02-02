# 并发认证测试 - 快速执行指南

## 测试脚本列表

本目录包含以下并发认证测试相关脚本：

### 1. 主测试脚本

**文件**: `concurrent-auth-test.js`

**功能**: 执行完整的并发认证和用户管理测试

**测试场景**:
- 20个用户同时登录
- 20个用户同时获取自己的信息
- 20个用户同时更新统计数据

**执行命令**:
```bash
node concurrent-auth-test.js
```

### 2. 数据库验证脚本

**文件**: `verify-concurrent-auth-db.js`

**功能**: 验证测试后的数据库一致性

**检查项**:
- UID 唯一性
- User ID 唯一性
- 统计数据准确性
- 数据完整性
- 时间戳验证

**执行命令**:
```bash
node verify-concurrent-auth-db.js
```

### 3. 数据查询脚本

**文件**: `query-test-users.js`

**功能**: 查询并显示所有测试用户的详细数据

**执行命令**:
```bash
node query-test-users.js
```

### 4. 清理脚本

**文件**: `cleanup-test-users.js`

**功能**: 清理所有测试用户数据

**执行命令**:
```bash
node cleanup-test-users.js
```

---

## 完整测试流程

### 方式一: 一键执行（推荐）

```bash
# 清理旧数据 -> 执行测试 -> 验证数据库
node cleanup-test-users.js && node concurrent-auth-test.js && node verify-concurrent-auth-db.js
```

### 方式二: 分步执行

```bash
# 步骤 1: 清理旧测试数据
node cleanup-test-users.js

# 步骤 2: 执行并发测试
node concurrent-auth-test.js

# 步骤 3: 验证数据库一致性
node verify-concurrent-auth-db.js

# 步骤 4: 查看详细数据（可选）
node query-test-users.js

# 步骤 5: 清理测试数据（可选）
node cleanup-test-users.js
```

---

## 测试结果解读

### 成功标准

测试通过需要满足以下所有条件：

1. **成功率**: 100%（60/60 请求成功）
2. **Token 唯一性**: 20个唯一 token，0 冲突
3. **数据隔离性**: 0 数据不匹配
4. **响应时间**: 平均 < 1秒
5. **数据一致性**: 0 数据冲突
6. **错误率**: < 5%

### 测试输出示例

#### 成功输出

```
================================================================================
测试结果: 全部通过
================================================================================

总体统计:
  总测试数: 60
  成功: 60
  失败: 0
  总体成功率: 100.00%

关键指标评估:
  1. Token 唯一性: 通过
  2. 数据隔离性: 通过
  3. 响应时间 (< 1秒): 通过 (平均: 102.90ms)
  4. 数据一致性: 通过
  5. 错误率 (< 5%): 通过 (0.00%)

潜在问题:
  未发现问题，所有测试通过！
```

#### 失败输出示例

如果测试失败，会显示详细的错误信息：

```
潜在问题:
  - JWT Token 生成存在冲突，可能导致安全问题
  - 用户数据隔离失败，存在严重的数据泄露风险
  - 响应时间过长，可能是数据库连接池不足或查询效率问题
  - 并发更新存在数据冲突，可能存在竞态条件
```

---

## 测试配置

### 修改并发用户数

编辑 `concurrent-auth-test.js`，修改配置：

```javascript
const CONFIG = {
  BASE_URL: 'localhost',
  PORT: 80,
  CONCURRENT_USERS: 20,  // 修改这里
  TIMEOUT: 10000,
};
```

### 修改服务器地址

```javascript
const CONFIG = {
  BASE_URL: 'your-server.com',  // 修改这里
  PORT: 80,
  CONCURRENT_USERS: 20,
  TIMEOUT: 10000,
};
```

---

## 故障排查

### 问题 1: 连接失败

**错误信息**: `ECONNREFUSED` 或 `Request timeout`

**解决方案**:
1. 确认服务器正在运行
2. 检查服务器地址和端口配置
3. 检查防火墙设置

```bash
# 测试服务器连接
curl http://localhost:80/auth/mock-login -X POST -H "Content-Type: application/json" -d '{"nickname":"Test"}'
```

### 问题 2: 数据库连接失败

**错误信息**: `ECONNREFUSED` 或数据库连接错误

**解决方案**:
1. 检查 `.env` 文件配置
2. 确认数据库服务正在运行
3. 验证数据库凭据

```bash
# 检查 .env 文件
cat .env

# 测试数据库连接
node check-tables.js
```

### 问题 3: Token 冲突

**错误信息**: `Token collision detected!`

**可能原因**:
- JWT 生成逻辑问题
- 时间戳精度不足
- 用户 ID 生成冲突

**解决方案**:
1. 检查 JWT 生成代码
2. 确保使用唯一标识符（UUID）
3. 增加时间戳精度

### 问题 4: 数据不匹配

**错误信息**: `Nickname mismatch` 或 `User ID mismatch`

**可能原因**:
- 认证中间件解析错误
- Token 验证问题
- 数据库查询错误

**解决方案**:
1. 检查 JWT 策略配置
2. 验证认证中间件逻辑
3. 检查数据库查询条件

---

## 性能基准

### 预期性能指标

| 指标 | 预期值 | 优秀 | 良好 | 需优化 |
|------|--------|------|------|--------|
| 登录响应时间 | < 200ms | < 100ms | 100-200ms | > 200ms |
| 获取用户信息 | < 100ms | < 50ms | 50-100ms | > 100ms |
| 更新统计 | < 150ms | < 100ms | 100-150ms | > 150ms |
| 成功率 | 100% | 100% | > 95% | < 95% |
| 错误率 | 0% | 0% | < 1% | > 1% |

### 实际测试结果（20并发）

| 指标 | 实际值 | 评级 |
|------|--------|------|
| 登录响应时间 | 149.10ms | 良好 |
| 获取用户信息 | 69.30ms | 良好 |
| 更新统计 | 90.30ms | 优秀 |
| 成功率 | 100% | 优秀 |
| 错误率 | 0% | 优秀 |

---

## 扩展测试

### 测试更高并发

修改 `CONCURRENT_USERS` 进行压力测试：

```bash
# 50 并发
# 修改 CONFIG.CONCURRENT_USERS = 50
node concurrent-auth-test.js

# 100 并发
# 修改 CONFIG.CONCURRENT_USERS = 100
node concurrent-auth-test.js
```

### 持续压力测试

```bash
# 循环执行 10 次测试
for i in {1..10}; do
  echo "=== 第 $i 次测试 ==="
  node cleanup-test-users.js
  node concurrent-auth-test.js
  sleep 2
done
```

### 长时间稳定性测试

```bash
# 每分钟执行一次，持续 1 小时
for i in {1..60}; do
  echo "=== 第 $i 分钟测试 ==="
  node cleanup-test-users.js
  node concurrent-auth-test.js
  sleep 60
done
```

---

## 测试报告

完整的测试报告请查看：

- **详细报告**: [CONCURRENT_AUTH_TEST_REPORT.md](./CONCURRENT_AUTH_TEST_REPORT.md)
- **测试指南**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **压力测试**: [STRESS_TEST_GUIDE.md](./STRESS_TEST_GUIDE.md)

---

## 依赖项

测试脚本需要以下依赖：

```json
{
  "mysql2": "^3.6.0",
  "dotenv": "^16.0.0"
}
```

确保已安装依赖：

```bash
npm install
```

---

## 环境要求

- **Node.js**: >= 14.0.0
- **MySQL**: >= 5.7
- **服务器**: NestJS 应用正在运行
- **网络**: 能够访问数据库和服务器

---

## 最佳实践

1. **测试前清理**: 始终在测试前清理旧数据
2. **独立环境**: 在测试环境而非生产环境执行
3. **监控资源**: 监控数据库连接数和服务器资源
4. **记录结果**: 保存测试结果用于性能对比
5. **定期测试**: 集成到 CI/CD 流程中定期执行

---

## 联系与支持

如有问题或建议，请：

1. 查看详细测试报告
2. 检查故障排查部分
3. 查看相关文档

---

**最后更新**: 2026-02-02
**版本**: 1.0
