/**
 * Browser Insights - Background Service Worker
 * 优化的后台服务：数据收集、右键菜单、通知
 */

const CONFIG = {
  backendUrl: 'http://localhost:8001',
  syncInterval: 30,
  maxHistoryItems: 1000
};

// 初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Browser Insights 已安装:', details.reason);
  
  await initializeStorage();
  await createContextMenu();
  await chrome.alarms.create('syncData', { periodInMinutes: CONFIG.syncInterval });
  
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'popup.html?welcome=true' });
  }
});

// 初始化存储
async function initializeStorage() {
  const data = await chrome.storage.local.get(['browseHistory', 'settings', 'analysisHistory']);
  
  if (!data.browseHistory) {
    await chrome.storage.local.set({ browseHistory: [] });
  }
  
  if (!data.settings) {
    await chrome.storage.local.set({
      settings: {
        apiKey: '',
        apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
        ttsApiKey: '',
        keywords: [],
        defaultTTS: 'tts-edge',
        defaultVoice: 'zh-CN-Yunxi',
        dataRetention: '30',
        autoAnalyze: false,
        notificationsEnabled: true
      }
    });
  }
  
  if (!data.analysisHistory) {
    await chrome.storage.local.set({ analysisHistory: [] });
  }
}

// 创建右键菜单
async function createContextMenu() {
  try {
    chrome.contextMenus.removeAll();
    
    chrome.contextMenus.create({
      id: 'analyze-page',
      title: '使用 Browser Insights 分析此页',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'add-to-keywords',
      title: '将选中文字添加到关注关键词',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'quick-summary',
      title: '快速生成页面摘要',
      contexts: ['page']
    });
  } catch (error) {
    console.error('创建菜单失败:', error);
  }
}

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'analyze-page') {
    await analyzeCurrentPage(tab);
  } else if (info.menuItemId === 'add-to-keywords') {
    await addKeywordFromSelection(info.selectionText);
  } else if (info.menuItemId === 'quick-summary') {
    await generateQuickSummary(tab);
  }
});

// 分析当前页面
async function analyzeCurrentPage(tab) {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || {};
    
    if (!settings.apiKey) {
      showNotification('API 密钥未配置', '请先在设置中配置 API 密钥');
      chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/popup.html#settings' });
      return;
    }
    
    const pageData = {
      title: tab.title,
      url: tab.url,
      visitTime: Date.now()
    };
    
    const response = await fetch(`${CONFIG.backendUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browse_history: [pageData],
        keywords: settings.keywords || [],
        api_key: settings.apiKey,
        api_endpoint: settings.apiEndpoint
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification('分析完成', result.summary.substring(0, 50) + '...');
    }
  } catch (error) {
    showNotification('分析失败', error.message);
  }
}

// 添加关键词
async function addKeywordFromSelection(text) {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || {};
    
    if (!settings.keywords) settings.keywords = [];
    
    const keywords = text.split(/\s+/).filter(k => k.length > 0);
    let added = 0;
    
    keywords.forEach(kw => {
      if (!settings.keywords.includes(kw)) {
        settings.keywords.push(kw);
        added++;
      }
    });
    
    if (added > 0) {
      await chrome.storage.local.set({ settings });
      showNotification('关键词已添加', `添加了 ${added} 个关键词`);
    } else {
      showNotification('提示', '关键词已存在');
    }
  } catch (error) {
    showNotification('添加失败', error.message);
  }
}

// 快速生成页面摘要
async function generateQuickSummary(tab) {
  try {
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_CONTENT' }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        showNotification('提示', '无法提取页面内容');
        return;
      }
      
      const data = await chrome.storage.local.get(['settings']);
      const settings = data.settings || {};
      
      if (!settings.apiKey) {
        showNotification('API 密钥未配置', '请先配置 API 密钥');
        return;
      }
      
      showNotification('生成中', '正在生成页面摘要...');
      
      // 调用 API 生成摘要
      const result = await fetch(`${CONFIG.backendUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          browse_history: [{ title: tab.title, url: tab.url, content: response.content }],
          keywords: settings.keywords || [],
          api_key: settings.apiKey,
          api_endpoint: settings.apiEndpoint
        })
      });
      
      if (result.ok) {
        const analysis = await result.json();
        showNotification('页面摘要', analysis.summary.substring(0, 100) + '...');
      }
    });
  } catch (error) {
    showNotification('生成失败', error.message);
  }
}

