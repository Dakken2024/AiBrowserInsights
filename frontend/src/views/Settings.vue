<template>
  <div class="settings">
    <div class="section-card">
      <div class="section-title">🔑 API 配置</div>
      
      <div class="form-group">
        <label class="form-label">大模型 API 密钥 (Qwen3.5)</label>
        <input type="password" class="form-input" v-model="localSettings.apiKey" placeholder="sk-xxxxxxxxxxxxxxxx">
        <div class="form-help">用于 AI 内容分析和总结</div>
        <div class="api-status" v-if="localSettings.apiKey">
          <div class="status-dot"></div>
          <span class="status-text">已配置</span>
        </div>
        <div class="api-status" v-else>
          <div class="status-dot inactive"></div>
          <span class="status-text">未配置</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">API 端点</label>
        <input type="text" class="form-input" v-model="localSettings.apiEndpoint" placeholder="https://dashscope.aliyuncs.com/api/v1">
        <div class="form-help">默认使用阿里云 DashScope</div>
      </div>

      <div class="form-group">
        <label class="form-label">TTS API 密钥 (可选)</label>
        <input type="password" class="form-input" v-model="localSettings.ttsApiKey" placeholder="用于 Azure/ElevenLabs 等付费 TTS">
        <div class="form-help">如使用默认 TTS Edge 可留空</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">🎯 关注关键词</div>
      <div class="form-group">
        <label class="form-label">添加关键词</label>
        <div class="keyword-input-container">
          <input type="text" class="form-input" v-model="newKeyword" @keyup.enter="addKeyword" placeholder="输入关键词后按回车">
          <button class="btn btn-primary" @click="addKeyword" style="flex-shrink: 0;">添加</button>
        </div>
        <div class="keyword-list" v-if="localSettings.keywords && localSettings.keywords.length > 0">
          <div class="keyword-item" v-for="(keyword, index) in localSettings.keywords" :key="index">
            {{ keyword }}
            <span class="keyword-remove" @click="removeKeyword(index)">✕</span>
          </div>
        </div>
        <div class="form-help" v-else>暂无关键词，添加后 AI 分析会重点关注相关内容</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">🎙️ 语音设置</div>
      <div class="form-group">
        <label class="form-label">默认 TTS 引擎</label>
        <select class="select-input" v-model="localSettings.defaultTTS">
          <option value="tts-edge">Microsoft TTS Edge (免费)</option>
          <option value="azure-neural">Azure Neural TTS</option>
          <option value="elevenlabs">ElevenLabs</option>
          <option value="openai-tts">OpenAI TTS</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">默认语音</label>
        <select class="select-input" v-model="localSettings.defaultVoice">
          <option value="zh-CN-Yunxi">云希 (男声)</option>
          <option value="zh-CN-Xiaoxiao">晓晓 (女声)</option>
          <option value="zh-CN-Yunjian">云健 (男声)</option>
          <option value="zh-CN-Xiaoyi">晓伊 (女声)</option>
        </select>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">📅 数据管理</div>
      <div class="form-group">
        <label class="form-label">数据保留天数</label>
        <select class="select-input" v-model="localSettings.dataRetention">
          <option value="7">7 天</option>
          <option value="14">14 天</option>
          <option value="30">30 天</option>
          <option value="90">90 天</option>
          <option value="unlimited">永久</option>
        </select>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" @click="clearData" style="flex: 1;">
          🗑️ 清除所有数据
        </button>
        <button class="btn btn-secondary" @click="exportData" style="flex: 1;">
          📤 导出数据
        </button>
      </div>
    </div>

    <button class="btn btn-primary save-btn" @click="saveSettings">
      💾 保存设置
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import axios from 'axios'

const appStore = useAppStore()
const newKeyword = ref('')

const localSettings = reactive({
  apiKey: '',
  apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
  ttsApiKey: '',
  keywords: [],
  defaultTTS: 'tts-edge',
  defaultVoice: 'zh-CN-Yunxi',
  dataRetention: '30'
})

const addKeyword = () => {
  if (newKeyword.value.trim() && !localSettings.keywords.includes(newKeyword.value.trim())) {
    localSettings.keywords.push(newKeyword.value.trim())
    newKeyword.value = ''
  }
}

const removeKeyword = (index) => {
  localSettings.keywords.splice(index, 1)
}

const saveSettings = async () => {
  Object.assign(appStore.settings, localSettings)
  await appStore.saveSettings()
  alert('设置已保存！')
}

const clearData = async () => {
  if (confirm('确定要清除所有浏览数据吗？此操作不可恢复。')) {
    try {
      await axios.delete('http://localhost:8002/api/data/default')
      alert('数据已清除')
    } catch (error) {
      alert('清除失败：' + error.message)
    }
  }
}

const exportData = async () => {
  try {
      const response = await axios.get('http://localhost:8002/api/export/default/json')
      const data = JSON.stringify(response.data, null, 2)
      downloadFile('browser-insights-data.json', data)
      alert('数据已导出')
    } catch (error) {
      alert('导出失败：' + error.message)
    }
}

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  appStore.loadSettings()
  Object.assign(localSettings, appStore.settings)
})
</script>

<style scoped>
.settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section-card {
  background: #ffffff;
  border: 1px solid #e8ecf1;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-help {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.status-dot.inactive {
  background: #ef4444;
}

.status-text {
  font-size: 12px;
  color: #22c55e;
}

.status-dot.inactive + .status-text {
  color: #ef4444;
}

.keyword-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-item {
  background: #f1f5f9;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.keyword-remove {
  cursor: pointer;
  color: #94a3b8;
  font-weight: 700;
  transition: color 0.3s ease;
}

.keyword-remove:hover {
  color: #ef4444;
}

.select-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  font-family: inherit;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.save-btn {
  width: 100%;
  margin-top: 16px;
}
</style>
