# Browser Insights 最终安装指南

## ✅ 所有问题已解决!

### 已修复的问题
1. ✅ 图标文件缺失
2. ✅ CSP 阻止 CDN 脚本
3. ✅ Vue.js 需要 unsafe-eval
4. ✅ 浏览器缓存旧版本

### 解决方案
- ✅ 生成本地 PNG 图标
- ✅ 下载 Vue.js 和 Chart.js 到本地
- ✅ 使用 Vue 生产版本 (不需要 eval)
- ✅ 更新 manifest.json 版本 1.0.1

---

## 🚀 快速开始 (3 步)

### 步骤 1: 启动后端 (必需!)
```bash
cd d:\UGit\AiBrowserInsights\server
python main.py
```
**验证**: 看到 `Uvicorn running on http://0.0.0.0:8001`

### 步骤 2: 刷新扩展
1. 点击浏览器工具栏的扩展图标 (🎧)
2. 按 **`Ctrl + Shift + R`** 强制刷新
3. 界面应该正常显示

### 步骤 3: 配置 API
1. 切换到"设置"标签页
2. 输入阿里云 DashScope API 密钥
3. 点击"保存设置"

---

## 📁 文件结构

```
extension/
├── libs/                       ✅ 本地库
│   ├── vue.global.js          ✅ Vue 3.4.21 生产版
│   └── chart.umd.min.js       ✅ Chart.js 4.4.1
├── icons/
│   └── icon.png               ✅ 128x128 PNG
├── popup.html                  ✅ 使用本地库
├── popup.js                    ✅ Vue 应用
├── background.js               ✅ 后台服务
├── manifest.json               ✅ v1.0.1
└── REFRESH_GUIDE.md           ✅ 刷新指南
```

---

## 🔧 故障排除

### 问题 1: CSP 错误
**症状**: `Loading script violates CSP`  
**解决**: 
```
1. 关闭 popup
2. 按 Ctrl+Shift+R 强制刷新
3. 检查 manifest.json 版本是否为 1.0.1
```

### 问题 2: Vue is not defined
**症状**: `Uncaught ReferenceError: Vue is not defined`  
**原因**: 浏览器缓存旧 HTML  
**解决**:
```
1. 按 Ctrl+Shift+R 强制刷新
2. 或清除浏览器缓存
3. 或重新加载扩展
```

### 问题 3: 后端连接失败
**症状**: `Failed to fetch`  
**原因**: 后端未启动  
**解决**:
```bash
cd d:\UGit\AiBrowserInsights\server
python main.py
```

---

## 🌐 后端 API 使用

### 请求示例 (JavaScript)
```javascript
// AI 分析
const response = await fetch('http://localhost:8001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    browse_history: historyData,
    keywords: ['AI', 'Python'],
    api_key: 'sk-your-key',
    api_endpoint: 'https://dashscope.aliyuncs.com/api/v1'
  })
});

const result = await response.json();
console.log(result.summary);
```

### API 端点
| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 服务状态 |
| `/health` | GET | 健康检查 |
| `/api/analyze` | POST | AI 分析 |
| `/api/generate-podcast` | POST | 生成播客 |
| `/api/data/default` | GET/POST | 数据管理 |

---

## ✅ 验证清单

安装后检查:
- [ ] 后端服务运行 (端口 8001)
- [ ] 扩展版本 1.0.1
- [ ] `libs/vue.global.js` 存在
- [ ] `libs/chart.umd.min.js` 存在
- [ ] `icons/icon.png` 存在
- [ ] popup 正常显示
- [ ] 无 CSP 错误
- [ ] 深色模式可用
- [ ] 图表正常显示

---

## 📝 技术细节

### CSP 配置
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  }
}
```

### 库文件
- **Vue.js**: 147KB, 生产版本，不需要 eval
- **Chart.js**: 200KB, UMD 版本

### 后端端口
- **端口**: 8001 (避免与 Django 冲突)
- **URL**: http://localhost:8001

---

## 🎯 使用流程

### 日常使用
1. 启动后端: `python server/main.py`
2. 正常浏览网页 (自动收集)
3. 点击扩展图标查看统计
4. 生成 AI 分析 (需要 API 密钥)
5. 收听播客

### 快捷操作
- **右键页面**: "分析此页"
- **选中文字右键**: "添加到关键词"
- **快捷键**: Ctrl+Shift+I 打开扩展

---

## 📞 获取帮助

文档:
- [REFRESH_GUIDE.md](REFRESH_GUIDE.md) - 刷新指南
- [QUICK_START.md](../QUICK_START.md) - 快速开始
- [FIXES_SUMMARY.md](../FIXES_SUMMARY.md) - 修复总结

---

**状态**: ✅ 完全可用，所有问题已解决!
