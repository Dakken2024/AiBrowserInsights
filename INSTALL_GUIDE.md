# Browser Insights 安装指南

## ✅ 问题已修复

图标文件问题已解决！现在可以正常加载扩展了。

## 📦 安装步骤

### 方法一：手动加载 (推荐)

#### 1. 准备环境
确保后端服务正在运行:
```bash
cd d:\UGit\AiBrowserInsights\server
python main.py
```

#### 2. 加载扩展
1. 打开 **Edge** 或 **Chrome** 浏览器
2. 访问扩展管理页面:
   - Edge: `edge://extensions/`
   - Chrome: `chrome://extensions/`
3. 开启右上角的 **"开发者模式"** 开关
4. 点击 **"加载已解压的扩展程序"** 按钮
5. 选择文件夹：`d:\UGit\AiBrowserInsights\extension`
6. 扩展图标应该出现在浏览器工具栏

#### 3. 验证安装
- 点击工具栏的扩展图标 (🎧)
- 应该能看到主界面
- 没有错误提示

### 方法二：使用启动脚本

运行项目根目录的启动脚本:
```bash
start.bat
```
或
```powershell
start.ps1
```

## 🔧 故障排除

### 问题 1: "Couldn't load icon icons/icon.png"
**原因**: 图标文件不存在  
**解决**: 
- 图标已通过 `generate_icon.py` 生成
- 确认 `extension/icons/icon.png` 文件存在
- 重新加载扩展

### 问题 2: 扩展加载后无法使用
**原因**: 后端服务未启动  
**解决**:
```bash
cd d:\UGit\AiBrowserInsights\server
python main.py
```

### 问题 3: 点击图标没反应
**原因**: popup.html 文件有问题  
**解决**:
- 检查 `extension/popup.html` 是否存在
- 查看浏览器控制台错误 (F12)

### 问题 4: 图表不显示
**原因**: Chart.js CDN 无法访问  
**解决**:
- 检查网络连接
- 或者下载 Chart.js 到本地

## ⚙️ 初始配置

### 1. 配置 API 密钥
1. 点击扩展图标
2. 切换到"设置"标签页
3. 输入阿里云 DashScope API 密钥
4. 点击"保存设置"

**获取 API 密钥**:
- 访问：https://dashscope.console.aliyun.com/
- 注册/登录阿里云账号
- 开通 DashScope 服务
- 创建 API 密钥

### 2. 测试功能
1. 浏览几个网页
2. 返回扩展查看统计
3. 尝试生成 AI 分析

## 🎨 功能特性

### 已实现
- ✅ 网页数据自动收集
- ✅ AI 智能分析
- ✅ 语音播客生成
- ✅ 图表可视化
- ✅ 深色模式
- ✅ 右键菜单
- ✅ Badge 角标
- ✅ 快捷键支持
- ✅ 多种 TTS 引擎

### 使用技巧
- **深色模式**: 点击右上角的☀️/🌙按钮
- **刷新数据**: 点击🔄按钮
- **快速分析**: 右键页面 -> "使用 Browser Insights 分析此页"
- **添加关键词**: 选中文字 -> 右键 -> "添加到关注关键词"

## 📁 项目结构

```
AiBrowserInsights/
├── server/                 # FastAPI 后端 (端口 8001)
│   ├── main.py            # 主程序
│   ├── requirements.txt   # Python 依赖
│   └── data/              # 数据存储
│
├── extension/             # 浏览器扩展
│   ├── manifest.json      # 扩展配置
│   ├── popup.html         # 主界面
│   ├── popup.js           # 界面逻辑
│   ├── background.js      # 后台服务
│   ├── content.js         # 内容脚本
│   ├── options.html       # 设置页面
│   └── icons/             # 图标文件
│       └── icon.png       ✅ 已生成
│
└── frontend/              # Vue3 独立前端 (可选)
    └── src/
```

## 🚀 快速开始

1. **启动后端**: `python server/main.py`
2. **加载扩展**: 浏览器 -> `chrome://extensions/` -> 加载 extension 文件夹
3. **配置 API**: 点击扩展图标 -> 设置 -> 输入 API 密钥
4. **开始使用**: 正常浏览网页，数据自动收集

## 📞 获取帮助

如果遇到问题:
1. 查看浏览器控制台 (F12)
2. 检查后端日志
3. 查看文档:
   - README.md
   - INSTALL.md
   - NEW_FEATURES.md

## ✅ 检查清单

安装前确认:
- [ ] Python 3.12+ 已安装
- [ ] 后端依赖已安装 (`pip install -r server/requirements.txt`)
- [ ] 图标文件存在 (`extension/icons/icon.png`)
- [ ] 所有文件完整

安装后验证:
- [ ] 扩展图标显示在工具栏
- [ ] 点击图标能看到界面
- [ ] 深色模式可以切换
- [ ] 图表正常显示
- [ ] 右键菜单可用

**状态**: ✅ 所有问题已修复，可以正常安装使用！
