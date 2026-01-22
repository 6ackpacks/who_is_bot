# 谁是人机？- 微信小程序版本

这是从 React/Vite Web 应用转换而来的微信小程序版本。

## 项目结构

```
who-is-the-bot/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序全局配置
├── app.wxss              # 全局样式
├── sitemap.json          # 索引配置
├── project.config.json   # 项目配置
├── utils/
│   └── mockData.js       # 模拟数据
├── pages/
│   ├── feed/             # 判定页面（主功能）
│   │   ├── feed.js
│   │   ├── feed.json
│   │   ├── feed.wxml
│   │   └── feed.wxss
│   ├── leaderboard/      # 榜单页面
│   │   ├── leaderboard.js
│   │   ├── leaderboard.json
│   │   ├── leaderboard.wxml
│   │   └── leaderboard.wxss
│   ├── profile/          # 个人资料页面
│   │   ├── profile.js
│   │   ├── profile.json
│   │   ├── profile.wxml
│   │   └── profile.wxss
│   ├── publish/          # 发布页面
│   │   ├── publish.js
│   │   ├── publish.json
│   │   ├── publish.wxml
│   │   └── publish.wxss
│   └── square/           # 广场页面
│       ├── square.js
│       ├── square.json
│       ├── square.wxml
│       └── square.wxss
└── images/               # 图标资源目录
    └── README.md         # 图标说明文件
```

## 功能说明

### 1. 判定页面 (Feed)
- 展示内容卡片（文字或图片）
- 用户判断是 AI 生成还是真人创作
- 显示判断结果和统计数据
- 查看详细解析和社区讨论
- 支持三个视图状态：判定、结果揭晓、详情页

### 2. 榜单页面 (Leaderboard)
- 显示 AI 模型欺骗率排行榜
- 支持按类型筛选（全部、视频、图片、文字）
- 显示模型名称、公司、测试次数等信息

### 3. 个人资料页面 (Profile)
- 显示用户信息和等级
- 展示统计数据（准确率、已判定数、连续正确数）
- 成就勋章系统
- 分享功能

### 4. 发布页面 (Publish)
- 上传样本的占位页面
- 功能待开发

### 5. 广场页面 (Square)
- 社区讨论的占位页面
- 功能待开发

## 如何运行

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录：`C:\Users\li\Downloads\who-is-the-bot`
4. AppID 使用测试号或你自己的 AppID
5. 点击"编译"运行

## 注意事项

### TabBar 图标
当前使用纯文字 tabBar（没有图标）。如需添加图标：
1. 准备 10 个图标文件（每个 tab 需要普通和选中两个状态）
2. 图标尺寸建议：81px × 81px
3. 放置在 `images/` 目录下
4. 在 `app.json` 中添加 `iconPath` 和 `selectedIconPath` 配置
5. 详见 `images/README.md`

### 网络图片
小程序中使用的网络图片（如头像、示例图片）需要配置服务器域名白名单：
- `https://picsum.photos` - 示例图片
- `https://api.dicebear.com` - 头像生成

在微信公众平台的"开发 > 开发管理 > 开发设置 > 服务器域名"中配置。

开发阶段可以在微信开发者工具中勾选"不校验合法域名"。

## 与原 React 版本的主要差异

1. **UI 框架**：从 React 改为微信小程序的 WXML/WXSS
2. **动画**：从 framer-motion 改为微信小程序原生动画和 CSS 动画
3. **图标**：从 lucide-react 改为 emoji 图标（临时方案）
4. **导航**：从单页应用改为多页面 tabBar 导航
5. **样式**：从 Tailwind CSS 改为自定义 WXSS

## 后续优化建议

1. 添加真实的 tabBar 图标
2. 实现发布功能（上传图片/文字）
3. 实现社区广场功能
4. 添加用户登录和数据持久化
5. 接入真实的后端 API
6. 优化动画效果
7. 添加分享功能
8. 实现成就系统的完整逻辑

## 技术栈

- 微信小程序原生框架
- JavaScript ES6+
- WXML (类似 HTML)
- WXSS (类似 CSS)

## 开发者

转换自 AI Studio 的 React 应用
