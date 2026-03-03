/**
 * Browser Insights - 纯 JavaScript 实现
 * 不依赖任何外部库，完全符合 CSP 要求
 */

// 状态管理
const state = {
  browseHistory: [],
  settings: {
    apiKey: '',
    apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
    keywords: []
  },
  analysisResult: null,
  isDarkMode: false,
  isPlaying: false,
  progress: 0,
  podcastScript: ''
};

// DOM 元素
const elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  initEventListeners();
  await loadData();
  renderChart();
});

// 初始化 DOM 元素引用
function initElements() {
  elements.todayCount = document.getElementById('todayCount');
  elements.totalHistory = document.getElementById('totalHistory');
  elements.uniqueDomains = document.getElementById('uniqueDomains');
  elements.analysisCount = document.getElementById('analysisCount');
  elements.historyList = document.getElementById('historyList');
  elements.historyCount = document.getElementById('historyCount');
  elements.toast = document.getElementById('toast');
  elements.themeBtn = document.getElementById('themeBtn');
  elements.refreshBtn = document.getElementById('refreshBtn');
  elements.apiKeyInput = document.getElementById('apiKeyInput');
  elements.keywordInput = document.getElementById('keywordInput');
  elements.keywordList = document.getElementById('keywordList');
  elements.progressBar = document.getElementById('progressBar');
  elements.playBtn = document.getElementById('playBtn');
}

// 初始化事件监听器
function initEventListeners() {
  // 标签页切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // 主题切换
  elements.themeBtn.addEventListener('click', toggleTheme);
  document.getElementById('darkModeToggle').addEventListener('click', toggleTheme);

  // 刷新
  elements.refreshBtn.addEventListener('click', async () => {
    await loadData();
    showToast('数据已刷新');
  });

  // 分析
  document.getElementById('analyzeBtn').addEventListener('click', generateAnalysis);

  // 播客
  document.getElementById('generatePodcastBtn').addEventListener('click', generatePodcast);
  elements.playBtn.addEventListener('click', togglePlay);
  document.getElementById('skipBackBtn').addEventListener('click', () => {
    state.progress = Math.max(0, state.progress - 10);
    updateProgress();
  });
  document.getElementById('skipForwardBtn').addEventListener('click', () => {
    state.progress = Math.min(100, state.progress + 10);
    updateProgress();
  });

  // 设置
  document.getElementById('addKeywordBtn').addEventListener('click', addKeyword);
  elements.keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeyword();
  });
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('clearDataBtn').addEventListener('click', clearData);
  document.getElementById('exportDataBtn').addEventListener('click', exportData);
  document.getElementById('exportPdfBtn').addEventListener('click', exportPDF);
  document.getElementById('exportMdBtn').addEventListener('click', exportMarkdown);

  // 加载主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    state.isDarkMode = true;
    applyTheme();
  }
}

// 切换标签页
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.remove('hidden');
}

// 切换主题
function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;
  localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
  applyTheme();
  renderChart();
}

// 应用主题
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
  elements.themeBtn.textContent = state.isDarkMode ? '🌙' : '☀️';
  
  const slider = document.getElementById('toggleSlider');
  if (state.isDarkMode) {
    slider.style.transform = 'translateX(22px)';
    slider.textContent = '🌙';
  } else {
    slider.style.transform = 'translateX(0)';
    slider.textContent = '☀️';
  }
}

