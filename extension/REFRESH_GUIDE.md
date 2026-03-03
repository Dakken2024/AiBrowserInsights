# 刷新扩展指南

## ⚠️ 重要：必须刷新扩展缓存

浏览器可能缓存了旧版本的 popup.html，导致仍然尝试加载 CDN 的 Vue.js。

## 🔄 刷新步骤

### 方法一：强制刷新 (推荐)

1. **打开扩展 popup**
   - 点击浏览器工具栏的扩展图标 (🎧)

2. **强制刷新页面**
   - 按 `Ctrl + Shift + R` (Windows)
   - 或 `Cmd + Shift + R` (Mac)
   - 这会清除缓存并重新加载

3. **验证成功**
   - 应该能看到界面正常显示
   - 按 F12 打开控制台，应该没有 CSP 错误

### 方法二：重新加载扩展

1. **打开扩展管理页面**
   - Edge: `edge://extensions/`
   - Chrome: `chrome://extensions/`

2. **找到 Browser Insights**

3. **点击刷新按钮**
   - 点击扩展卡片上的刷新图标 🔄

4. **重新打开 popup**
   - 点击工具栏的扩展图标

### 方法三：完全重新加载

1. **关闭所有 popup 窗口**
   - 点击页面外部关闭 popup

2. **刷新扩展**
   - `edge://extensions/` → 刷新 Browser Insights

3. **等待 5 秒**

4. **重新打开 popup**
   - 按 `Ctrl + Shift + P` 打开新 popup 窗口

## ✅ 验证清单

刷新后应该看到:
- [ ] 界面正常显示
- [ ] 深色模式按钮可用 (☀️/🌙)
- [ ] 图表正常渲染
- [ ] 控制台无 CSP 错误
- [ ] 无 "Vue is not defined" 错误

## 🔍 故障排除

### 问题 1: 仍然有 CSP 错误
**原因**: 浏览器缓存了旧 HTML  
**解决**:
```
1. 关闭 popup
2. 按 Ctrl+Shift+R 强制刷新
3. 或清除浏览器缓存
```

### 问题 2: Vue is not defined
**原因**: Vue.js 文件未找到  
**检查**:
- 确认 `extension/libs/vue.global.js` 存在
- 文件大小应该是 ~147KB

### 问题 3: 图表不显示
**原因**: Chart.js 未加载  
**检查**:
- 确认 `extension/libs/chart.umd.min.js` 存在
- 文件大小应该是 ~200KB

## 📁 文件检查

确保以下文件存在:
```
extension/
├── libs/
│   ├── vue.global.js       ✅ 应该存在 (~147KB)
│   └── chart.umd.min.js    ✅ 应该存在 (~200KB)
├── popup.html              ✅ 使用本地库
└── manifest.json           ✅ 版本 1.0.1
```

## 🎯 正确的加载顺序

1. **manifest.json** 加载
2. **popup.html** 加载
3. **libs/vue.global.js** 加载 (本地)
4. **libs/chart.umd.min.js** 加载 (本地)
5. **popup.js** 执行
6. **Vue 应用挂载**

## 💡 提示

- **开发时**: 每次修改 HTML/JS 后都要刷新
- **刷新快捷键**: `Ctrl + Shift + R`
- **清除缓存**: `edge://settings/clearBrowserData`

---

**状态**: ✅ 使用生产版 Vue，不需要 unsafe-eval
