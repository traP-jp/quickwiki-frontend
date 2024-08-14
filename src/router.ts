import { createRouter, createWebHistory } from 'vue-router'
import MyWiki from './pages/MyWiki.vue'
import NotFound from './pages/NotFound.vue'
import CreateSodan from './pages/CreateSodan.vue'
import IndividualSodan from './pages/IndividualSodan.vue'
import Lectures from './pages/Lectures.vue'
import Wiki from './pages/Wiki.vue'
import MyWiki from './pages/MyWiki.vue'
import LikeWiki from './pages/LikeWiki.vue'
import MySodan from './pages/MySodan.vue'
import Search from './pages/Search.vue'
import CreateMemo from './pages/CreateMemo.vue'
import ApiTest from './pages/ApiTest.vue'
import API_URL from ''

const routes = [
  { path: '/mywiki', name: 'mywiki', component: MyWiki },
  { path: '/createsodan', name: 'createsodan', component: CreateSodan },
  { path: '/sodan/:id', name: 'individualsodan', component: IndividualSodan },
  { path: '/search', name: 'search', component: Search },
  { path: '/lectures/:teams', name: 'teamlectures', component: Lectures},
  { path: '/wiki', name: 'wiki', component: Wiki, children: [
        {
          path: 'mywiki',
          component: MyWiki
        },
        {
          path: 'like',
          component: LikeWiki
        },
        {
          path: 'search',
          component: Search
        }
      ] },
  { path: '/lectures', name: 'lectures', component: Lectures },
  { path: '/mysodan', name: 'mysodan', component: MySodan },
  { path: '/creatememo', name: 'creatememo', component: CreateMemo },
  { path: '/apitest', name: 'apitest', component: ApiTest },
  { path: '/:path(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router