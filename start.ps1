# Browser Insights - 快速启动脚本 (PowerShell)
Write-Host "========================================"
Write-Host "Browser Insights - 快速启动脚本"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/3] 正在启动后端服务..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRootserver'; python main.py"
Start-Sleep -Seconds 2

Write-Host "[2/3] 正在启动前端应用..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRootfrontend'; npm run dev"
Start-Sleep -Seconds 2

Write-Host "[3/3] 准备打开浏览器扩展安装页面..."
Start-Sleep -Seconds 2
Start-Process "chrome://extensions/"

Write-Host ""
Write-Host "========================================"
Write-Host "启动完成！"
Write-Host "========================================"
Write-Host ""
Write-Host "后端服务：http://localhost:8000"
Write-Host "前端应用：http://localhost:3000"
Write-Host ""
Write-Host "浏览器扩展安装说明:"
Write-Host "1. 在打开的扩展页面启用'开发者模式'"
Write-Host "2. 点击'加载已解压的扩展程序'"
Write-Host "3. 选择 extension 目录"
Write-Host ""
Write-Host "按任意键退出此窗口..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
