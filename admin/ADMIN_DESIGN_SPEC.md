# 谁是人机 - 管理后台设计规范

## 项目概述

本文档定义了"谁是人机"项目管理后台的完整设计规范和实现计划。管理后台是一个内部使用的 Web 应用，用于管理小程序的内容、用户、评论等数据。

### 技术栈选型

**前端：**
- React 18 + TypeScript
- Vite（构建工具）
- Ant Design 5.x（UI 组件库）
- React Router 6（路由）
- Axios（HTTP 客户端）
- TailwindCSS（样式框架）
- Zustand（状态管理）

**后端：**
- 复用现有 NestJS 后端（`services/`）
- 新增管理员认证模块
- 新增文件上传模块
- 新增管理后台专用 API

**部署：**
- 前端：静态文件部署
- 后端：云托管（Docker）

---

## 设计系统

### 颜色规范

保持与小程序一致的 Claude-Inspired Design System：

```css
/* 主色调 */
--bg-primary: #F9F8F6;        /* 主背景 - 米白色 */
--bg-secondary: #F0EEE6;      /* 次背景 - 浅米色 */
--accent-clay: #D97757;       /* 强调色 - 陶土橙 */
--text-main: #1D1C16;         /* 主文本 - 深灰黑 */
--text-muted: #66655F;        /* 次要文本 - 灰色 */
--bg-dark: #111111;           /* 深色背景 */
--surface-white: #FFFFFF;     /* 白色表面 */
--border-subtle: #E8E6DC;     /* 边框 - 浅灰 */

/* 功能色 */
--success: #52c41a;
--warning: #faad14;
--error: #ff4d4f;
--info: #1890ff;
```

### 字体系统

```css
--font-display: 'Poppins', 'PingFang SC', -apple-system, sans-serif;
--font-body: 'Lora', 'Noto Serif SC', Georgia, serif;
--font-mono: 'Fira Code', 'Consolas', monospace;
```

### 圆角规范

```css
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-pill: 999px;
```

### 阴影系统

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

## 功能模块设计

### 1. 认证模块

#### 1.1 登录页面
- 管理员账号密码登录
- JWT Token 认证
- 记住登录状态（LocalStorage）
- 登录失败提示

#### 1.2 权限管理
- 管理员角色：超级管理员、普通管理员
- 超级管理员：所有权限
- 普通管理员：内容管理、评论审核

---

### 2. 仪表盘（Dashboard）

#### 2.1 数据概览
- 总用户数
- 总内容数
- 总判定次数
- 今日活跃用户
- 今日新增内容
- 今日判定次数

#### 2.2 数据图表
- 用户增长趋势（折线图）
- 内容类型分布（饼图）
- 判定准确率趋势（折线图）
- 热门内容排行（表格）

#### 2.3 快捷操作
- 快速创建内容
- 查看待审核评论
- 查看异常数据

---

### 3. 内容管理模块

#### 3.1 内容列表
**功能：**
- 分页展示所有内容
- 筛选：类型（文本/图片/视频）、来源（AI/人类）、创建时间
- 搜索：标题、ID
- 排序：创建时间、投票数、正确率
- 批量操作：删除、导出

**列表字段：**
- ID
- 类型（图标）
- 标题
- 来源（AI/人类）
- 模型标签
- 总投票数
- 正确率
- 创建时间
- 操作（查看/编辑/删除）

#### 3.2 创建内容
**表单字段：**
- 内容类型：文本/图片/视频（单选）
- 标题（必填，1-100字符）
- 内容：
  - 文本：富文本编辑器
  - 图片：上传图片（支持拖拽）
  - 视频：上传视频（支持拖拽）
- 来源：AI/人类（单选）
- 模型标签（必填，如 GPT-4、Claude、Human）
- 提供者（必填，如 OpenAI、Anthropic、User）
- 欺骗率（0-100，默认 50）
- 解释说明（必填，富文本编辑器）

