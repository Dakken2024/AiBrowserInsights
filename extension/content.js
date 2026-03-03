/**
 * Browser Insights - Content Script
 * 增强的内容提取和用户交互
 */

(function() {
  'use strict';
  
  // 页面信息缓存
  let pageInfoCache = null;
  
  // 监听消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PAGE_LOADED') {
      extractPageInfo();
    } else if (message.type === 'EXTRACT_CONTENT') {
      const content = extractPageContent();
      sendResponse({ content });
    } else if (message.type === 'GET_PAGE_INFO') {
      sendResponse({ pageInfo: pageInfoCache });
    }
    return true;
  });
  
  // 提取页面信息
  function extractPageInfo() {
    pageInfoCache = {
      url: window.location.href,
      title: document.title,
      description: getMetaContent('description'),
      keywords: getMetaContent('keywords'),
      author: getMetaContent('author'),
      ogType: getMetaContent('og:type'),
      ogTitle: getMetaContent('og:title'),
      ogDescription: getMetaContent('og:description'),
      ogImage: getMetaContent('og:image'),
      articlePublishedTime: getMetaContent('article:published_time'),
      readingTime: estimateReadingTime(),
      wordCount: countWords(),
      mainLanguage: detectLanguage(),
      contentType: detectContentType(),
      extractedAt: Date.now()
    };
    
    // 发送给 background
    chrome.runtime.sendMessage({
      type: 'PAGE_INFO_EXTRACTED',
      pageInfo: pageInfoCache
    }).catch(() => {});
    
    console.log('Browser Insights: 页面信息已提取', pageInfoCache);
  }
  
  // 提取页面主要内容
  function extractPageContent() {
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
    let content = '';
    
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text.length > 50) {
        content += text + '\n\n';
      }
    });
    
    // 限制长度
    if (content.length > 10000) {
      content = content.substring(0, 10000);
    }
    
    return content;
  }
  
  // 获取 meta 标签内容
  function getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"]`) ||
                 document.querySelector(`meta[property="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  }
  
  // 估算阅读时间
  function estimateReadingTime() {
    const words = countWords();
    return Math.ceil(words / 200);
  }
  
  // 统计字数
  function countWords() {
    const bodyText = document.body?.innerText || '';
    return bodyText.trim().split(/\s+/).length;
  }
  
  // 检测语言
  function detectLanguage() {
    const htmlLang = document.documentElement.lang;
    if (htmlLang) return htmlLang;
    
    const bodyText = document.body?.innerText || '';
    const chineseChars = (bodyText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (bodyText.match(/[a-zA-Z]+/g) || []).length;
    
    return chineseChars > englishWords ? 'zh' : 'en';
  }
  
  // 检测内容类型
  function detectContentType() {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    
    const patterns = {
      'development': ['github', 'stackoverflow', 'gitlab', 'bitbucket'],
      'video': ['youtube', 'bilibili', 'vimeo', 'twitch'],
      'article': ['medium', 'zhihu', 'jianshu', 'substack'],
      'news': ['news', 'xinwen', '36kr', 'huxiu'],
      'social': ['twitter', 'weibo', 'facebook', 'linkedin'],
      'shopping': ['amazon', 'taobao', 'jd', 'ebay'],
      'tutorial': ['tutorial', 'jiaocheng', 'guide', 'docs'],
      'blog': ['blog', 'boke', 'wordpress']
    };
    
    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(kw => url.includes(kw) || title.includes(kw))) {
        return type;
      }
    }
    
    return 'general';
  }
  
  // 延迟执行
  setTimeout(extractPageInfo, 1000);
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      extractPageInfo();
    }
  });
  
})();
