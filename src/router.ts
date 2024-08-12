import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import NotFound from './pages/NotFound.vue'
import CreateSodan from './pages/CreateSodan.vue'
import IndividualSodan from './pages/IndividualSodan.vue'
import Lectures from './pages/Lectures.vue'
import Search from './pages/Search.vue'
import MySodan from './pages/MySodan.vue'
import CreateMemo from './pages/CreateMemo.vue'


const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/createsodan', name: 'createsodan', component: CreateSodan },
  { path: '/sodan/:id', name: 'individualsodan', component: IndividualSodan },
  { path: '/search', name: 'search', component: Search },
  { path: '/lectures', name: 'lectures', component: Lectures },
  { path: '/mysodan', name: 'mysodan', component: MySodan },
  { path: '/creatememo', name: 'creatememo', component: CreateMemo },
  { path: '/:path(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router