**验证规则：**
- 标题不能为空
- 文本内容不能为空（type=text）
- 图片/视频 URL 不能为空（type=image/video）
- 欺骗率必须在 0-100 之间

#### 3.3 编辑内容
- 复用创建表单
- 预填充现有数据
- 支持修改所有字段

#### 3.4 内容详情
**展示信息：**
- 基本信息（标题、类型、来源、模型标签）
- 内容预览（文本/图片/视频）
- 统计数据：
  - 总投票数
  - AI 投票数
  - 人类投票数
  - 正确投票数
  - 正确率
- 解释说明
- 创建时间、更新时间
- 关联评论列表

#### 3.5 手动调整统计数据
**可调整字段：**
- 总投票数
- AI 投票数
- 人类投票数
- 正确投票数
- 欺骗率

**验证规则：**
- 总投票数 = AI 投票数 + 人类投票数
- 正确投票数 ≤ 总投票数

---

### 4. 用户管理模块

#### 4.1 用户列表
**功能：**
- 分页展示所有用户
- 筛选：等级、注册时间
- 搜索：昵称、UID、OpenID
- 排序：注册时间、判定次数、准确率
- 批量操作：导出

**列表字段：**
- 头像
- 昵称
- UID
- 等级
- 总判定次数
- 准确率
- 连胜次数
- 注册时间
- 操作（查看/编辑）

#### 4.2 用户详情
**展示信息：**
- 基本信息：
  - 头像
  - 昵称
  - UID
  - OpenID
  - 等级
- 统计数据：
  - 总判定次数
  - 正确次数
  - 准确率
  - 当前连胜
  - 最大连胜
  - 识破 AI 次数
- 周统计数据：
  - 周判定次数
  - 周正确次数
  - 周准确率
- 成就列表
- 判定历史（最近 20 条）
- 评论历史（最近 20 条）

#### 4.3 编辑用户
**可编辑字段：**
- 昵称
- 头像（上传）
- 等级
- 总判定次数
- 正确次数
- 准确率
- 连胜次数
- 最大连胜
- 识破 AI 次数

**注意：**
- 修改统计数据会影响排行榜
- 提供"重新计算统计"按钮（从判定记录重新计算）

#### 4.4 手动添加用户
**表单字段：**
- 昵称（必填）
- 头像（上传，可选）
- UID（自动生成或手动输入）
- 等级（默认 1）
- 初始统计数据（可选）

---

### 5. 评论管理模块

#### 5.1 评论列表
**功能：**
- 分页展示所有评论
- 筛选：内容 ID、用户 ID、创建时间
- 搜索：评论内容
- 排序：创建时间、点赞数
- 批量操作：删除

**列表字段：**
- 用户昵称/游客 ID
- 评论内容（截断显示）
- 关联内容标题
- 点赞数
- 回复数
- 创建时间
- 操作（查看/删除）

#### 5.2 评论详情
**展示信息：**
- 用户信息（昵称、头像）
- 评论内容（完整）
- 关联内容（标题、链接）
- 父评论（如果是回复）
- 子回复列表
- 点赞数
- 创建时间、更新时间

#### 5.3 删除评论
- 单个删除
- 批量删除
- 删除确认弹窗
- 级联删除子回复（可选）

#### 5.4 评论审核（扩展功能）
- 待审核评论列表
- 审核通过/拒绝
- 敏感词过滤
- 举报管理

---

### 6. 排行榜管理模块

#### 6.1 排行榜查看
**展示信息：**
- 总排行榜（按总判定次数和准确率）
- 周排行榜（按周判定次数和周准确率）
- 前 50 名用户
- 用户排名、昵称、头像、统计数据

#### 6.2 手动调整排名
**功能：**
- 修改用户统计数据（影响排名）
- 手动添加虚拟用户到排行榜
- 隐藏/显示特定用户

#### 6.3 虚拟用户管理
**功能：**
- 创建虚拟用户（用于展示）
- 设置虚拟用户的统计数据
- 虚拟用户标记（后台可见）

---

