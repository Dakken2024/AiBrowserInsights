import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Analysis from '../views/Analysis.vue'
import Podcast from '../views/Podcast.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/analysis', name: 'Analysis', component: Analysis },
  { path: '/podcast', name: 'Podcast', component: Podcast },
  { path: '/settings', name: 'Settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