// 加载数据
async function loadData() {
  try {
    const historyResponse = await sendMessage({ type: 'GET_HISTORY' });
    if (historyResponse.success) {
      state.browseHistory = historyResponse.data || [];
      updateStats();
      renderHistory();
    }

    const settingsResponse = await sendMessage({ type: 'GET_SETTINGS' });
    if (settingsResponse.success) {
      state.settings = settingsResponse.settings || state.settings;
      elements.apiKeyInput.value = state.settings.apiKey || '';
      renderKeywords();
    }

    const savedAnalysis = localStorage.getItem('lastAnalysis');
    if (savedAnalysis) {
      state.analysisResult = JSON.parse(savedAnalysis);
      renderAnalysis();
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

// 更新统计
function updateStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const todayCount = state.browseHistory.filter(item => {
    const itemTime = item.visitTime || item.recordedAt;
    return itemTime >= todayTimestamp;
  }).length;

  const domainCount = {};
  state.browseHistory.forEach(item => {
    try {
      const domain = new URL(item.url).hostname;
      domainCount[domain] = (domainCount[domain] || 0) + 1;
    } catch (e) {}
  });

  elements.todayCount.textContent = todayCount;
  elements.totalHistory.textContent = state.browseHistory.length;
  elements.uniqueDomains.textContent = Object.keys(domainCount).length;
  elements.analysisCount.textContent = '0';
}

// 渲染历史记录
function renderHistory() {
  const history = state.browseHistory.slice(0, 10);
  elements.historyCount.textContent = `${history.length} 条`;

  if (history.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div>暂无浏览记录</div>
      </div>
    `;
    return;
  }

  elements.historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-icon">🌐</div>
      <div class="history-info">
        <div class="history-title">${escapeHtml(item.title || '无标题')}</div>
        <div class="history-url">${escapeHtml(item.url)}</div>
      </div>
      <div class="history-time">${formatTime(item.visitTime)}</div>
    </div>
  `).join('');
}

// 渲染图表 (使用 Canvas API)
function renderChart() {
  const canvas = document.getElementById('trendChart');
  const ctx = canvas.getContext('2d');
  
  // 设置 canvas 尺寸
  canvas.width = canvas.parentElement.clientWidth - 32;
  canvas.height = canvas.parentElement.clientHeight - 32;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 准备数据
  const labels = [];
  const data = [];
  const now = Date.now();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const count = state.browseHistory.filter(item => {
      const itemTime = item.visitTime || item.recordedAt;
      return itemTime >= dayStart.getTime() && itemTime <= dayEnd.getTime();
    }).length;

    data.push(count);
  }

  const maxVal = Math.max(...data, 1);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 绘制网格
  ctx.strokeStyle = state.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // 绘制折线
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
  gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

  ctx.beginPath();
  ctx.moveTo(padding, height - padding);

  data.forEach((val, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = height - padding - (val / maxVal) * chartHeight;
    ctx.lineTo(x, y);
  });

  ctx.lineTo(width - padding, height - padding);
  ctx.fillStyle = gradient;
  ctx.fill();

  // 绘制线条
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = height - padding - (val / maxVal) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 绘制点
  data.forEach((val, i) => {
    const x = padding + (chartWidth / (data.length - 1)) * i;
    const y = height - padding - (val / maxVal) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#667eea';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 绘制标签
  ctx.fillStyle = state.isDarkMode ? '#aeaeb2' : '#6e6e73';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';

  labels.forEach((label, i) => {
    const x = padding + (chartWidth / (labels.length - 1)) * i;
    ctx.fillText(label, x, height - 10);
  });
}

// 生成分析
async function generateAnalysis() {
  if (!state.settings.apiKey) {
    showToast('请先配置 API 密钥');
    switchTab('settings');
    return;
  }

  if (state.browseHistory.length === 0) {
    showToast('暂无浏览记录');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> 分析中...';
  showToast('正在分析...');

  try {
    const response = await fetch('http://localhost:8001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browse_history: state.browseHistory.slice(0, 50),
        keywords: state.settings.keywords || [],
        api_key: state.settings.apiKey,
        api_endpoint: state.settings.apiEndpoint
      })
    });

    if (!response.ok) throw new Error('分析失败');

    state.analysisResult = await response.json();
    localStorage.setItem('lastAnalysis', JSON.stringify(state.analysisResult));
    
    renderAnalysis();
    showToast('分析完成');
  } catch (error) {
    showToast('分析失败: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ 生成分析报告';
  }
}

// 渲染分析结果
function renderAnalysis() {
  if (!state.analysisResult) return;

  document.getElementById('analysisEmpty').classList.add('hidden');
  document.getElementById('analysisResult').classList.remove('hidden');
  document.getElementById('analysisReport').classList.remove('hidden');
  document.getElementById('exportButtons').classList.remove('hidden');

  document.getElementById('analysisSummary').textContent = state.analysisResult.summary;
  
  const keywordsHtml = (state.analysisResult.keywords || [])
    .map(kw => `<span style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:4px 10px;border-radius:12px;font-size:11px;">#${escapeHtml(kw)}</span>`)
    .join('');
  document.getElementById('analysisKeywords').innerHTML = keywordsHtml;

  document.getElementById('reportContent').innerHTML = state.analysisResult.detailed_report || '';
}

// 生成播客
async function generatePodcast() {
  if (!state.analysisResult) {
    showToast('请先生成分析');
    switchTab('analysis');
    return;
  }

  const btn = document.getElementById('generatePodcastBtn');
  btn.disabled = true;
  btn.textContent = '生成中...';
  showToast('正在生成播客...');

  try {
    const response = await fetch('http://localhost:8001/api/generate-podcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_result: state.analysisResult,
        tts_model: 'tts-edge',
        tts_speed: 1.0
      })
    });

    if (!response.ok) throw new Error('生成失败');

    const result = await response.json();
    state.podcastScript = result.script || '';
    
    document.getElementById('podcastDuration').textContent = result.duration || '0 分 0 秒';
    document.getElementById('scriptContent').textContent = state.podcastScript;
    document.getElementById('podcastScript').classList.remove('hidden');
    
    showToast('播客已生成');
  } catch (error) {
    showToast('生成失败: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🎙️ 生成播客';
  }
}

