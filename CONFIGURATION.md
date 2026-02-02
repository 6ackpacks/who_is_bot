# 配置指南 (Configuration Guide)

本文档详细说明了项目的各项配置选项和最佳实践。

## 目录

1. [API 配置](#api-配置)
2. [数据库配置](#数据库配置)
3. [环境切换](#环境切换)
4. [性能调优](#性能调优)
5. [安全配置](#安全配置)

---

## API 配置

### 文件位置
`utils/api.js`

### 配置项说明

```javascript
const ENV_CONFIG = {
  // 是否使用本地开发服务器
  USE_LOCAL_API: false,

  // 本地开发服务器地址
  LOCAL_API_URL: 'http://localhost:3000',

  // 微信云托管配置
  CLOUD_ENV: 'prod-3ge8ht6pded7ed77',
  CLOUD_SERVICE: 'who-is-the-bot-api2',

  // 是否使用 Mock 数据
  USE_MOCK: false,

  // 请求超时时间（毫秒）
  TIMEOUT: 30000
};
```

### 开发环境配置

```javascript
const ENV_CONFIG = {
  USE_LOCAL_API: true,
  LOCAL_API_URL: 'http://192.168.1.100:3000',  // 替换为你的本地 IP
  USE_MOCK: false,
  TIMEOUT: 30000
};
```

**注意事项**：
- 必须使用局域网 IP，不能使用 `localhost` 或 `127.0.0.1`
- 确保手机和电脑在同一局域网
- 在微信开发者工具中关闭域名校验

### 生产环境配置

```javascript
const ENV_CONFIG = {
  USE_LOCAL_API: false,
  CLOUD_ENV: 'your-cloud-env-id',
  CLOUD_SERVICE: 'your-service-name',
  USE_MOCK: false,
  TIMEOUT: 30000
};
```

### Mock 模式配置

用于前端开发，无需后端服务：

```javascript
const ENV_CONFIG = {
  USE_MOCK: true,
  // 其他配置不影响
};
```

---

## 数据库配置

### 文件位置
`services/.env`

### 基础配置

```env
# 数据库连接信息
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=who_is_bot
```

### 连接池配置

```env
# 连接池最大连接数
# 推荐值：
# - 小型应用：10
# - 中型应用：20-50
# - 大型应用：50-100
DB_CONNECTION_LIMIT=10

# 连接重试配置
DB_RETRY_ATTEMPTS=3
DB_RETRY_DELAY=3000
DB_CONNECT_TIMEOUT=10000
```

**连接池大小计算公式**：
```
连接数 = ((核心数 * 2) + 有效磁盘数)
```

例如：4 核 CPU + 1 个磁盘 = (4 * 2) + 1 = 9，建议设置为 10。

### SSL 配置

#### 开发环境（不使用 SSL）

```env
DB_SSL_ENABLED=false
```

#### 生产环境（使用 SSL）

```env
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

**注意**：
- 云数据库（如腾讯云、阿里云）通常要求启用 SSL
- 自建数据库需要配置 SSL 证书

### 日志配置

```env
# 开发环境：启用日志便于调试
DB_LOGGING=true

# 生产环境：关闭日志提高性能
DB_LOGGING=false
```

### 完整配置示例

#### 开发环境

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=dev_password
DB_NAME=who_is_bot

# 连接池配置
DB_CONNECTION_LIMIT=10
DB_RETRY_ATTEMPTS=3
DB_RETRY_DELAY=3000
DB_CONNECT_TIMEOUT=10000

# SSL 配置
DB_SSL_ENABLED=false

# 日志配置
DB_LOGGING=true

# 应用配置
PORT=3000
NODE_ENV=development
```

#### 生产环境

```env
# 数据库配置
DB_HOST=your-db-host.com
DB_PORT=3306
DB_USER=prod_user
DB_PASS=strong_password_here
DB_NAME=who_is_bot

# 连接池配置
DB_CONNECTION_LIMIT=20
DB_RETRY_ATTEMPTS=5
DB_RETRY_DELAY=5000
DB_CONNECT_TIMEOUT=15000

# SSL 配置
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true

# 日志配置
DB_LOGGING=false

# 应用配置
PORT=80
NODE_ENV=production
```

---

## 环境切换

### 从开发切换到生产

#### 1. 后端配置

修改 `services/.env`：

```env
# 更新数据库连接
DB_HOST=production-db-host
DB_USER=prod_user
DB_PASS=prod_password

# 启用 SSL
DB_SSL_ENABLED=true

# 关闭日志
DB_LOGGING=false

# 设置生产环境
NODE_ENV=production
```

#### 2. 前端配置

修改 `utils/api.js`：

```javascript
const ENV_CONFIG = {
  USE_LOCAL_API: false,  // 切换到云托管
  CLOUD_ENV: 'your-prod-env',
  CLOUD_SERVICE: 'your-service',
  USE_MOCK: false,
  TIMEOUT: 30000
};
```

#### 3. 小程序配置

在微信开发者工具中：
- 关闭"不校验合法域名"选项
- 配置服务器域名白名单
- 上传代码并提交审核

### 从生产切换到开发

#### 1. 后端配置

修改 `services/.env`：

```env
# 使用本地数据库
DB_HOST=localhost
DB_USER=root
DB_PASS=dev_password

# 关闭 SSL
DB_SSL_ENABLED=false

# 启用日志
DB_LOGGING=true

# 设置开发环境
NODE_ENV=development
```

#### 2. 前端配置

修改 `utils/api.js`：

```javascript
const ENV_CONFIG = {
  USE_LOCAL_API: true,  // 使用本地服务器
  LOCAL_API_URL: 'http://192.168.1.100:3000',
  USE_MOCK: false,
  TIMEOUT: 30000
};
```

#### 3. 小程序配置

在微信开发者工具中：
- 开启"不校验合法域名"选项
- 确保手机和电脑在同一局域网

---

## 性能调优

### 数据库性能优化

#### 1. 连接池优化

```env
# 根据并发量调整连接池大小
DB_CONNECTION_LIMIT=20

# 减少连接超时时间
DB_CONNECT_TIMEOUT=5000
```

#### 2. 查询优化

- 为常用查询字段添加索引
- 使用 `EXPLAIN` 分析慢查询
- 避免 `SELECT *`，只查询需要的字段

#### 3. 缓存策略

```typescript
// 示例：使用 Redis 缓存热点数据
@Injectable()
export class ContentService {
  async getFeed() {
    // 先查缓存
    const cached = await this.redis.get('feed:latest');
    if (cached) return JSON.parse(cached);

    // 查数据库
    const data = await this.contentRepository.find();

    // 写入缓存（5分钟过期）
    await this.redis.setex('feed:latest', 300, JSON.stringify(data));

    return data;
  }
}
```

### API 性能优化

#### 1. 请求超时配置

```javascript
// 根据网络情况调整超时时间
const ENV_CONFIG = {
  TIMEOUT: 30000  // 30秒
};
```

#### 2. 并发请求控制

```javascript
// 限制同时发起的请求数量
const MAX_CONCURRENT_REQUESTS = 5;
```

#### 3. 响应压缩

```typescript
// main.ts
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());  // 启用 GZIP 压缩
  await app.listen(3000);
}
```

### 小程序性能优化

#### 1. 图片优化

```javascript
// 使用 WebP 格式
<image src="{{imageUrl}}?x-oss-process=image/format,webp" />

// 懒加载
<image lazy-load="{{true}}" src="{{imageUrl}}" />
```

#### 2. 分页加载

```javascript
// 实现上拉加载更多
onReachBottom() {
  if (this.data.hasMore && !this.data.loading) {
    this.loadMore();
  }
}
```

#### 3. 请求缓存

```javascript
// 缓存不常变化的数据
const cachedData = wx.getStorageSync('leaderboard');
if (cachedData && Date.now() - cachedData.timestamp < 300000) {
  return cachedData.data;
}
```

---

## 安全配置

### 数据库安全

#### 1. 密码强度

```env
# 不推荐
DB_PASS=123456

# 推荐
DB_PASS=Xy9$mK2#pL8@qR5!
```

密码要求：
- 至少 16 个字符
- 包含大小写字母、数字、特殊字符
- 定期更换（建议每 90 天）

#### 2. 用户权限

```sql
-- 创建专用数据库用户
CREATE USER 'who_is_bot_app'@'%' IDENTIFIED BY 'strong_password';

-- 只授予必要权限
GRANT SELECT, INSERT, UPDATE, DELETE ON who_is_bot.* TO 'who_is_bot_app'@'%';

-- 不要使用 root 用户
```

#### 3. SSL 连接

```env
# 生产环境必须启用
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

### API 安全

#### 1. JWT 配置

```env
# 使用强密钥
JWT_SECRET=your_very_long_and_random_secret_key_here_at_least_32_characters

# 设置合理的过期时间
JWT_EXPIRES_IN=7d
```

#### 2. CORS 配置

```env
# 只允许特定域名
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### 3. 请求限流

```typescript
// 使用 throttler 模块
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,  // 每分钟最多 10 个请求
    }),
  ],
})
export class AppModule {}
```

### 环境变量安全

#### 1. 不要提交 .env 文件

```bash
# .gitignore
.env
.env.local
.env.production
```

#### 2. 使用环境变量管理工具

- 开发环境：使用 `.env` 文件
- 生产环境：使用云平台的环境变量配置

#### 3. 敏感信息加密

```typescript
// 使用加密存储敏感配置
import * as crypto from 'crypto';

const encrypted = crypto
  .createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY)
  .update(sensitiveData, 'utf8', 'hex');
```

---

## 故障排查

### 数据库连接问题

#### 问题：连接超时

```
Error: connect ETIMEDOUT
```

**解决方案**：
1. 检查数据库服务是否启动
2. 检查防火墙设置
3. 增加 `DB_CONNECT_TIMEOUT` 值
4. 检查网络连接

#### 问题：认证失败

```
Error: Access denied for user
```

**解决方案**：
1. 检查用户名和密码
2. 检查用户权限
3. 检查主机访问限制

### API 请求问题

#### 问题：请求超时

**解决方案**：
1. 增加 `TIMEOUT` 值
2. 检查网络连接
3. 优化后端接口性能

#### 问题：跨域错误

**解决方案**：
1. 配置 CORS
2. 检查 `ALLOWED_ORIGINS` 设置
3. 在开发工具中关闭域名校验

---

## 最佳实践

### 开发流程

1. **本地开发**
   - 使用本地数据库
   - 启用详细日志
   - 使用 Mock 数据测试

2. **测试环境**
   - 使用测试数据库
   - 启用适度日志
   - 测试真实 API

3. **生产环境**
   - 使用生产数据库
   - 关闭详细日志
   - 启用所有安全措施

### 配置管理

1. **版本控制**
   - 提交 `.env.example`
   - 不提交 `.env`
   - 文档化所有配置项

2. **环境隔离**
   - 开发、测试、生产使用不同配置
   - 使用不同的数据库
   - 使用不同的 API 密钥

3. **配置验证**
   - 启动时验证必需配置
   - 提供清晰的错误信息
   - 使用默认值（仅非关键配置）

---

## 总结

正确的配置是项目稳定运行的基础。请根据实际情况调整配置参数，并遵循安全最佳实践。

如有问题，请参考主 README 文档或提交 Issue。
