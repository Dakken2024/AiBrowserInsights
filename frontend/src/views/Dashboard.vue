<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">今日访问</div>
        <div class="stat-value">{{ todayCount }}</div>
        <div class="stat-sub">总记录：{{ totalHistory }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">高频域名</div>
        <div class="stat-value" style="font-size: 16px;">{{ topDomain }}</div>
        <div class="stat-sub">{{ uniqueDomains }} 个域名</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">内容分类</div>
        <div class="stat-value" style="font-size: 16px;">{{ topCategory }}</div>
        <div class="stat-sub">共 {{ categoriesCount }} 类</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">分析次数</div>
        <div class="stat-value">{{ analysisCount }}</div>
        <div class="stat-sub">最近：{{ lastAnalysis }}</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">
        📑 最近浏览
        <span class="badge">{{ displayHistory.length }} 条</span>
      </div>
      <div class="browse-list" v-if="displayHistory.length > 0">
        <div class="browse-item" v-for="(item, index) in displayHistory" :key="index">
          <div class="browse-icon">🌐</div>
          <div class="browse-info">
            <div class="browse-title">{{ item.title }}</div>
            <div class="browse-url">{{ item.url }}</div>
          </div>
          <div class="browse-time">{{ formatTime(item.visitTime || item.recordedAt) }}</div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">📭</div>
        <p>暂无浏览记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const browseHistory = ref([])
const totalHistory = ref(0)

const displayHistory = computed(() => {
  return browseHistory.value.slice(0, 20)
})

const todayCount = ref(0)
const uniqueDomains = ref(0)
const topDomain = ref('-')
const topCategory = ref('-')
const categoriesCount = ref(0)
const analysisCount = ref(0)
const lastAnalysis = ref('-')

const loadHistory = async () => {
  try {
    const response = await axios.get('http://localhost:8002/api/data/default')
    browseHistory.value = response.data.browse_history || []
    totalHistory.value = browseHistory.value.length
    updateStats()
  } catch (error) {
    console.error('加载历史失败:', error)
  }
}

const updateStats = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()
  
  todayCount.value = browseHistory.value.filter(item => {
    const itemTime = item.visitTime || item.recordedAt
    return itemTime >= todayTimestamp
  }).length
  
  const domainCount = {}
  browseHistory.value.forEach(item => {
    try {
      const domain = new URL(item.url).hostname
      domainCount[domain] = (domainCount[domain] || 0) + 1
    } catch (e) {}
  })
  
  uniqueDomains.value = Object.keys(domainCount).length
  if (Object.keys(domainCount).length > 0) {
    topDomain.value = Object.entries(domainCount).sort((a, b) => b[1] - a[1])[0][0]
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%);
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.1);
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
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
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.browse-list {
  max-height: 400px;
  overflow-y: auto;
}

.browse-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.browse-item:hover {
  background: #f8f9fc;
}

.browse-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.browse-info {
  flex: 1;
  min-width: 0;
}

.browse-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.browse-url {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.browse-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
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
</style>
