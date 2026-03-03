"""
下载 Vue 生产版本 (不需要 unsafe-eval)
"""

import requests
import os

def download_file(url, filename):
    """下载文件"""
    print(f'正在下载：{url}')
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f'✓ 已保存到：{filename}')
        return True
    except Exception as e:
        print(f'✗ 下载失败：{e}')
        return False

if __name__ == '__main__':
    # 创建 libs 目录
    libs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libs')
    os.makedirs(libs_dir, exist_ok=True)
    
    # 下载 Vue 生产版本 (使用 runtime-compiled 版本，不需要 eval)
    print('下载 Vue.js 生产版本...')
    download_file(
        'https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js',
        os.path.join(libs_dir, 'vue.global.js')
    )
    
    # 下载 Chart.js
    print('下载 Chart.js...')
    download_file(
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
        os.path.join(libs_dir, 'chart.umd.min.js')
    )
    
    print('\n✅ 下载完成!')
    print(f'库文件位置：{libs_dir}')
    print('\n请刷新扩展页面 (Ctrl+Shift+R)')
