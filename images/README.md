# 图标说明

由于微信小程序的 tabBar 需要实际的图片文件，请按照以下步骤添加图标：

## 需要的图标文件

在 `images` 目录下需要以下图标文件（建议尺寸：81px × 81px）：

### 判定页面
- `tab-feed.png` - 未选中状态（灰色闪电图标）
- `tab-feed-active.png` - 选中状态（黑色闪电图标）

### 榜单页面
- `tab-leaderboard.png` - 未选中状态（灰色网格图标）
- `tab-leaderboard-active.png` - 选中状态（黑色网格图标）

### 发布页面
- `tab-publish.png` - 未选中状态（灰色加号圆圈图标）
- `tab-publish-active.png` - 选中状态（黑色加号圆圈图标）

### 广场页面
- `tab-square.png` - 未选中状态（灰色搜索图标）
- `tab-square-active.png` - 选中状态（黑色搜索图标）

### 我的页面
- `tab-profile.png` - 未选中状态（灰色用户图标）
- `tab-profile-active.png` - 选中状态（黑色用户图标）

## 临时解决方案

如果暂时没有图标，可以：

1. 使用在线图标生成工具创建简单图标
2. 或者暂时注释掉 `app.json` 中的 `tabBar.list[].iconPath` 和 `selectedIconPath` 字段
3. 使用纯文字的 tabBar（不推荐，但可以先运行）

## 修改 app.json 使用纯文字 tabBar

如果想先测试功能，可以删除 `app.json` 中每个 tab 的 `iconPath` 和 `selectedIconPath` 字段。
