import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import NotFound from './pages/NotFound.vue'
import CreateSodan from './pages/CreateSodan.vue'
import IndividualSodan from './pages/IndividualSodan.vue'
import Lectures from './pages/Lectures.vue'
import Wiki from './pages/Wiki.vue'
import MyWiki from './pages/MyWiki.vue'
import LikeWiki from './pages/LikeWiki.vue'
import MySodan from './pages/MySodan.vue'
import CreateMemo from './pages/CreateMemo.vue'
import ApiTest from './pages/ApiTest.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/createsodan', name: 'createsodan', component: CreateSodan },
  { path: '/sodan/:id', name: 'individualsodan', component: IndividualSodan },
  { path: '/wiki', name: 'wiki', component: Wiki, children: [
        {
          path: 'mywiki',
          component: MyWiki
        },
        {
          // /user/:id/posts がマッチした時に
          // UserPosts は User の <router-view> 内部で描画されます
          path: 'like',
          component: LikeWiki
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