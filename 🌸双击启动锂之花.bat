@echo off
chcp 65001 >nul
title LiFlower 开发服务器

echo ==========================================
echo    LiFlower 锂之花 - 智能启动脚本
echo ==========================================
echo.

REM 进入项目目录（脚本所在位置）
cd /d "%~dp0"

echo [1/4] 检查 Node.js 环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请先安装 Node.js：
    echo https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    start https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node -v') do echo [OK] Node.js %%a
echo.

REM 检查端口占用
echo [2/4] 检查端口 3001...
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    echo [警告] 端口 3001 已被占用！
    echo.
    echo 正在尝试关闭占用端口的程序...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
        taskkill /F /PID %%a >nul 2>&1
        echo [OK] 已关闭占用进程 (PID: %%a)
    )
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] 端口 3001 可用
)
echo.

echo [3/4] 安装依赖（如果需要）...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖（可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo [OK] 依赖安装完成
) else (
    echo [OK] 依赖已安装
)
echo.

echo [4/4] 启动开发服务器...
echo.
echo ==========================================
echo    正在启动服务器...
echo    请稍等 5-10 秒
echo ==========================================
echo.

REM 启动服务器（在新窗口中）
start "LiFlower Server - 请勿关闭" cmd /k "npm run dev -- --port 3001 --host"

REM 等待服务器启动
echo 等待服务器就绪...
timeout /t 6 /nobreak >nul

REM 自动打开浏览器
echo 正在打开浏览器...
start http://localhost:3001

echo.
echo ==========================================
echo [OK] 服务器已启动！
echo.
echo 浏览器地址：http://localhost:3001
echo.
echo 注意：不要关闭标题为 "LiFlower Server" 的窗口！
echo       那个窗口是服务器，关闭后网页会失效。
echo ==========================================
echo.
pause
