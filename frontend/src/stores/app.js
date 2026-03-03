import { defineStore } from 'pinia'
import axios from 'axios'

export const useAppStore = defineStore('app', {
  state: () => ({
    browseHistory: [],
    settings: {
      apiKey: '',
      apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
      ttsApiKey: '',
      keywords: [],
      defaultTTS: 'tts-edge',
      defaultVoice: 'zh-CN-Yunxi',
      dataRetention: '30'
    },
    analysisResult: null,
    isLoading: false,
    error: null
  }),
  
  actions: {
    async loadHistory() {
      this.isLoading = true
      try {
        const response = await axios.get('http://localhost:8002/api/data/default')
        this.browseHistory = response.data.browse_history || []
      } catch (error) {
        this.error = '加载历史失败：' + error.message
      } finally {
        this.isLoading = false
      }
    },
    
    async loadSettings() {
      try {
        const saved = localStorage.getItem('browser-insights-settings')
        if (saved) {
          this.settings = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },
    
    async saveSettings() {
      localStorage.setItem('browser-insights-settings', JSON.stringify(this.settings))
    },
    
    async analyze() {
      this.isLoading = true
      this.error = null
      try {
        const response = await axios.post('http://localhost:8002/api/analyze', {
          browse_history: this.browseHistory.slice(0, 50),
          keywords: this.settings.keywords,
          api_key: this.settings.apiKey,
          api_endpoint: this.settings.apiEndpoint
        })
        this.analysisResult = response.data
        return response.data
      } catch (error) {
        this.error = '分析失败：' + error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async generatePodcast(analysisData) {
      try {
        const response = await axios.post('http://localhost:8002/api/generate-podcast', {
          analysis_result: analysisData,
          tts_model: this.settings.defaultTTS,
          tts_speed: 1.0
        })
        return response.data
      } catch (error) {
        throw new Error('播客生成失败：' + error.message)
      }
    }
  }
})