### 7. 资源上传模块

#### 7.1 文件上传
**支持类型：**
- 图片：JPG、PNG、GIF、WebP（最大 5MB）
- 视频：MP4、MOV（最大 100MB）

**上传方式：**
- 拖拽上传
- 点击选择文件
- 粘贴上传（图片）

**上传流程：**
1. 前端选择文件
2. 前端请求上传签名（`POST /admin/upload/signature`）
3. 前端直接上传到阿里云 OSS
4. 上传成功后返回文件 URL
5. 前端将 URL 保存到表单

#### 7.2 资源库
**功能：**
- 展示所有已上传的资源
- 筛选：类型（图片/视频）、上传时间
- 搜索：文件名
- 预览：图片预览、视频播放
- 操作：复制 URL、删除

**列表字段：**
- 缩略图
- 文件名
- 类型
- 大小
- 上传时间
- 引用次数
- 操作（预览/复制 URL/删除）

---

### 8. 成就管理模块（扩展功能）

#### 8.1 成就列表
**展示信息：**
- 成就名称
- 描述
- 图标
- 类型（判定次数/准确率/连胜/特殊）
- 要求值
- 积分
- 解锁人数

#### 8.2 创建成就
**表单字段：**
- 成就名称（必填）
- 描述（必填）
- 图标（上传或选择）
- 类型（单选）
- 要求值（数字）
- 积分（数字）

#### 8.3 编辑成就
- 复用创建表单
- 预填充现有数据

---

### 9. 系统设置模块（扩展功能）

#### 9.1 基本设置
- 网站标题
- 网站描述
- 联系邮箱

#### 9.2 微信小程序设置
- AppID
- AppSecret
- 服务器域名

#### 9.3 数据库设置
- 数据库连接信息（只读）
- 连接池状态

#### 9.4 管理员管理
- 管理员列表
- 添加管理员
- 修改管理员权限
- 删除管理员

---

## 页面路由设计

```
/login                          # 登录页
/                               # 仪表盘
/content                        # 内容列表
/content/create                 # 创建内容
/content/:id                    # 内容详情
/content/:id/edit               # 编辑内容
/users                          # 用户列表
/users/:id                      # 用户详情
/users/:id/edit                 # 编辑用户
/comments                       # 评论列表
/comments/:id                   # 评论详情
/leaderboard                    # 排行榜
/upload                         # 资源上传
/achievements                   # 成就管理
/achievements/create            # 创建成就
/achievements/:id/edit          # 编辑成就
/settings                       # 系统设置
/settings/admins                # 管理员管理
```

---

## 后端 API 设计

### 1. 管理员认证

```typescript
POST /admin/auth/login
Request: { username: string, password: string }
Response: { token: string, admin: AdminInfo }

GET /admin/auth/me
Headers: { Authorization: Bearer <token> }
Response: { admin: AdminInfo }

POST /admin/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### 2. 仪表盘

```typescript
GET /admin/dashboard/stats
Response: {
  totalUsers: number,
  totalContent: number,
  totalJudgments: number,
  todayActiveUsers: number,
  todayNewContent: number,
  todayJudgments: number
}

GET /admin/dashboard/charts
Response: {
  userGrowth: Array<{ date: string, count: number }>,
  contentTypeDistribution: Array<{ type: string, count: number }>,
  accuracyTrend: Array<{ date: string, accuracy: number }>,
  hotContent: Array<ContentInfo>
}
```

### 3. 内容管理

```typescript
GET /admin/content?page=1&limit=20&type=&isAi=&search=
Response: { data: ContentInfo[], total: number, page: number, limit: number }

GET /admin/content/:id
Response: { content: ContentInfo, comments: CommentInfo[] }

POST /admin/content
Request: CreateContentDto
Response: { content: ContentInfo }

PUT /admin/content/:id
Request: UpdateContentDto
Response: { content: ContentInfo }

DELETE /admin/content/:id
Response: { success: true }

