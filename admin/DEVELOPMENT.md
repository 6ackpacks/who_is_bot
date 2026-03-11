# 管理后台开发指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并修改 API 地址：

```bash
VITE_API_BASE_URL=http://localhost:80
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构说明

```
src/
├── api/              # API 接口层
│   ├── auth.ts       # 认证相关 API
│   ├── content.ts    # 内容管理 API
│   ├── user.ts       # 用户管理 API
│   ├── comment.ts    # 评论管理 API
│   ├── dashboard.ts  # 仪表盘 API
│   └── upload.ts     # 文件上传 API
├── components/       # 公共组件（待扩展）
├── layouts/          # 布局组件
│   └── MainLayout.tsx # 主布局（侧边栏+顶栏）
├── pages/            # 页面组件
│   ├── Login.tsx     # 登录页
│   ├── Dashboard.tsx # 仪表盘
│   ├── Content/      # 内容管理页面
│   ├── Users/        # 用户管理页面
│   ├── Comments/     # 评论管理页面
│   └── Upload.tsx    # 资源上传页面
├── stores/           # 状态管理
│   └── authStore.ts  # 认证状态
├── types/            # TypeScript 类型定义
│   └── index.ts      # 全局类型
├── utils/            # 工具函数
│   ├── request.ts    # Axios 封装
│   ├── format.ts     # 格式化工具
│   ├── validate.ts   # 验证工具
│   └── constants.ts  # 常量定义
├── App.tsx           # 根组件（路由配置）
├── main.tsx          # 入口文件
└── index.css         # 全局样式
```

## 核心功能说明

### 1. 认证流程

- 用户登录后获取 JWT Token
- Token 存储在 LocalStorage（通过 Zustand persist）
- 每次请求自动在 Header 中携带 Token
- Token 过期自动跳转登录页

### 2. API 请求

所有 API 请求通过 `src/utils/request.ts` 统一处理：

```typescript
import api from '@/utils/request';

// GET 请求
const data = await api.get('/admin/content');

// POST 请求
const result = await api.post('/admin/content', { title: 'xxx' });
```

### 3. 状态管理

使用 Zustand 管理全局状态：

```typescript
import { useAuthStore } from '@/stores/authStore';

function Component() {
  const { token, admin, logout } = useAuthStore();
  // ...
}
```

### 4. 路由守卫

通过 `PrivateRoute` 组件实现路由守卫：

```typescript
<Route
  path="/"
  element={
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  }
>
  {/* 子路由 */}
</Route>
```

## 开发规范

### 1. 命名规范

- 组件文件：PascalCase（如 `ContentList.tsx`）
- 工具函数：camelCase（如 `formatDate.ts`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- 类型定义：PascalCase（如 `ContentInfo`）

### 2. 组件规范

- 使用函数组件 + Hooks
- 组件拆分遵循单一职责原则
- 复杂逻辑抽取为自定义 Hook

### 3. 样式规范

- 优先使用 Ant Design 组件
- 使用 TailwindCSS 工具类
- 避免内联样式，使用 className

### 4. TypeScript 规范

- 严格模式开启
- 避免使用 `any`，使用具体类型
- 接口定义放在 `types/` 目录

## 常见问题

### 1. API 请求失败

检查：
- 后端服务是否启动
- `.env` 中的 API 地址是否正确
- Token 是否有效

### 2. 路由跳转失败

检查：
- 路由路径是否正确
- 是否有权限访问（需要登录）

### 3. 样式不生效

检查：
- TailwindCSS 配置是否正确
- 是否导入了 `index.css`
- Ant Design 主题配置是否正确

## 部署指南

### 方式一：静态文件部署

```bash
# 构建
npm run build

# 将 dist 目录部署到 Nginx/CDN
```

### 方式二：Docker 部署

```bash
# 构建镜像
docker build -t who-is-bot-admin:latest .

# 运行容器
docker run -d -p 3000:80 who-is-bot-admin:latest
```

### 方式三：使用部署脚本

```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

## 扩展功能

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/layouts/MainLayout.tsx` 添加菜单项

### 添加新 API

1. 在 `src/api/` 创建 API 文件
2. 定义接口函数
3. 在页面中调用

### 添加新类型

1. 在 `src/types/index.ts` 添加类型定义
2. 在组件中导入使用

## 性能优化建议

1. 使用 React.lazy 懒加载页面组件
2. 使用 useMemo/useCallback 优化渲染
3. 图片使用懒加载
4. 列表使用虚拟滚动（长列表）
5. 启用 Gzip 压缩

## 安全建议

1. 不要在代码中硬编码敏感信息
2. 使用 HTTPS 部署
3. 定期更新依赖包
4. 实施 CSP（内容安全策略）
5. 防止 XSS 攻击（输入过滤）

## 联系方式

如有问题，请联系开发团队。
