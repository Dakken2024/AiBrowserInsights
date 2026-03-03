/**
 * 缓存检测脚本
 * 如果检测到使用了 CDN 资源，提示用户刷新
 */

(function() {
  'use strict';
  
  // 检测是否在扩展环境
  const isExtension = window.location.protocol === 'chrome-extension:' || 
                      window.location.protocol === 'edge-extension:';
  
  if (!isExtension) return;
  
  // 检测是否有 CDN 脚本被阻止
  const scripts = document.getElementsByTagName('script');
  let hasCDN = false;
  
  for (let script of scripts) {
    const src = script.src;
    if (src && (src.includes('unpkg.com') || src.includes('jsdelivr.net'))) {
      hasCDN = true;
      console.warn('检测到 CDN 脚本:', src);
      console.warn('请使用本地库文件！');
    }
  }
  
  // 显示提示
  if (hasCDN || !window.Vue) {
    showWarning();
  }
  
  function showWarning() {
    // 创建提示框
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-size: 14px;
      max-width: 90%;
    `;
    
    warning.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">
        ⚠️ 检测到缓存问题
      </div>
      <div style="margin-bottom: 12px;">
        浏览器缓存了旧版本，请按 <strong>Ctrl + Shift + R</strong> 强制刷新
      </div>
      <button onclick="this.parentElement.remove()" style="
        background: white;
        color: #ff4444;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">
        我知道了
      </button>
    `;
    
    document.body.appendChild(warning);
    
    // 5 秒后自动消失
    setTimeout(() => {
      if (warning.parentElement) {
        warning.remove();
      }
    }, 10000);
  }
  
  // 监听 Vue 是否加载
  let checkCount = 0;
  const checkInterval = setInterval(() => {
    checkCount++;
    
    if (window.Vue) {
      clearInterval(checkInterval);
      console.log('✅ Vue 加载成功');
    } else if (checkCount > 10) {
      clearInterval(checkInterval);
      console.error('❌ Vue 加载失败，请检查 libs/vue.global.js 是否存在');
    }
  }, 100);
  
})();