POST /admin/content/batch-delete
Request: { ids: string[] }
Response: { success: true, deletedCount: number }

PATCH /admin/content/:id/stats
Request: { totalVotes: number, aiVotes: number, humanVotes: number, correctVotes: number }
Response: { content: ContentInfo }
```

### 4. 用户管理

```typescript
GET /admin/users?page=1&limit=20&level=&search=
Response: { data: UserInfo[], total: number, page: number, limit: number }

GET /admin/users/:id
Response: { user: UserInfo, achievements: AchievementInfo[], recentJudgments: JudgmentInfo[], recentComments: CommentInfo[] }

PUT /admin/users/:id
Request: UpdateUserDto
Response: { user: UserInfo }

POST /admin/users
Request: CreateUserDto
Response: { user: UserInfo }

POST /admin/users/:id/recalculate
Response: { user: UserInfo }
```

### 5. 评论管理

```typescript
GET /admin/comments?page=1&limit=20&contentId=&userId=&search=
Response: { data: CommentInfo[], total: number, page: number, limit: number }

GET /admin/comments/:id
Response: { comment: CommentInfo, replies: CommentInfo[] }

DELETE /admin/comments/:id?cascade=true
Response: { success: true }

POST /admin/comments/batch-delete
Request: { ids: string[] }
Response: { success: true, deletedCount: number }
```

### 6. 文件上传

```typescript
POST /admin/upload/signature
Request: { filename: string, contentType: string }
Response: { url: string, key: string, policy: string, signature: string, accessKeyId: string }

POST /admin/upload/file
Content-Type: multipart/form-data
Request: FormData with file
Response: { url: string, key: string, size: number, contentType: string }

GET /admin/upload/files?page=1&limit=20&type=
Response: { data: FileInfo[], total: number, page: number, limit: number }

DELETE /admin/upload/files/:key
Response: { success: true }
```

### 7. 成就管理

```typescript
GET /admin/achievements
Response: { achievements: AchievementInfo[] }

POST /admin/achievements
Request: CreateAchievementDto
Response: { achievement: AchievementInfo }

PUT /admin/achievements/:id
Request: UpdateAchievementDto
Response: { achievement: AchievementInfo }

