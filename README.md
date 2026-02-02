# 谁是人机 (Who is the Bot)

一个基于微信小程序的 AI 内容识别游戏，帮助用户提升识别 AI 生成内容的能力。

## 项目简介

本项目包含：
- **微信小程序前端**：使用原生微信小程序开发
- **NestJS 后端 API**：提供 RESTful API 服务
- **MySQL 数据库**：存储用户数据、内容和判定记录

## 技术栈

### 前端
- 微信小程序原生框架
- WeUI 组件库
- 微信云托管支持

### 后端
- NestJS (Node.js 框架)
- TypeORM (ORM 框架)
- MySQL 数据库
- TypeScript

## 项目结构

```
who-is-the-bot/
├── pages/              # 微信小程序页面
│   ├── login/         # 登录页
│   ├── feed/          # 内容流页面
│   ├── leaderboard/   # 排行榜页面
│   ├── profile/       # 个人中心页面
│   └── history/       # 历史记录页面
├── components/        # 自定义组件
├── utils/            # 工具函数
│   ├── api.js        # API 请求封装
│   └── auth.js       # 认证工具
├── services/         # 后端服务
│   ├── src/
│   │   ├── auth/     # 认证模块
│   │   ├── user/     # 用户模块
│   │   ├── content/  # 内容模块
│   │   ├── judgment/ # 判定模块
│   │   ├── comment/  # 评论模块
│   │   └── achievement/ # 成就模块
│   └── .env          # 环境变量配置
├── app.json          # 小程序配置
└── project.config.json # 项目配置
```

## 环境要求

### 开发环境
- Node.js >= 16.x
- MySQL >= 5.7 或 MySQL 8.x
- 微信开发者工具
- npm 或 yarn

### 生产环境
- 微信云托管（推荐）
- 或自建服务器 + MySQL 数据库

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd who-is-the-bot
```

### 2. 后端设置

#### 2.1 安装依赖

```bash
cd services
npm install
```

#### 2.2 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=who_is_bot

# 应用配置
PORT=3000
NODE_ENV=development

# 数据库连接池配置（可选）
DB_CONNECTION_LIMIT=10
DB_RETRY_ATTEMPTS=3
DB_RETRY_DELAY=3000
DB_CONNECT_TIMEOUT=10000

# SSL 配置（生产环境推荐）
DB_SSL_ENABLED=false
DB_SSL_REJECT_UNAUTHORIZED=true

# 日志配置
DB_LOGGING=false
```

#### 2.3 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE who_is_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出
exit
```

#### 2.4 运行数据库迁移

```bash
# 如果有迁移文件
npm run migration:run

# 或者使用 TypeORM 同步（仅开发环境）
# 注意：生产环境请使用迁移而不是同步
```

#### 2.5 启动后端服务

```bash
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

后端服务将在 `http://localhost:3000` 启动。

### 3. 前端设置

#### 3.1 配置 API 地址

编辑 `utils/api.js` 文件，配置 API 地址：

```javascript
const ENV_CONFIG = {
  // 开发环境：使用本地服务器
  USE_LOCAL_API: true,
  LOCAL_API_URL: 'http://YOUR_LOCAL_IP:3000',  // 替换为你的本地 IP

  // 生产环境：使用微信云托管
  // USE_LOCAL_API: false,
  CLOUD_ENV: 'your-cloud-env-id',
  CLOUD_SERVICE: 'your-service-name',

  // 其他配置
  USE_MOCK: false,
  TIMEOUT: 30000
};
```

**重要提示**：
- 开发时设置 `USE_LOCAL_API: true`，并将 `LOCAL_API_URL` 改为你的本地 IP 地址（不能使用 localhost）
- 生产时设置 `USE_LOCAL_API: false`，使用微信云托管

#### 3.2 配置小程序 AppID

编辑 `project.config.json`，填入你的小程序 AppID：

```json
{
  "appid": "your-wechat-appid",
  ...
}
```

#### 3.3 导入项目到微信开发者工具

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目根目录
4. 填入 AppID
5. 点击"导入"

#### 3.4 启动小程序

在微信开发者工具中点击"编译"按钮即可预览。

## 开发指南

### 环境切换

#### 开发环境（本地调试）

1. 后端：启动本地服务器
   ```bash
   cd services
   npm run start:dev
   ```

2. 前端：配置使用本地 API
   ```javascript
   // utils/api.js
   const ENV_CONFIG = {
     USE_LOCAL_API: true,
     LOCAL_API_URL: 'http://192.168.1.100:3000',  // 你的本地 IP
   };
   ```

3. 微信开发者工具：
   - 打开"详情" -> "本地设置"
   - 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

#### 生产环境（云托管）

