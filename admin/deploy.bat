@echo off
echo 开始构建管理后台...

echo 安装依赖...
call npm install

echo 构建生产版本...
call npm run build

if exist "dist" (
    echo 构建成功！
    echo dist 目录已生成，可以部署到静态文件服务器
) else (
    echo 构建失败！
    exit /b 1
)

set /p BUILD_DOCKER="是否构建 Docker 镜像？(y/n): "
if /i "%BUILD_DOCKER%"=="y" (
    echo 构建 Docker 镜像...
    docker build -t who-is-bot-admin:latest .
    echo Docker 镜像构建完成！
    echo 运行命令: docker run -d -p 3000:80 who-is-bot-admin:latest
)

echo 部署完成！
pause
