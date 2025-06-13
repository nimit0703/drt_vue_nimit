import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import SelectedPage from '../pages/SelectedPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/selected', component: SelectedPage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
