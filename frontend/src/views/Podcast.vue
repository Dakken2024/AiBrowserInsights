<template>
  <div class="podcast">
    <div class="podcast-player">
      <div class="podcast-header">
        <div class="podcast-cover">🎙️</div>
        <div class="podcast-info">
          <h3>{{ podcastTitle }}</h3>
          <p>{{ podcastDuration }} • {{ podcastDate }}</p>
        </div>
      </div>
      <div class="progress-bar" @click="seekProgress">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="player-controls">
        <button class="control-btn" @click="skipBackward">⏮</button>
        <button class="control-btn play-btn" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="control-btn" @click="skipForward">⏭</button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">🎧 播客文稿</div>
      <div class="script-content">{{ podcastScript }}</div>
    </div>

    <div class="section-card">
      <div class="section-title">⚙️ TTS 设置</div>
      <div class="form-group">
        <label class="form-label">语音模型</label>
        <select class="select-input" v-model="ttsModel">
          <option value="tts-edge">Microsoft TTS Edge (默认)</option>
          <option value="azure-neural">Azure Neural - zh-CN-Yunxi</option>
          <option value="azure-neural-xiaoxiao">Azure Neural - zh-CN-Xiaoxiao</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">语速</label>
        <input type="range" class="form-input" v-model="ttsSpeed" min="0.5" max="2" step="0.1">
        <div class="speed-labels">
          <span>0.5x</span>
          <span>{{ ttsSpeed }}x</span>
          <span>2.0x</span>
        </div>
      </div>
      <button class="btn btn-primary" @click="generatePodcast" :disabled="isGeneratingPodcast">
        <span v-if="isGeneratingPodcast" class="loading-spinner"></span>
        <span v-else>🎙️ 重新生成</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const isPlaying = ref(false)
const isGeneratingPodcast = ref(false)
const progress = ref(0)
const ttsModel = ref('tts-edge')
const ttsSpeed = ref(1.0)
const podcastTitle = ref('每日浏览摘要')
const podcastDuration = ref('0 分 0 秒')
const podcastDate = ref(new Date().toLocaleDateString('zh-CN'))
const podcastScript = ref('')
const currentUtterance = ref(null)
const progressInterval = ref(null)

const generatePodcast = async () => {
  if (!appStore.analysisResult) {
    alert('请先生成分析报告')
    return
  }
  
  isGeneratingPodcast.value = true
  try {
    const result = await appStore.generatePodcast(appStore.analysisResult)
    podcastScript.value = result.script || ''
    podcastDuration.value = result.duration || '0 分 0 秒'
  } catch (error) {
    alert(error.message)
  } finally {
    isGeneratingPodcast.value = false
  }
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayback()
  } else {
    stopPlayback()
  }
}

const startPlayback = () => {
  if (!podcastScript.value) return
  
  const utterance = new SpeechSynthesisUtterance(podcastScript.value)
  utterance.lang = 'zh-CN'
  utterance.rate = ttsSpeed.value
  
  const voices = speechSynthesis.getVoices()
  const zhVoice = voices.find(voice => voice.lang.includes('zh'))
  if (zhVoice) {
    utterance.voice = zhVoice
  }
  
  utterance.onend = () => {
    isPlaying.value = false
    progress.value = 100
  }
  
  speechSynthesis.speak(utterance)
  currentUtterance.value = utterance
  
  progressInterval.value = setInterval(() => {
    progress.value += 1
    if (progress.value >= 100) {
      clearInterval(progressInterval.value)
    }
  }, (100 / (podcastScript.value.length / 20)) * ttsSpeed.value)
}

const stopPlayback = () => {
  if (currentUtterance.value) {
    speechSynthesis.cancel()
    currentUtterance.value = null
  }
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
}

const skipBackward = () => {
  progress.value = Math.max(0, progress.value - 10)
}

const skipForward = () => {
  progress.value = Math.min(100, progress.value + 10)
}

const seekProgress = (event) => {
  const rect = event.target.getBoundingClientRect()
  const x = event.clientX - rect.left
  progress.value = (x / rect.width) * 100
}

onMounted(() => {
  appStore.loadSettings()
})

onUnmounted(() => {
  stopPlayback()
})
</script>

<style scoped>
.podcast {
  padding: 20px;
}

.podcast-player {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
}

.podcast-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.podcast-cover {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.podcast-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.podcast-info p {
  font-size: 13px;
  opacity: 0.8;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: 20px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  width: 35%;
  transition: width 0.3s ease;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.control-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.8;
  font-size: 20px;
}

.control-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.play-btn {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #667eea;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
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
  margin-bottom: 16px;
}

.script-content {
  line-height: 1.8;
  color: #475569;
  font-size: 14px;
  max-height: 300px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.speed-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.btn {
  width: 100%;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
