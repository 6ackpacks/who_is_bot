# 管理后台 API 文档

## 基础信息

- 基础 URL: `http://localhost:80/admin`
- 认证方式: JWT Token (Bearer)
- 请求格式: JSON
- 响应格式: JSON

## 认证接口

### 登录

```
POST /admin/auth/login
```

**请求体:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**响应:**
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

### 获取当前用户信息

```
GET /admin/auth/me
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "admin": {
    "id": "uuid",
    "username": "admin",
    "role": "super"
  }
}
```

### 登出

```
POST /admin/auth/logout
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true
}
```

## 仪表盘接口

### 获取统计数据

```
GET /admin/dashboard/stats
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "totalUsers": 1000,
  "totalContent": 500,
  "totalJudgments": 5000,
  "todayActiveUsers": 100,
  "todayNewContent": 10,
  "todayJudgments": 200
}
```

### 获取图表数据

```
GET /admin/dashboard/charts
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "userGrowth": [
    { "date": "2024-01-01", "count": 100 },
    { "date": "2024-01-02", "count": 120 }
  ],
  "contentTypeDistribution": [
    { "type": "text", "count": 200 },
    { "type": "image", "count": 150 },
    { "type": "video", "count": 150 }
  ],
  "accuracyTrend": [
    { "date": "2024-01-01", "accuracy": 75.5 },
    { "date": "2024-01-02", "accuracy": 76.2 }
  ],
  "hotContent": []
}
```

## 内容管理接口

### 获取内容列表

```
GET /admin/content?page=1&limit=20&type=text&isAi=true&search=keyword
Headers: Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20）
- `type`: 内容类型（text/image/video）
- `isAi`: 是否 AI 生成（true/false）
- `search`: 搜索关键词

**响应:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "text",
      "title": "标题",
      "text": "内容",
      "isAi": true,
      "modelTag": "GPT-4",
      "provider": "OpenAI",
      "deceptionRate": 50,
      "explanation": "解释",
      "totalVotes": 100,
      "aiVotes": 50,
      "humanVotes": 50,
      "correctVotes": 60,
      "accuracy": 0.6,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 获取内容详情

```
GET /admin/content/:id
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "content": { /* ContentInfo */ },
  "comments": [ /* CommentInfo[] */ ]
}
```

### 创建内容

```
POST /admin/content
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "type": "text",
  "title": "标题",
  "text": "内容",
  "isAi": true,
  "modelTag": "GPT-4",
  "provider": "OpenAI",
  "deceptionRate": 50,
  "explanation": "解释"
}
```

**响应:**
```json
{
  "content": { /* ContentInfo */ }
}
```

### 更新内容

```
PUT /admin/content/:id
Headers: Authorization: Bearer <token>
```

**请求体:** 同创建内容

**响应:**
```json
{
  "content": { /* ContentInfo */ }
}
```

### 删除内容

```
DELETE /admin/content/:id
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true
}
```

### 批量删除内容

```
POST /admin/content/batch-delete
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

**响应:**
```json
{
  "success": true,
  "deletedCount": 2
}
```

### 更新内容统计

```
PATCH /admin/content/:id/stats
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "totalVotes": 100,
  "aiVotes": 50,
  "humanVotes": 50,
  "correctVotes": 60
}
```

**响应:**
```json
{
  "content": { /* ContentInfo */ }
}
```

## 用户管理接口

### 获取用户列表

```
GET /admin/users?page=1&limit=20&level=1&search=keyword
Headers: Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `level`: 用户等级
- `search`: 搜索关键词（昵称/UID/OpenID）

**响应:**
```json
{
  "data": [ /* UserInfo[] */ ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 获取用户详情

```
GET /admin/users/:id
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "user": { /* UserInfo */ },
  "achievements": [],
  "recentJudgments": [],
  "recentComments": []
}
```

### 创建用户

```
POST /admin/users
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "nickname": "用户昵称",
  "avatar": "https://...",
  "level": 1
}
```

**响应:**
```json
{
  "user": { /* UserInfo */ }
}
```

### 更新用户

```
PUT /admin/users/:id
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "nickname": "新昵称",
  "level": 2,
  "totalJudged": 100,
  "correctCount": 80,
  "accuracy": 0.8
}
```

**响应:**
```json
{
  "user": { /* UserInfo */ }
}
```

### 重新计算用户统计

```
POST /admin/users/:id/recalculate
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "user": { /* UserInfo */ }
}
```

## 评论管理接口

### 获取评论列表

```
GET /admin/comments?page=1&limit=20&contentId=uuid&userId=uuid&search=keyword
Headers: Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `contentId`: 内容 ID
- `userId`: 用户 ID
- `search`: 搜索关键词

**响应:**
```json
{
  "data": [ /* CommentInfo[] */ ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 获取评论详情

```
GET /admin/comments/:id
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "comment": { /* CommentInfo */ },
  "replies": [ /* CommentInfo[] */ ]
}
```

### 删除评论

```
DELETE /admin/comments/:id?cascade=true
Headers: Authorization: Bearer <token>
```

**查询参数:**
- `cascade`: 是否级联删除回复（默认 false）

**响应:**
```json
{
  "success": true
}
```

### 批量删除评论

```
POST /admin/comments/batch-delete
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

**响应:**
```json
{
  "success": true,
  "deletedCount": 2
}
```

## 文件上传接口

### 获取上传签名

```
POST /admin/upload/signature
Headers: Authorization: Bearer <token>
```

**请求体:**
```json
{
  "filename": "image.jpg",
  "contentType": "image/jpeg"
}
```

**响应:**
```json
{
  "url": "https://oss.aliyuncs.com/...",
  "key": "uploads/xxx.jpg",
  "policy": "...",
  "signature": "...",
  "accessKeyId": "..."
}
```

### 上传文件

```
POST /admin/upload/file
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体:**
```
FormData with file
```

**响应:**
```json
{
  "url": "https://...",
  "key": "uploads/xxx.jpg",
  "size": 102400,
  "contentType": "image/jpeg"
}
```

### 获取文件列表

```
GET /admin/upload/files?page=1&limit=20&type=image
Headers: Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码
- `limit`: 每页数量
- `type`: 文件类型（image/video）

**响应:**
```json
{
  "data": [ /* FileInfo[] */ ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 删除文件

```
DELETE /admin/upload/files/:key
Headers: Authorization: Bearer <token>
```

**响应:**
```json
{
  "success": true
}
```

## 错误响应

所有接口在出错时返回统一格式：

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

常见状态码：
- `400`: 请求参数错误
- `401`: 未认证或 Token 过期
- `403`: 无权限访问
- `404`: 资源不存在
- `500`: 服务器内部错误
