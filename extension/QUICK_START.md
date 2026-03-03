# Browser Insights 快速安装指南

## ✅ CSP 问题已修复

已将 Vue.js 和 Chart.js 下载到本地，解决了 Content Security Policy 限制。

## 📦 完整安装步骤

### 步骤 1: 启动后端服务

**必须首先启动后端服务!**

```bash
cd d:\UGit\AiBrowserInsights\server
python main.py
```

后端将在 `http://localhost:8001` 启动

**验证后端启动成功:**
- 看到 `Uvicorn running on http://0.0.0.0:8001` 提示
- 访问 http://localhost:8001 显示服务信息

### 步骤 2: 加载浏览器扩展

1. 打开 **Edge** 或 **Chrome** 浏览器
2. 访问扩展管理页面:
   - Edge: `edge://extensions/`
   - Chrome: `chrome://extensions/`
3. 开启右上角的 **"开发者模式"** 开关
4. 点击 **"加载已解压的扩展程序"** 按钮
5. 选择文件夹：`d:\UGit\AiBrowserInsights\extension`
6. ✅ 扩展图标 (🎧) 应出现在浏览器工具栏

### 步骤 3: 测试扩展

1. **点击扩展图标** - 应该能看到主界面
2. **切换深色模式** - 点击右上角的☀️/🌙按钮
3. **查看图表** - Dashboard 页面应显示访问趋势图

### 步骤 4: 配置 API

1. 点击扩展图标
2. 切换到 **"设置"** 标签页
3. 输入 **阿里云 DashScope API 密钥**
4. 点击 **"保存设置"**

**获取 API 密钥:**
- 访问：https://dashscope.console.aliyun.com/
- 注册/登录阿里云账号
- 开通 DashScope 服务
- 创建 API 密钥

---

## 🔧 故障排除

### 问题 1: Vue is not defined
**原因**: Vue.js 未加载  
**解决**: 
- 确认 `extension/libs/vue.global.js` 文件存在
- 重新加载扩展

### 问题 2: 后端连接失败
**原因**: 后端服务未启动  
**解决**:
```bash
cd d:\UGit\AiBrowserInsights\server
python main.py
```

### 问题 3: 图标无法加载
**原因**: 图标文件缺失  
**解决**:
```bash
cd d:\UGit\AiBrowserInsights\extension\icons
python generate_icon.py
```

---

## 🌐 如何请求后端

### 前端请求后端 API

扩展中的 popup.js 已经配置好后端请求:

```javascript
// 分析 API
const response = await fetch('http://localhost:8001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    browse_history: historyData,
    keywords: settings.keywords || [],
    api_key: settings.apiKey,
    api_endpoint: settings.apiEndpoint
  })
});

const result = await response.json();
```

### 后端 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 服务状态 |
| `/health` | GET | 健康检查 |
| `/api/analyze` | POST | AI 分析 |
| `/api/generate-podcast` | POST | 生成播客 |
| `/api/data/{user_id}` | GET | 获取数据 |
| `/api/data/{user_id}` | POST | 保存数据 |
| `/api/export/{user_id}/{format}` | GET | 导出数据 |

### 测试后端 API

使用 curl 测试:
```bash
# 测试服务状态
curl http://localhost:8001/

# 测试健康检查
curl http://localhost:8001/health
```

使用 Python 测试:
```python
import requests

# 测试分析 API
response = requests.post('http://localhost:8001/api/analyze', json={
    'browse_history': [
        {'title': 'Test', 'url': 'http://example.com', 'visitTime': 1234567890}
    ],
    'keywords': ['test'],
    'api_key': 'your-api-key',
    'api_endpoint': 'https://dashscope.aliyuncs.com/api/v1'
})

print(response.json())
```

---

## 📁 项目结构

```
AiBrowserInsights/
├── server/                      # FastAPI 后端 (端口 8001)
│   ├── main.py                 # 主程序 ✅
│   ├── requirements.txt        # Python 依赖
│   └── data/                   # 数据存储
│
├── extension/                   # 浏览器扩展 ✅
│   ├── manifest.json           # 扩展配置 ✅
│   ├── popup.html              # 主界面 ✅
│   ├── popup.js                # 界面逻辑 ✅
│   ├── background.js           # 后台服务 ✅
│   ├── content.js              # 内容脚本 ✅
│   ├── options.html            # 设置页面 ✅
│   ├── libs/                   # 本地库 ✅
│   │   ├── vue.global.js       # Vue.js (本地)
│   │   └── chart.umd.min.js    # Chart.js (本地)
│   ├── icons/                  # 图标文件 ✅
│   │   └── icon.png            # 主图标
│   └── download-libs.py        # 下载库脚本
│
└── frontend/                    # Vue3 独立前端 (可选)
```

---

## 🎯 使用流程

### 1. 启动顺序
```
1. 启动后端: python server/main.py
2. 加载扩展: chrome://extensions/
3. 配置 API: 点击扩展 -> 设置 -> 输入密钥
```

### 2. 日常使用
```
1. 正常浏览网页 (自动收集数据)
2. 点击扩展图标查看统计
3. 生成 AI 分析报告
4. 收听语音播客
```

### 3. 快捷操作
- **右键页面**: "使用 Browser Insights 分析此页"
- **选中文字右键**: "添加到关注关键词"
- **快捷键**: `Ctrl+Shift+I` 打开扩展

---

## ✅ 检查清单

安装前:
- [ ] Python 3.12+ 已安装
- [ ] 后端依赖已安装：`pip install -r server/requirements.txt`
- [ ] 库文件已下载：`extension/libs/` 目录存在

安装后:
- [ ] 扩展图标显示在工具栏
- [ ] 点击图标能看到界面
- [ ] 深色模式可以切换
- [ ] 图表正常显示 (无 CSP 错误)
- [ ] 后端服务正在运行

---

## 🔗 相关文档

- [README.md](../README.md) - 项目总览
- [INSTALL_GUIDE.md](../INSTALL_GUIDE.md) - 详细安装指南
- [NEW_FEATURES.md](../NEW_FEATURES.md) - 新功能说明
- [icons/README.md](icons/README.md) - 图标说明

---

## 💡 常见问题

### Q: 为什么使用本地库而不是 CDN?
A: Chrome 扩展的 CSP 策略禁止加载外部脚本，必须使用本地文件。

### Q: 可以修改库的版本吗?
A: 可以，运行 `download-libs.py` 会下载最新版本的库。

### Q: 后端必须一直运行吗?
A: 是的，扩展需要后端提供 AI 分析和数据存储功能。

### Q: 可以在多台设备使用吗?
A: 可以，但数据存储在本地。跨设备同步功能正在开发中。

---

**状态**: ✅ 所有问题已解决，扩展现在可以正常使用了！
