# 管理后台后端 API 文档

## 概述

管理后台后端提供了完整的内容管理、用户管理和管理员认证功能。所有管理接口都需要管理员 JWT 认证。

## 目录结构

```
src/admin/
├── decorators/
│   └── current-admin.decorator.ts    # 获取当前管理员装饰器
├── dto/
│   ├── admin-login.dto.ts            # 管理员登录 DTO
│   ├── batch-delete.dto.ts           # 批量删除 DTO
│   ├── query-content.dto.ts          # 内容查询 DTO
│   ├── query-users.dto.ts            # 用户查询 DTO
│   ├── update-content-stats.dto.ts   # 更新内容统计 DTO
│   └── update-user.dto.ts            # 更新用户 DTO
├── entities/
│   └── admin.entity.ts               # 管理员实体
├── guards/
│   └── admin.guard.ts                # 管理员守卫
├── admin-auth.controller.ts          # 管理员认证控制器
├── admin-auth.service.ts             # 管理员认证服务
├── admin-content.controller.ts       # 内容管理控制器
├── admin-content.service.ts          # 内容管理服务
├── admin-user.controller.ts          # 用户管理控制器
├── admin-user.service.ts             # 用户管理服务
└── admin.module.ts                   # 管理员模块
```

## 数据库设置

### 1. 创建管理员表

运行迁移脚本创建 `admins` 表：

```bash
mysql -u root -p who_is_bot < migrations/003_create_admins_table.sql
```

### 2. 创建初始管理员账号

使用提供的脚本创建管理员账号：

```bash
# 创建超级管理员
node create-admin.js admin Admin123456 super

# 创建普通管理员
node create-admin.js editor Editor123 normal
```

