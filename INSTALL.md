# Browser Insights 安装部署指南

## 系统要求

- Python 3.12+
- Node.js 18+
- Chrome 110+ 或 Edge 110+

## 快速部署 (Windows)

### 方法一：使用启动脚本

1. 双击运行 `start.ps1` (PowerShell) 或 `start.bat` (CMD)
2. 脚本将自动启动后端和前端服务
3. 按照提示安装浏览器扩展

### 方法二：手动部署

#### 1. 启动后端服务

```bash
cd server
pip install -r requirements.txt
python main.py
```

后端将在 http://localhost:8001 启动

#### 2. 安装浏览器扩展

1. 打开 Chrome 或 Edge 浏览器
2. 访问 `chrome://extensions/` 或 `edge://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `extension` 文件夹
6. 扩展图标将出现在浏览器工具栏

#### 3. (可选) 启动独立前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

## 配置说明

### 1. API 密钥配置

1. 点击扩展图标打开设置页面
2. 输入阿里云 DashScope API 密钥
3. 保存设置

**获取 API 密钥:**
- 访问 https://dashscope.console.aliyun.com/
- 注册/登录阿里云账号
- 开通 DashScope 服务
- 创建 API 密钥

### 2. 测试连接

访问 http://localhost:8001 查看后端状态

## 功能验证

### 测试浏览记录收集

1. 开始浏览网页
2. 点击扩展图标查看仪表盘
3. 确认浏览记录已自动记录

### 测试 AI 分析

1. 确保已配置 API 密钥
2. 切换到"AI 分析"标签页
3. 点击"生成分析"
4. 查看 AI 生成的报告

### 测试播客生成

1. 切换到"播客"标签页
2. 点击"重新生成"
3. 点击播放按钮收听

## 常见问题

### Q: 后端服务无法启动？

**A:** 检查端口 8001 是否被占用:
```bash
netstat -ano | findstr :8001
```

### Q: 扩展无法加载？

**A:** 
1. 确保 manifest.json 格式正确
2. 检查 extension 目录是否完整
3. 查看浏览器控制台的错误信息

### Q: API 调用失败？

**A:**
1. 检查 API 密钥是否正确
2. 确认网络连接正常
3. 查看后端日志获取详细错误

### Q: 前端无法连接后端？

**A:**
1. 确认后端服务正在运行
2. 检查 CORS 配置
3. 查看浏览器控制台的网络请求

## 数据管理

### 导出数据

1. 打开设置页面
2. 点击"导出数据"
3. JSON 文件将自动下载

### 清除数据

1. 打开设置页面
2. 点击"清除所有数据"
3. 确认操作

### 数据位置

- 扩展数据：浏览器本地存储
- 后端数据：`server/data/` 目录

## 性能优化

### 减少内存占用

1. 定期清理浏览历史
2. 调整数据保留天数
3. 关闭不需要的后台同步

### 提高分析速度

1. 减少单次分析的记录数
2. 使用更快的 API 端点
3. 优化关键词列表

## 安全建议

1. 定期更新 API 密钥
2. 不要分享您的 API 密钥
3. 定期导出并备份数据
4. 使用 HTTPS 保护通信

## 卸载

### 卸载扩展

1. 打开 `chrome://extensions/`
2. 找到 Browser Insights
3. 点击"移除"

### 清理数据

```bash
# 删除后端数据
rm -rf server/data/

# 删除前端构建
rm -rf frontend/dist/
```

## 技术支持

- 查看 README.md 获取使用说明
- 查看 DEVELOPMENT.md 获取开发指南
- 提交 Issue 获取帮助