DELETE /admin/achievements/:id
Response: { success: true }
```

---

## 数据模型

### AdminInfo
```typescript
{
  id: string,
  username: string,
  role: 'super' | 'normal',
  createdAt: string,
  lastLoginAt: string
}
```

### ContentInfo
```typescript
{
  id: string,
  type: 'text' | 'image' | 'video',
  url?: string,
  text?: string,
  title: string,
  isAi: boolean,
  modelTag: string,
  provider: string,
  deceptionRate: number,
  explanation: string,
  totalVotes: number,
  aiVotes: number,
  humanVotes: number,
  correctVotes: number,
  accuracy: number,  // 计算字段：correctVotes / totalVotes
  createdAt: string,
  updatedAt: string
}
```

### UserInfo
```typescript
{
  id: string,
  nickname: string,
  uid: string,
  openid?: string,
  avatar?: string,
  level: number,
  accuracy: number,
  totalJudged: number,
  correctCount: number,
  streak: number,
  maxStreak: number,
  totalBotsBusted: number,
  weeklyAccuracy: number,
  weeklyJudged: number,
  weeklyCorrect: number,
  createdAt: string,
  updatedAt: string
}
```

### CommentInfo
```typescript
{
  id: string,
  contentId: string,
  userId?: string,
  guestId?: string,
  content: string,
  likes: number,
  parentId?: string,
  createdAt: string,
  updatedAt: string,
  user?: { nickname: string, avatar?: string },
  contentTitle?: string,
  replyCount?: number
}
```

### FileInfo
```typescript
{
  key: string,
  url: string,
  filename: string,
  contentType: string,
  size: number,
  uploadedAt: string,
  referenceCount: number
}
```

---

## 开发计划

### 阶段 1：基础架构（后端）
1. 创建管理员表和认证模块
2. 实现 JWT 认证中间件
3. 创建管理员守卫（AdminGuard）
4. 实现基础 CRUD API

### 阶段 2：基础架构（前端）
1. 初始化 React + Vite 项目
2. 配置 Ant Design 和 TailwindCSS
3. 实现路由和布局组件
4. 实现登录页面和认证逻辑

### 阶段 3：核心功能
1. 仪表盘页面
2. 内容管理（列表、创建、编辑、详情）
3. 用户管理（列表、详情、编辑）
4. 评论管理（列表、详情、删除）

### 阶段 4：文件上传
1. 后端：阿里云 OSS 集成
2. 后端：上传签名 API
3. 前端：上传组件
4. 前端：资源库页面

### 阶段 5：扩展功能
1. 排行榜管理
2. 成就管理
3. 系统设置
4. 管理员管理

### 阶段 6：优化和部署
1. 性能优化
2. 错误处理
3. 日志记录
4. 部署配置

---

## 技术要点

### 1. 认证流程
- 管理员登录后获取 JWT Token
- Token 存储在 LocalStorage
- 每次请求在 Header 中携带 Token
- Token 过期后自动跳转登录页

### 2. 文件上传
- 使用阿里云 OSS 直传
- 前端获取签名后直接上传到 OSS
- 支持大文件分片上传
- 上传进度显示

### 3. 数据验证
- 前端：Ant Design Form 验证
- 后端：class-validator 验证
- 双重验证确保数据安全

### 4. 错误处理
- 统一错误处理中间件
- 友好的错误提示
- 错误日志记录

### 5. 性能优化
- 列表分页加载
- 图片懒加载
- 虚拟滚动（长列表）
- 请求防抖和节流

---

## 安全考虑

1. **认证授权：** JWT Token + 管理员守卫
2. **CSRF 防护：** Token 验证
3. **XSS 防护：** 输入过滤和转义
4. **SQL 注入防护：** TypeORM 参数化查询
5. **文件上传安全：** 文件类型验证、大小限制
6. **CORS 配置：** 白名单限制
7. **日志审计：** 记录所有管理操作

---

## 部署方案

### 前端部署
1. 构建生产版本：`npm run build`
2. 部署到静态文件服务器（Nginx、CDN）
3. 配置 HTTPS
4. 配置 Gzip 压缩

### 后端部署
1. 构建 Docker 镜像
2. 部署到云托管
3. 配置环境变量
4. 配置数据库连接
5. 配置阿里云 OSS

---

## 附录

### A. 环境变量

**后端 (.env):**
```bash
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=who_is_bot

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 管理员 JWT
ADMIN_JWT_SECRET=your_admin_jwt_secret
ADMIN_JWT_EXPIRES_IN=24h

# 阿里云 OSS
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name

# 应用
PORT=80
NODE_ENV=production
ADMIN_CORS_ORIGIN=https://admin.example.com
```

**前端 (.env):**
```bash
VITE_API_BASE_URL=https://api.example.com
VITE_ADMIN_API_BASE_URL=https://api.example.com/admin
```

### B. 依赖包

**后端新增依赖:**
```json
{
  "ali-oss": "^6.18.0",
  "multer": "^1.4.5-lts.1",
  "@nestjs/platform-express": "^10.0.0"
}
```

**前端依赖:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "antd": "^5.12.0",
  "axios": "^1.6.0",
  "zustand": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "recharts": "^2.10.0",
  "dayjs": "^1.11.0",
  "@ant-design/icons": "^5.2.0"
}
```

---

## 总结

本管理后台设计遵循以下原则：

1. **简洁实用：** 内部使用，注重功能而非复杂设计
2. **风格一致：** 与小程序保持一致的设计语言
3. **易于维护：** 清晰的代码结构和文档
4. **安全可靠：** 完善的认证授权和数据验证
5. **性能优化：** 分页加载、懒加载等优化手段

通过本规范，开发团队可以快速构建一个功能完善、易于使用的管理后台系统。
