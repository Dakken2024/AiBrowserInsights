<template>
  <div class="analysis">
    <div class="section-card">
      <div class="section-title">
        🤖 AI 智能分析
        <button class="btn btn-primary" @click="generateAnalysis" :disabled="isAnalyzing">
          <span v-if="isAnalyzing" class="loading-spinner"></span>
          <span v-else>✨ 生成分析</span>
        </button>
      </div>
      
      <div class="ai-summary" v-if="analysisResult">
        <p>{{ analysisResult.summary }}</p>
        <div class="keyword-tags" v-if="analysisResult.keywords && analysisResult.keywords.length > 0">
          <span class="keyword-tag" v-for="(keyword, index) in analysisResult.keywords" :key="index">
            #{{ keyword }}
          </span>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">🧠</div>
        <p>点击"生成分析"获取 AI 智能总结</p>
      </div>
    </div>

    <div class="section-card" v-if="analysisResult && analysisResult.detailed_report">
      <div class="section-title">📋 详细报告</div>
      <div class="report-content" v-html="analysisResult.detailed_report"></div>
    </div>

    <div class="export-buttons">
      <button class="btn btn-primary" @click="exportPDF">
        📄 导出 PDF
      </button>
      <button class="btn btn-secondary" @click="exportMarkdown">
        📝 导出 Markdown
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const isAnalyzing = ref(false)
const analysisResult = ref(null)

const generateAnalysis = async () => {
  if (!appStore.settings.apiKey) {
    alert('请先配置 API 密钥')
    return
  }
  
  isAnalyzing.value = true
  try {
    const result = await appStore.analyze()
    analysisResult.value = result
  } catch (error) {
    alert(error.message)
  } finally {
    isAnalyzing.value = false
  }
}

const exportPDF = () => {
  if (!analysisResult.value) {
    alert('请先生成分析报告')
    return
  }
  
  const content = `
# Browser Insights - 分析报告

生成时间：${new Date().toLocaleString('zh-CN')}

## 摘要
${analysisResult.value.summary}

## 关键词
${analysisResult.value.keywords?.join(', ') || '无'}

## 详细报告
${analysisResult.value.detailed_report?.replace(/<[^>]*>/g, '') || '无'}
  `.trim()
  
  downloadFile('analysis-report.txt', content)
}

const exportMarkdown = () => {
  if (!analysisResult.value) {
    alert('请先生成分析报告')
    return
  }
  
  const mdContent = `# Browser Insights - 分析报告

**生成时间**: ${new Date().toLocaleString('zh-CN')}

## 📊 摘要

${analysisResult.value.summary}

## 🏷️ 关键词

${analysisResult.value.keywords?.map(k => `- ${k}`).join('\n') || '无'}

## 📋 详细报告

${analysisResult.value.detailed_report || '无'}
  `.trim()
  
  downloadFile('analysis-report.md', mdContent)
}

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  appStore.loadSettings()
})
</script>

<style scoped>
.analysis {
  padding: 20px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-summary {
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.ai-summary p {
  color: #475569;
  line-height: 1.7;
  font-size: 14px;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.keyword-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.report-content {
  line-height: 1.8;
  color: #475569;
  font-size: 14px;
}

.export-buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
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
