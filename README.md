# Browser Insights - 智能浏览分析扩展 

一个功能完整的 Edge/Chrome 浏览器扩展程序，使用 AI 技术分析您的浏览习惯，生成智能报告和语音播客。
持续使用AI Coding完善，介意勿看！

## 🎯 核心功能

### 1. 网页数据收集模块
- ✅ 自动记录用户每日浏览的网页链接及元数据（标题、访问时间、页面摘要）
- ✅ 数据本地存储与定期同步机制
- ✅ 符合浏览器扩展开发规范及用户隐私保护

### 2. AI 分析与内容处理系统
- ✅ 基于 FastAPI 构建后端服务
- ✅ 集成 Qwen3.5 大语言模型 API
- ✅ 网页内容智能分析（主题识别、分类、关键信息提取）
- ✅ 支持自定义关注关键词设置

### 3. 个性化配置中心
- ✅ 大模型 API 密钥管理界面
- ✅ 语音合成引擎选择（默认 tts-edge，支持 Azure 等）
- ✅ 分析深度、分类方式等偏好设置

### 4. 内容输出与导出功能
- ✅ 生成结构化语音播客（支持播放控制）
- ✅ PDF 和 Markdown 格式文档导出
- ✅ 历史记录管理功能

## 📁 项目结构

```
AiBrowserInsights/
├── server/                 # FastAPI 后端服务
│   ├── main.py            # 主应用文件
│   ├── requirements.txt   # Python 依赖
│   └── data/              # 数据存储目录（运行时创建）
│
├── extension/             # Chrome/Edge 扩展
│   ├── manifest.json      # 扩展配置文件
│   ├── background.js      # 后台服务脚本
│   ├── content.js         # 内容脚本
│   ├── popup.html         # 弹出窗口 UI
│   ├── popup.js           # 弹出窗口逻辑
│   └── icons/             # 图标资源
│       └── icon.svg
│
├── frontend/              # Vue3 独立前端应用
│   ├── src/
│   │   ├── main.js        # 应用入口
│   │   ├── App.vue        # 根组件
│   │   ├── MainLayout.vue # 主布局
│   │   ├── router/        # 路由配置
│   │   ├── views/         # 页面视图
│   │   │   ├── Dashboard.vue
│   │   │   ├── Analysis.vue
│   │   │   ├── Podcast.vue
│   │   │   └── Settings.vue
│   │   ├── stores/        # Pinia 状态管理
│   │   └── assets/        # 静态资源
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── demo.html              # 演示页面
```

## 🚀 快速开始

### 1. 启动后端服务

```bash
cd server
pip install -r requirements.txt
python main.py
```

后端服务将在 `http://localhost:8001` 启动

### 2. 安装浏览器扩展

#### Chrome/Edge:
1. 打开浏览器，进入 `chrome://extensions/` 或 `edge://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `extension` 目录
5. 扩展图标将出现在浏览器工具栏

### 3. 运行独立前端（可选）

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

## ⚙️ 配置说明

### API 密钥配置
1. 点击扩展图标打开设置页面
2. 输入您的阿里云 DashScope API 密钥
3. 保存设置

### 关注关键词
- 在设置页面添加您关注的关键词
- AI 分析时会重点关注相关内容

### TTS 设置
- 默认使用 Microsoft TTS Edge（免费）
- 支持 Azure Neural TTS 等付费服务

## 🔒 隐私保护

- 所有数据存储在本地（浏览器存储）
- API 密钥仅保存在用户本地
- 不会收集或上传用户浏览数据
- 符合浏览器扩展安全规范

## 🛠️ 技术栈

### 后端
- Python 3.12+
- FastAPI
- Qwen3.5 API (阿里云 DashScope)

### 前端
- Vue 3.4.21
- Vite 5.x
- Pinia (状态管理)
- Vue Router

### 扩展
- Manifest V3
- Chrome Extension APIs
- Web Speech API (TTS)

## 📊 质量标准

- ✅ **浏览器兼容性**: 支持最新版 Chrome 和 Edge
- ✅ **响应性能**: 分析和生成操作响应时间 < 10 秒
- ✅ **稳定性**: 优化资源占用，无内存泄漏
- ✅ **用户体验**: 界面直观，关键功能操作步骤 ≤ 3 步

## 🎮 使用指南

### 查看浏览统计
1. 点击扩展图标
2. 在"仪表盘"标签页查看今日访问、高频域名等统计

### 生成 AI 分析
1. 切换到"AI 分析"标签页
2. 点击"生成分析"按钮
3. 查看 AI 生成的总结和详细报告

### 收听播客
1. 切换到"播客"标签页
2. 点击"重新生成"生成语音播客
3. 使用播放控制收听

### 导出报告
1. 在"AI 分析"页面生成分析后
2. 点击"导出 PDF"或"导出 Markdown"
3. 报告将自动下载

## 📝 注意事项

1. 需要自备阿里云 DashScope API 密钥
2. 首次使用请先配置 API 密钥
3. 建议定期清理浏览数据以保持性能
4. 播客功能使用浏览器自带的 Web Speech API

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📧 联系方式

如有问题或建议，请提交 Issue。