## 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 管理员 JWT 配置
ADMIN_JWT_SECRET=your_admin_jwt_secret_here_change_in_production
ADMIN_JWT_EXPIRES_IN=24h
ADMIN_CORS_ORIGIN=http://localhost:5173
```

## API 接口

### 认证接口

#### 1. 管理员登录

```http
POST /admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123456"
}
```

**响应：**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "username": "admin",
    "role": "super",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. 获取当前管理员信息

```http
GET /admin/auth/me
Authorization: Bearer <token>
```

**响应：**

```json
{
  "id": "uuid",
  "username": "admin",
  "role": "super",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3. 登出

```http
POST /admin/auth/logout
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "message": "登出成功"
}
```

---

### 内容管理接口

#### 1. 获取内容列表

```http
GET /admin/content?page=1&limit=20&type=text&isAi=true&search=关键词&sortBy=createdAt&sortOrder=DESC
Authorization: Bearer <token>
```

**查询参数：**

- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20）
- `type`: 内容类型（text/image/video）
- `isAi`: 是否 AI 生成（true/false）
- `search`: 搜索关键词（标题或 ID）
- `sortBy`: 排序字段（createdAt/totalVotes）
- `sortOrder`: 排序方向（ASC/DESC）

**响应：**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "text",
      "title": "标题",
      "isAi": true,
      "modelTag": "GPT-4",
      "provider": "OpenAI",
      "totalVotes": 100,
      "correctVotes": 80,
      "accuracy": 80,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### 2. 获取内容详情

```http
GET /admin/content/:id
Authorization: Bearer <token>
```

**响应：**

```json
{
  "content": {
    "id": "uuid",
    "type": "text",
    "title": "标题",
    "text": "内容",
    "isAi": true,
    "modelTag": "GPT-4",
    "provider": "OpenAI",
    "deceptionRate": 50,
    "explanation": "解释说明",
    "totalVotes": 100,
    "aiVotes": 60,
    "humanVotes": 40,
    "correctVotes": 80,
    "accuracy": 80,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "comments": [...]
}
```

#### 3. 创建内容

```http
POST /admin/content
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "uuid",
  "type": "text",
  "title": "标题",
  "text": "内容",
  "isAi": true,
  "modelTag": "GPT-4",
  "provider": "OpenAI",
  "deceptionRate": 50,
  "explanation": "解释说明"
}
```

#### 4. 更新内容

```http
PUT /admin/content/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "explanation": "新的解释说明"
}
```

#### 5. 删除内容

```http
DELETE /admin/content/:id
Authorization: Bearer <token>
```

#### 6. 批量删除内容

```http
POST /admin/content/batch-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### 7. 手动调整内容统计数据

```http
PATCH /admin/content/:id/stats
Authorization: Bearer <token>
Content-Type: application/json

{
  "totalVotes": 100,
  "aiVotes": 60,
  "humanVotes": 40,
  "correctVotes": 80
}
```

**验证规则：**

- `totalVotes = aiVotes + humanVotes`
- `correctVotes ≤ totalVotes`

---

### 用户管理接口

#### 1. 获取用户列表

```http
GET /admin/users?page=1&limit=20&level=1&search=关键词&sortBy=createdAt&sortOrder=DESC
Authorization: Bearer <token>
```

**查询参数：**

- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20）
- `level`: 用户等级
- `search`: 搜索关键词（昵称、UID、OpenID）
- `sortBy`: 排序字段（createdAt/totalJudged/accuracy）
- `sortOrder`: 排序方向（ASC/DESC）

**响应：**

```json
{
  "data": [
    {
      "id": "uuid",
      "nickname": "用户昵称",
      "uid": "UID123",
      "avatar": "头像URL",
      "level": 1,
      "accuracy": 85.5,
      "totalJudged": 100,
      "correctCount": 85,
      "streak": 5,
      "maxStreak": 10,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### 2. 获取用户详情

```http
GET /admin/users/:id
Authorization: Bearer <token>
```

**响应：**

```json
{
  "user": {
    "id": "uuid",
    "nickname": "用户昵称",
    "uid": "UID123",
    "openid": "openid",
    "avatar": "头像URL",
    "level": 1,
    "accuracy": 85.5,
    "totalJudged": 100,
    "correctCount": 85,
    "streak": 5,
    "maxStreak": 10,
    "totalBotsBusted": 50,
    "weeklyAccuracy": 90,
    "weeklyJudged": 20,
    "weeklyCorrect": 18,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "achievements": [...],
  "recentJudgments": [...],
  "recentComments": [...]
}
```

#### 3. 更新用户

```http
PUT /admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新昵称",
  "level": 2,
  "totalJudged": 150,
  "correctCount": 120,
  "accuracy": 80
}
```

#### 4. 创建用户

```http
POST /admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新用户",
  "uid": "UID456",
  "avatar": "头像URL",
  "level": 1
}
```

#### 5. 重新计算用户统计

从判定记录重新计算用户的所有统计数据：

```http
POST /admin/users/:id/recalculate
Authorization: Bearer <token>
```

**响应：**

```json
{
  "id": "uuid",
  "nickname": "用户昵称",
  "totalJudged": 100,
  "correctCount": 85,
  "accuracy": 85,
  "streak": 5,
  "maxStreak": 10,
  "totalBotsBusted": 50
}
```

---

## 权限说明

### 管理员角色

- **super（超级管理员）**：拥有所有权限
- **normal（普通管理员）**：拥有内容管理、用户管理、评论管理权限

### 权限控制

所有 `/admin/*` 接口都需要通过 `AdminGuard` 验证：

1. 请求头必须包含有效的 JWT Token
2. Token 必须使用 `ADMIN_JWT_SECRET` 签名
3. Token 中的管理员必须存在于数据库中

## 安全建议

1. **强密码策略**：管理员密码至少 6 位，建议使用复杂密码
2. **独立 JWT Secret**：`ADMIN_JWT_SECRET` 应与 `JWT_SECRET` 不同
3. **短过期时间**：建议设置 24 小时或更短的 Token 过期时间
4. **HTTPS**：生产环境必须使用 HTTPS
5. **CORS 限制**：`ADMIN_CORS_ORIGIN` 应设置为管理后台的实际域名
6. **日志审计**：记录所有管理操作（待实现）
7. **IP 白名单**：生产环境建议限制管理后台访问 IP（待实现）

## 错误处理

所有接口遵循统一的错误响应格式：

```json
{
  "statusCode": 401,
  "message": "无效的认证令牌",
  "error": "Unauthorized"
}
```

常见错误码：

- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 无权限访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 开发指南

### 添加新的管理接口

1. 在对应的 service 中添加业务逻辑
2. 在对应的 controller 中添加路由
3. 使用 `@UseGuards(AdminGuard)` 保护接口
4. 使用 `@CurrentAdmin()` 装饰器获取当前管理员信息

示例：

```typescript
@Controller('admin/example')
@UseGuards(AdminGuard)
export class AdminExampleController {
  @Get()
  async findAll(@CurrentAdmin() admin: AdminUser) {
    // admin.id, admin.username, admin.role
    return this.service.findAll();
  }
}
```

## 测试

### 使用 curl 测试

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST http://localhost:80/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123456"}' \
  | jq -r '.token')

# 2. 使用 token 访问受保护接口
curl http://localhost:80/admin/content \
  -H "Authorization: Bearer $TOKEN"
```

### 使用 Postman 测试

1. 创建环境变量 `admin_token`
2. 在登录接口的 Tests 中添加：
   ```javascript
   pm.environment.set("admin_token", pm.response.json().token);
   ```
3. 在其他接口的 Authorization 中使用 `Bearer {{admin_token}}`

## 待实现功能

- [ ] 评论管理接口
- [ ] 仪表盘统计接口
- [ ] 文件上传接口
- [ ] 成就管理接口
- [ ] 管理员管理接口（创建、删除、修改管理员）
- [ ] 操作日志记录
- [ ] IP 白名单限制
- [ ] 批量操作优化
