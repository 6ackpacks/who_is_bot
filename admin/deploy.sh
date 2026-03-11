#!/bin/bash

# 谁是人机 - 管理后台部署脚本

echo "开始构建管理后台..."

# 安装依赖
echo "安装依赖..."
npm install

# 构建生产版本
echo "构建生产版本..."
npm run build

# 检查构建是否成功
if [ -d "dist" ]; then
    echo "构建成功！"
    echo "dist 目录已生成，可以部署到静态文件服务器"
else
    echo "构建失败！"
    exit 1
fi

# 可选：构建 Docker 镜像
read -p "是否构建 Docker 镜像？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "构建 Docker 镜像..."
    docker build -t who-is-bot-admin:latest .
    echo "Docker 镜像构建完成！"
    echo "运行命令: docker run -d -p 3000:80 who-is-bot-admin:latest"
fi

echo "部署完成！"
