<template>
  <div class="nav-container">
    <div class="nav-header">
      <h1>
        <div class="header-icon">🎧</div>
        Browser Insights
      </h1>
      <span class="badge">v1.0.0</span>
    </div>
    
    <div class="nav-tabs">
      <router-link to="/" class="nav-tab" active-class="active">
        📊 仪表盘
      </router-link>
      <router-link to="/analysis" class="nav-tab" active-class="active">
        🤖 AI 分析
      </router-link>
      <router-link to="/podcast" class="nav-tab" active-class="active">
        🎙️ 播客
      </router-link>
      <router-link to="/settings" class="nav-tab" active-class="active">
        ⚙️ 设置
      </router-link>
    </div>
  </div>
  
  <div class="content-container">
    <router-view />
  </div>
</template>

<script setup>
// 主应用布局
</script>

<style scoped>
.nav-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-bottom: 20px;
}

.nav-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-header h1 {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.nav-tabs {
  display: flex;
  background: #f8f9fc;
  border-bottom: 1px solid #e8ecf1;
}

.nav-tab {
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.3s ease;
  position: relative;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-tab:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.nav-tab.active {
  color: #667eea;
  background: white;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px 3px 0 0;
}

.content-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 32px;
  min-height: 600px;
}
</style>
