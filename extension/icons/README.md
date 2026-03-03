# 图标文件说明

## 问题原因
Edge/Chrome 浏览器要求 manifest.json 中引用的所有图标文件必须实际存在。

## 解决方案
已生成 PNG 格式的图标文件 `icon.png` (128x128)

## 图标文件位置
```
extension/icons/
├── icon.png       ✅ 主图标 (128x128)
├── icon.svg       SVG 版本
├── generate_icon.py   Python 生成脚本
└── create-icon.html   HTML 生成工具
```

## manifest.json 配置
```json
{
  "icons": {
    "16": "icons/icon.png",
    "48": "icons/icon.png",
    "128": "icons/icon.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon.png",
      "48": "icons/icon.png",
      "128": "icons/icon.png"
    }
  }
}
```

## 重新生成图标
如果需要修改图标设计，可以:

1. 使用 Python 脚本:
   ```bash
   cd extension/icons
   python generate_icon.py
   ```

2. 使用 HTML 工具:
   - 在浏览器中打开 `create-icon.html`
   - 自动下载生成的图标

## 图标设计
- 尺寸：128x128 像素
- 背景：紫色渐变 (#667eea → #764ba2)
- 前景：白色耳机 emoji (🎧)
- 圆角：24px

## 安装步骤
1. 确保 `icons/icon.png` 文件存在
2. 打开 Edge/Chrome 浏览器
3. 访问 `edge://extensions/` 或 `chrome://extensions/`
4. 启用"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择 `extension` 文件夹
7. 扩展应该正常加载

## 常见问题

### Q: 图标不显示？
A: 检查文件路径是否正确，确保 icon.png 在 icons 文件夹中

### Q: 扩展加载失败？
A: 查看浏览器控制台的错误信息，确认所有引用文件都存在

### Q: 想使用自定义图标？
A: 修改 `generate_icon.py` 中的绘制逻辑，然后重新运行
