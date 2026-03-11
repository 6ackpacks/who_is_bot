# 谁是人机 - 管理后台

基于 React 18 + TypeScript + Vite + Ant Design 5 的现代化管理后台系统。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5.x
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **样式**: TailwindCSS
- **图表**: Recharts
- **日期处理**: Day.js

## 功能模块

- 登录认证（JWT Token）
- 仪表盘（数据概览、图表）
- 内容管理（列表、创建、编辑、详情）
- 用户管理（列表、详情、编辑）
- 评论管理（列表、详情、删除）
- 资源上传（图片、视频）

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 环境变量

创建 `.env` 文件配置开发环境：

```bash
VITE_API_BASE_URL=http://localhost:80
```

生产环境使用 `.env.production`：

```bash
VITE_API_BASE_URL=https://api.example.com
```

## 项目结构

```
admin/
├── src/
│   ├── api/              # API 接口
│   ├── components/       # 公共组件
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   ├── stores/           # 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── public/               # 静态资源
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── tailwind.config.js    # TailwindCSS 配置
```

## 设计规范

遵循 Claude-Inspired Design System：

- 主色：#D97757（陶土橙）
- 背景：#F9F8F6（米白色）
- 圆角：8px / 16px / 24px
- 字体：Poppins / PingFang SC

## 路由说明

- `/login` - 登录页
- `/` - 仪表盘
- `/content` - 内容列表
- `/content/create` - 创建内容
- `/content/:id` - 内容详情
- `/content/:id/edit` - 编辑内容
- `/users` - 用户列表
- `/users/:id` - 用户详情
- `/users/:id/edit` - 编辑用户
- `/comments` - 评论列表
- `/comments/:id` - 评论详情
- `/upload` - 资源上传

## 注意事项

1. 所有 API 请求需要携带 JWT Token
2. Token 存储在 LocalStorage 中
3. Token 过期后自动跳转登录页
4. 上传文件大小限制：图片 5MB，视频 100MB
5. 支持的文件格式：JPG、PNG、GIF、WebP、MP4、MOV

## License

MIT
