"""
生成浏览器扩展图标
需要安装：pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """创建指定尺寸的图标"""
    # 创建图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 渐变背景 (简化为纯色)
    # 实际渐变需要更复杂的处理
    for y in range(size):
        # 从 #667eea 到 #764ba2 的渐变
        r = int(102 + (118 - 102) * y / size)
        g = int(126 + (75 - 126) * y / size)
        b = int(234 + (162 - 234) * y / size)
        
        # 绘制圆角矩形的一行
        radius = int(size * 0.1875)
        for x in range(size):
            # 检查是否在圆角矩形内
            in_corner = False
            for corner in [(radius, radius), (size-radius, radius), 
                          (radius, size-radius), (size-radius, size-radius)]:
                cx, cy = corner
                if (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2:
                    in_corner = True
                    break
            
            if (x >= radius and x <= size - radius) or \
               (y >= radius and y <= size - radius) or \
               in_corner:
                draw.point((x, y), fill=(r, g, b, 255))
    
    # 添加耳机符号 (用简单的图形代替 emoji)
    center = size // 2
    head_radius = int(size * 0.15)
    ear_width = int(size * 0.08)
    ear_height = int(size * 0.25)
    
    # 绘制头梁 (弧形)
    for i in range(int(size * 0.1), int(size * 0.35)):
        y = center - i
        x_offset = int((head_radius + i * 0.5) * 0.8)
        draw.line([(center - x_offset, y), (center + x_offset, y)], 
                  fill=(255, 255, 255, 255), width=3)
    
    # 绘制左耳罩
    left_x = center - int(size * 0.25)
    draw.rounded_rectangle(
        [(left_x - ear_width, center - ear_height // 2),
         (left_x + ear_width, center + ear_height // 2)],
        radius=ear_width,
        fill=(255, 255, 255, 255)
    )
    
    # 绘制右耳罩
    right_x = center + int(size * 0.25)
    draw.rounded_rectangle(
        [(right_x - ear_width, center - ear_height // 2),
         (right_x + ear_width, center + ear_height // 2)],
        radius=ear_width,
        fill=(255, 255, 255, 255)
    )
    
    # 保存
    img.save(output_path, 'PNG')
    print(f'已生成 {size}x{size} 图标：{output_path}')

if __name__ == '__main__':
    icons_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 生成 128x128 图标
    create_icon(128, os.path.join(icons_dir, 'icon.png'))
    
    print('\n图标生成完成!')
    print('请重新加载扩展')
