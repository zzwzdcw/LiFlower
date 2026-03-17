@echo off
chcp 65001 >nul
title 关闭 LiFlower 服务器

echo ==========================================
echo    关闭 LiFlower 锂之花服务器
echo ==========================================
echo.

echo 正在查找并关闭服务器进程...
echo.

REM 查找并关闭 Node.js 进程（Vite 服务器）
tasklist | findstr "node.exe" >nul
if %errorlevel% == 0 (
    echo 发现 Node.js 进程，正在关闭...
    taskkill /F /IM node.exe >nul 2>&1
    echo [OK] 已关闭 Node.js 进程
) else (
    echo [信息] 未发现运行中的 Node.js 进程
)

REM 检查端口 3001
echo.
echo 检查端口 3001...
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    echo 发现端口占用，强制释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003001"') do (
        taskkill /F /PID %%a >nul 2>&1
        echo [OK] 已释放端口 (PID: %%a)
    )
) else (
    echo [OK] 端口 3001 已释放
)

echo.
echo ==========================================
echo [OK] 服务器已完全关闭
echo ==========================================
echo.
pause