// 监听历史更新
chrome.history.onVisited.addListener(async (visitItem) => {
  try {
    await recordVisit(visitItem);
  } catch (error) {
    console.error('记录访问失败:', error);
  }
});

// 记录访问
async function recordVisit(visitItem) {
  const data = await chrome.storage.local.get(['browseHistory']);
  let history = data.browseHistory || [];
  
  const record = {
    id: visitItem.id,
    url: visitItem.url,
    title: visitItem.title || '无标题',
    visitTime: visitItem.lastVisitTime,
    recordedAt: Date.now()
  };
  
  history.unshift(record);
  
  if (history.length > CONFIG.maxHistoryItems) {
    history = history.slice(0, CONFIG.maxHistoryItems);
  }
  
  await chrome.storage.local.set({ browseHistory: history });
  
  chrome.runtime.sendMessage({
    type: 'HISTORY_UPDATED',
    payload: { record, total: history.length }
  }).catch(() => {});
}

// 定时同步
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncData') {
    await performSync();
  }
});

// 执行同步
async function performSync() {
  try {
    const data = await chrome.storage.local.get(['browseHistory', 'settings']);
    const settings = data.settings || {};
    
    if (settings.autoAnalyze && settings.apiKey && data.browseHistory.length > 0) {
      await analyzeBrowsingData(data.browseHistory, settings);
    }
    
    // 清理旧数据
    await cleanupOldData(settings.dataRetention);
    
    console.log('数据同步完成');
  } catch (error) {
    console.error('同步失败:', error);
  }
}

// 分析浏览数据
async function analyzeBrowsingData(history, settings) {
  try {
    const response = await fetch(`${CONFIG.backendUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browse_history: history.slice(0, 50),
        keywords: settings.keywords || [],
        api_key: settings.apiKey,
        api_endpoint: settings.apiEndpoint
      })
    });
    
    if (!response.ok) throw new Error('分析失败');
    
    const analysis = await response.json();
    
    const analysisData = await chrome.storage.local.get(['analysisHistory']);
    const analysisHistory = analysisData.analysisHistory || [];
    analysisHistory.unshift({
      ...analysis,
      createdAt: Date.now()
    });
    
    await chrome.storage.local.set({ analysisHistory });
    
    if (settings.notificationsEnabled) {
      showNotification('AI 分析完成', analysis.summary.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('AI 分析失败:', error);
  }
}

// 清理旧数据
async function cleanupOldData(retention) {
  if (retention === 'unlimited') return;
  
  const days = parseInt(retention) || 30;
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  const data = await chrome.storage.local.get(['browseHistory']);
  const history = (data.browseHistory || []).filter(item => {
    const itemTime = item.visitTime || item.recordedAt;
    return itemTime >= cutoff;
  });
  
  if (history.length !== data.browseHistory.length) {
    await chrome.storage.local.set({ browseHistory: history });
    console.log(`清理了 ${data.browseHistory.length - history.length} 条旧记录`);
  }
}

// 显示通知
function showNotification(title, message) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: title,
      message: message
    });
  }
}

// 消息监听
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;
});

// 处理消息
async function handleMessage(message, sender, sendResponse) {
  console.log('收到消息:', message);
  
  try {
    switch (message.type) {
      case 'GET_HISTORY':
        const data = await chrome.storage.local.get(['browseHistory']);
        sendResponse({ success: true, data: data.browseHistory || [] });
        break;
        
      case 'GET_SETTINGS':
        const settingsData = await chrome.storage.local.get(['settings']);
        sendResponse({ success: true, settings: settingsData.settings || {} });
        break;
        
      case 'SAVE_SETTINGS':
        await chrome.storage.local.set({ settings: message.settings });
        sendResponse({ success: true });
        break;
        
      case 'CLEAR_HISTORY':
        await chrome.storage.local.set({ browseHistory: [] });
        sendResponse({ success: true });
        break;
        
      case 'EXPORT_DATA':
        const exportData = await chrome.storage.local.get(['browseHistory', 'analysisHistory', 'settings']);
        sendResponse({ success: true, data: exportData });
        break;
        
      default:
        sendResponse({ success: false, error: '未知消息类型' });
    }
  } catch (error) {
    console.error('消息处理失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'PAGE_LOADED',
        url: tab.url,
        title: tab.title
      });
    } catch (error) {
      // Content script 可能未注入
    }
  }
});

console.log('Browser Insights Background Service 已启动 🚀');