// 播放控制
function togglePlay() {
  state.isPlaying = !state.isPlaying;
  elements.playBtn.textContent = state.isPlaying ? '⏸' : '▶';
  
  if (state.isPlaying) {
    startPlayback();
  } else {
    stopPlayback();
  }
}

function startPlayback() {
  if (!state.podcastScript) return;

  const utterance = new SpeechSynthesisUtterance(state.podcastScript);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0;

  const voices = speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.includes('zh'));
  if (zhVoice) utterance.voice = zhVoice;

  utterance.onend = () => {
    state.isPlaying = false;
    elements.playBtn.textContent = '▶';
    state.progress = 100;
    updateProgress();
  };

  speechSynthesis.speak(utterance);

  state.progressInterval = setInterval(() => {
    state.progress += 1;
    updateProgress();
    if (state.progress >= 100) clearInterval(state.progressInterval);
  }, 100);
}

function stopPlayback() {
  speechSynthesis.cancel();
  if (state.progressInterval) clearInterval(state.progressInterval);
}

function updateProgress() {
  elements.progressBar.style.width = state.progress + '%';
}

// 关键词管理
function addKeyword() {
  const keyword = elements.keywordInput.value.trim();
  if (keyword && !state.settings.keywords.includes(keyword)) {
    state.settings.keywords.push(keyword);
    elements.keywordInput.value = '';
    renderKeywords();
    showToast('关键词已添加');
  }
}

function removeKeyword(index) {
  state.settings.keywords.splice(index, 1);
  renderKeywords();
  showToast('关键词已删除');
}

function renderKeywords() {
  if (!state.settings.keywords || state.settings.keywords.length === 0) {
    elements.keywordList.innerHTML = '';
    return;
  }

  elements.keywordList.innerHTML = state.settings.keywords.map((kw, i) => `
    <div class="keyword-item">
      ${escapeHtml(kw)}
      <span class="keyword-remove" onclick="removeKeyword(${i})">✕</span>
    </div>
  `).join('');
}

// 保存设置
async function saveSettings() {
  state.settings.apiKey = elements.apiKeyInput.value;
  await sendMessage({ type: 'SAVE_SETTINGS', settings: state.settings });
  showToast('设置已保存');
}

// 清除数据
async function clearData() {
  if (confirm('确定清除所有数据？')) {
    await sendMessage({ type: 'CLEAR_HISTORY' });
    state.browseHistory = [];
    updateStats();
    renderHistory();
    showToast('数据已清除');
  }
}

// 导出数据
async function exportData() {
  const response = await sendMessage({ type: 'EXPORT_DATA' });
  if (response.success) {
    downloadFile('browser-insights-data.json', JSON.stringify(response.data, null, 2));
    showToast('数据已导出');
  }
}

// 导出 PDF
function exportPDF() {
  if (!state.analysisResult) {
    showToast('请先生成分析');
    return;
  }
  const content = `# Browser Insights 分析报告\n\n## 摘要\n${state.analysisResult.summary}\n\n## 关键词\n${state.analysisResult.keywords?.join(', ')}`;
  downloadFile('analysis.txt', content);
  showToast('已导出');
}

// 导出 Markdown
function exportMarkdown() {
  if (!state.analysisResult) {
    showToast('请先生成分析');
    return;
  }
  const md = `# Browser Insights\n\n## 摘要\n${state.analysisResult.summary}\n\n## 详细报告\n${state.analysisResult.detailed_report || ''}`;
  downloadFile('analysis.md', md);
  showToast('已导出');
}

// 工具函数
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

function formatTime(timestamp) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