1. 部署后端到微信云托管
2. 配置使用云托管 API
   ```javascript
   // utils/api.js
   const ENV_CONFIG = {
     USE_LOCAL_API: false,
     CLOUD_ENV: 'prod-xxxxx',
     CLOUD_SERVICE: 'your-service-name',
   };
   ```

### 数据库配置说明

#### 基础配置
- `DB_HOST`: 数据库主机地址
- `DB_PORT`: 数据库端口（MySQL 默认 3306）
- `DB_USER`: 数据库用户名
- `DB_PASS`: 数据库密码
- `DB_NAME`: 数据库名称

#### 连接池配置
- `DB_CONNECTION_LIMIT`: 连接池最大连接数（默认 10）
- `DB_RETRY_ATTEMPTS`: 连接失败重试次数（默认 3）
- `DB_RETRY_DELAY`: 重试延迟时间（毫秒，默认 3000）
- `DB_CONNECT_TIMEOUT`: 连接超时时间（毫秒，默认 10000）

#### SSL 配置
- `DB_SSL_ENABLED`: 是否启用 SSL（生产环境推荐 true）
- `DB_SSL_REJECT_UNAUTHORIZED`: 是否验证 SSL 证书（默认 true）

#### 日志配置
- `DB_LOGGING`: 是否启用 SQL 查询日志（开发环境建议 true，生产环境建议 false）

### API 接口说明

#### 认证相关
- `POST /auth/mock-login` - 模拟登录
- `GET /auth/user` - 获取用户信息
- `POST /auth/wx-login` - 微信登录

#### 内容相关
- `GET /content/feed` - 获取内容列表
- `GET /content/:id` - 获取内容详情

#### 判定相关
- `POST /judgment/submit` - 提交判定结果
- `GET /judgment/user/:userId` - 获取用户判定历史

#### 排行榜
- `GET /leaderboard` - 获取排行榜

#### 评论相关
- `GET /comments` - 获取评论列表
- `POST /comments` - 创建评论
- `POST /comments/:id/like` - 点赞评论
- `DELETE /comments/:id` - 删除评论

### 数据库事务处理

项目在关键操作中使用了数据库事务来确保数据一致性：

```typescript
// 示例：提交判定时使用事务
async submitJudgment(dto: SubmitJudgmentDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. 检查是否已判定
    // 2. 创建判定记录
    // 3. 更新内容统计
    // 4. 更新用户统计

    await queryRunner.commitTransaction();
    return { success: true };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

## 部署指南

### 微信云托管部署

1. 在微信公众平台开通云托管服务
2. 创建服务并配置环境变量
3. 上传代码并部署

详细步骤请参考：[微信云托管文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/)

### 自建服务器部署

1. 准备服务器（推荐 Ubuntu 20.04+）
2. 安装 Node.js 和 MySQL
3. 克隆代码并安装依赖
4. 配置环境变量
5. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd services
pm2 start dist/main.js --name who-is-bot-api

# 设置开机自启
pm2 startup
pm2 save
```

## 常见问题

### 1. 小程序无法连接本地服务器

**解决方案**：
- 确保手机和电脑在同一局域网
- 使用电脑的局域网 IP 地址（不能用 localhost 或 127.0.0.1）
- 在微信开发者工具中关闭域名校验

### 2. 数据库连接失败

**解决方案**：
- 检查 `.env` 文件配置是否正确
- 确认 MySQL 服务已启动
- 检查数据库用户权限
- 查看防火墙设置

### 3. 云托管部署失败

**解决方案**：
- 检查环境变量配置
- 查看云托管日志
- 确认数据库连接信息正确
- 检查服务端口配置

### 4. 事务处理失败

**解决方案**：
- 检查数据库引擎是否支持事务（InnoDB）
- 查看错误日志定位问题
- 确保数据库连接稳定

## 性能优化建议

### 数据库优化
1. 为常用查询字段添加索引
2. 使用连接池管理数据库连接
3. 生产环境启用 SSL 连接
4. 关闭开发环境的查询日志

### API 优化
1. 实现请求缓存机制
2. 使用 CDN 加速静态资源
3. 启用 GZIP 压缩
4. 实现接口限流

### 小程序优化
1. 图片使用 WebP 格式
2. 实现分页加载
3. 使用小程序缓存
4. 减少不必要的请求

## 安全建议

1. **环境变量**：不要将 `.env` 文件提交到版本控制
2. **数据库密码**：使用强密码，定期更换
3. **JWT 密钥**：生产环境使用复杂的密钥
4. **SSL/TLS**：生产环境启用数据库 SSL 连接
5. **输入验证**：对所有用户输入进行验证和清理
6. **SQL 注入**：使用 ORM 参数化查询
7. **XSS 防护**：对输出内容进行转义

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。

---

**祝你开发愉快！**
