# Browser Insights 开发指南

## 项目架构

```
AiBrowserInsights/
├── server/              # FastAPI 后端
├── extension/           # Chrome/Edge 扩展
└── frontend/            # Vue3 独立应用
```

## 开发环境设置

### 1. 后端开发

```bash
cd server
pip install -r requirements.txt
python main.py
```

访问 http://localhost:8000/docs 查看 API 文档

### 2. 扩展开发

1. 加载扩展：`chrome://extensions/`
2. 启用开发者模式
3. 加载 `extension` 目录
4. 修改代码后点击刷新按钮

### 3. 前端开发

```bash
cd frontend
npm install
npm run dev
```

## API 接口

### POST /api/analyze
分析浏览数据

```json
{
  "browse_history": [],
  "keywords": [],
  "api_key": "sk-xxx",
  "api_endpoint": "https://dashscope.aliyuncs.com/api/v1"
}
```

### POST /api/generate-podcast
生成播客

```json
{
  "analysis_result": {},
  "tts_model": "tts-edge",
  "tts_speed": 1.0
}
```

## 调试技巧

### 扩展调试
- Popup: 右键扩展图标 -> 检查弹出内容
- Background: Service Worker 控制台
- Content: 网页开发者工具

### 后端调试
- 启用 debug 模式
- 查看 `server/data/` 目录数据

## 常见问题

### Q: API 调用失败？
A: 检查 API 密钥配置和网络连接

### Q: 扩展无法加载？
A: 确保 manifest.json 格式正确

### Q: 前端无法连接后端？
A: 检查 CORS 配置和端口
