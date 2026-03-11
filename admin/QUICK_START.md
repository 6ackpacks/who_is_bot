# 管理后台后端 - 快速开始指南

## 前置条件

- Node.js 16+
- MySQL 5.7+
- 已有的"谁是人机"数据库

## 安装步骤

### 1. 运行数据库迁移

创建 `admins` 表：

```bash
cd services
mysql -u root -p who_is_bot < migrations/003_create_admins_table.sql
```

### 2. 配置环境变量

编辑 `services/.env` 文件，添加以下配置：

```bash
# 管理员 JWT 配置
ADMIN_JWT_SECRET=your_strong_admin_jwt_secret_here_change_this
ADMIN_JWT_EXPIRES_IN=24h
ADMIN_CORS_ORIGIN=http://localhost:5173
```

**重要：** 生产环境必须修改 `ADMIN_JWT_SECRET` 为强密码！

### 3. 创建初始管理员账号

```bash
cd services
node create-admin.js admin YourStrongPassword123 super
```

输出示例：
```
Hashing password...
✓ Admin user created successfully!

Admin Details:
  ID: 550e8400-e29b-41d4-a716-446655440000
  Username: admin
  Role: super

You can now login with these credentials.
```

### 4. 启动服务

```bash
cd services
npm run start:dev
```

服务将在 `http://localhost:80` 启动。

## 测试 API

### 1. 登录获取 Token

```bash
curl -X POST http://localhost:80/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourStrongPassword123"
  }'
```

响应：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "role": "super",
    "createdAt": "2024-03-09T07:40:00.000Z",
    "lastLoginAt": "2024-03-09T07:40:00.000Z"
  }
}
```

### 2. 使用 Token 访问受保护接口

```bash
# 保存 token
TOKEN="your_token_here"

# 获取内容列表
curl http://localhost:80/admin/content \
  -H "Authorization: Bearer $TOKEN"

# 获取用户列表
curl http://localhost:80/admin/users \
  -H "Authorization: Bearer $TOKEN"

# 获取当前管理员信息
curl http://localhost:80/admin/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## API 接口概览

### 认证接口
- `POST /admin/auth/login` - 登录
- `GET /admin/auth/me` - 获取当前管理员
- `POST /admin/auth/logout` - 登出

### 内容管理
- `GET /admin/content` - 内容列表
- `GET /admin/content/:id` - 内容详情
- `POST /admin/content` - 创建内容
- `PUT /admin/content/:id` - 更新内容
- `DELETE /admin/content/:id` - 删除内容
- `POST /admin/content/batch-delete` - 批量删除
- `PATCH /admin/content/:id/stats` - 调整统计

### 用户管理
- `GET /admin/users` - 用户列表
- `GET /admin/users/:id` - 用户详情
- `POST /admin/users` - 创建用户
- `PUT /admin/users/:id` - 更新用户
- `POST /admin/users/:id/recalculate` - 重算统计

## 常见问题

### Q: 登录失败，提示"用户名或密码错误"
A: 检查：
1. 管理员账号是否已创建
2. 密码是否正确
3. 数据库连接是否正常

### Q: Token 验证失败
A: 检查：
1. Token 是否正确复制（包含完整的 JWT）
2. Token 是否过期（默认 24 小时）
3. `ADMIN_JWT_SECRET` 配置是否正确

### Q: 无法访问管理接口
A: 检查：
1. 请求头是否包含 `Authorization: Bearer <token>`
2. Token 格式是否正确
3. 管理员账号是否存在

### Q: CORS 错误
A: 检查：
1. `ADMIN_CORS_ORIGIN` 是否配置正确
2. 前端请求地址是否在允许列表中

## 安全建议

1. **强密码**：管理员密码至少 12 位，包含大小写字母、数字和特殊字符
2. **独立 Secret**：`ADMIN_JWT_SECRET` 必须与 `JWT_SECRET` 不同
3. **短过期时间**：生产环境建议设置 8-12 小时
4. **HTTPS**：生产环境必须使用 HTTPS
5. **IP 限制**：生产环境建议限制管理后台访问 IP
6. **定期更换**：定期更换管理员密码和 JWT Secret

## 下一步

1. 阅读完整 API 文档：`services/src/admin/README.md`
2. 开发前端管理界面
3. 配置生产环境部署
4. 实现操作日志记录

## 技术支持

如有问题，请查看：
- 完整文档：`admin/BACKEND_PART1_SUMMARY.md`
- API 文档：`services/src/admin/README.md`
- 设计规范：`admin/ADMIN_DESIGN_SPEC.md`
