@echo off
echo ========================================
echo Browser Insights - 快速启动脚本
echo ========================================
echo.

echo [1/3] 正在启动后端服务...
cd /d "%~dp0server"
start "Backend Server" cmd /k "python main.py"
timeout /t 2 /nobreak >nul

echo [2/3] 正在启动前端应用...
cd /d "%~dp0frontend"
start "Frontend App" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] 准备打开浏览器扩展安装页面...
timeout /t 2 /nobreak >nul
start chrome://extensions/

echo.
echo ========================================
echo 启动完成！
echo ========================================
echo.
echo 后端服务：http://localhost:8000
echo 前端应用：http://localhost:3000
echo.
echo 浏览器扩展安装说明:
echo 1. 在打开的扩展页面启用"开发者模式"
echo 2. 点击"加载已解压的扩展程序"
echo 3. 选择 extension 目录
echo.
echo 按任意键退出此窗口...
pause >nul
