@echo off
chcp 65001 >nul
title LiFlower 开发服务器

echo ==========================================
echo    LiFlower 锂之花 - 自动启动脚本
echo ==========================================
echo.

REM 进入项目目录
cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js！
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

echo.
echo [2/3] 启动开发服务器...
echo 提示：如果端口被占用，会自动尝试其他端口
echo.

REM 在后台启动服务器并打开浏览器
start "LiFlower Server" cmd /c "npm run dev -- --port 3001 & timeout /t 3 /nobreak >nul & start http://localhost:3001"

echo [3/3] 服务器启动中...
timeout /t 4 /nobreak >nul

echo.
echo ==========================================
echo    服务器已启动！
echo    浏览器将自动打开 http://localhost:3001
echo ==========================================
echo.
echo 按任意键关闭此窗口（服务器会继续运行）
pause >nul
