# ⚠️ 紧急修复：浏览器缓存问题

## 问题原因
浏览器**缓存了旧版本**的 popup.html，仍然在尝试加载 CDN 的 Vue.js，导致 CSP 错误。

## 🚀 快速修复 (3 种方法)

### 方法 1: 强制刷新 (最快) ⭐推荐

1. **点击扩展图标**打开 popup
2. 按 **`Ctrl + Shift + R`** (强制刷新)
3. ✅ 错误应该消失

### 方法 2: 使用清除缓存页面

1. 在浏览器地址栏输入:
   ```
   chrome-extension://[扩展 ID]/clear-cache.html
   ```
   或
   ```
   edge-extension://[扩展 ID]/clear-cache.html
   ```
   
2. 点击"清除缓存并刷新"按钮
3. 关闭 popup，重新点击扩展图标

**获取扩展 ID:**
1. 访问 `edge://extensions/`
2. 找到 Browser Insights
3. 复制 ID (一串字母)

### 方法 3: 完全重新加载扩展

1. 访问 `edge://extensions/` 或 `chrome://extensions/`
2. 找到 **Browser Insights**
3. 点击 **刷新图标** 🔄
4. **等待 3 秒**
5. 重新点击扩展图标

---

## 🔍 验证修复

刷新后，按 **F12** 打开控制台，应该:
- ✅ **没有** CSP 错误
- ✅ **没有** "Vue is not defined" 错误
- ✅ 界面正常显示
- ✅ 深色模式按钮可用

---

## 📋 检查清单

确保以下文件正确:

### 1. popup.html (第 7-8 行)
```html
<script src="libs/vue.global.js?v=1.0.1"></script>
<script src="libs/chart.umd.min.js?v=1.0.1"></script>
```
✅ 应该有 `?v=1.0.1` 版本号

### 2. manifest.json (第 3 行)
```json
"version": "1.0.1"
```
✅ 版本应该是 1.0.1

### 3. libs 目录
```
extension/libs/
├── vue.global.js       ✅ 存在 (~147KB)
└── chart.umd.min.js    ✅ 存在 (~200KB)
```

---

## 💡 为什么会出现这个问题？

1. **浏览器缓存机制**: 浏览器会缓存 HTML 文件以加快加载速度
2. **扩展更新**: 修改文件后，浏览器可能仍使用旧缓存
3. **Service Worker**: 扩展的 Service Worker 也可能缓存资源

---

## 🛠️ 彻底解决方案

### 添加版本号 (已完成)
在 script 标签添加版本号强制刷新:
```html
<script src="libs/vue.global.js?v=1.0.1"></script>
```

### 清除所有缓存
1. 按 `Ctrl + Shift + Delete`
2. 选择"缓存的图片和文件"
3. 点击"清除数据"

### 禁用缓存 (开发时)
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

---

## 🎯 正确的刷新流程

```
1. 修改代码
   ↓
2. 更新 manifest.json 版本号
   ↓
3. 在 edge://extensions/ 刷新扩展
   ↓
4. 按 Ctrl+Shift+R 刷新 popup
   ↓
5. 验证无错误
```

---

## 📞 仍然有问题？

### 症状 1: 仍然显示 CDN 错误
**解决**:
```
1. 关闭所有 popup 窗口
2. 访问 edge://extensions/
3. 禁用扩展
4. 重新启用扩展
5. 按 Ctrl+Shift+R
```

### 症状 2: Vue is not defined
**解决**:
```
1. 检查 libs/vue.global.js 是否存在
2. 文件大小应该是 ~147KB
3. 重新下载：python download-libs.py
4. 刷新扩展
```

### 症状 3: 图表不显示
**解决**:
```
1. 检查 libs/chart.umd.min.js 是否存在
2. 文件大小应该是 ~200KB
3. 刷新扩展
```

---

## ✅ 最终验证

完成以下步骤确认修复:

- [ ] popup.html 使用本地库 (`libs/vue.global.js?v=1.0.1`)
- [ ] manifest.json 版本是 1.0.1
- [ ] 按 Ctrl+Shift+R 刷新了 popup
- [ ] 控制台没有 CSP 错误
- [ ] 界面正常显示
- [ ] 深色模式可切换
- [ ] 图表正常渲染

---

**状态**: ✅ 已添加版本号，强制浏览器刷新缓存
