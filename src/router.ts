import { createRouter, createWebHistory } from 'vue-router'
import NotFound from './pages/NotFound.vue'
import CreateSodan from './pages/CreateSodan.vue'
import IndividualSodan from './pages/IndividualSodan.vue'
import IndividualMemo from './pages/IndividualMemo.vue'
import Lectures from './pages/Lectures.vue'
import Wiki from './pages/Wiki.vue'
import MyWiki from './pages/MyWiki.vue'
import LikeWiki from './pages/LikeWiki.vue'
import MySodan from './pages/MySodan.vue'
import Search from './pages/Search.vue'
import CreateMemo from './pages/CreateMemo.vue'
import TagPage from './pages/TagPage.vue'
import ApiTest from './pages/ApiTest.vue'

const routes = [
  { path: '/createsodan', name: 'createsodan', component: CreateSodan },
  { path: '/sodan/:id', name: 'individualsodan', component: IndividualSodan },
  { path: '/memo/:id', name: 'individualmemo', component: IndividualMemo },
  { path: '/search', name: 'search', component: Search },
  { path: '/lectures/:teams', name: 'teamlectures', component: Lectures},
  { path: '/wiki', name: 'wiki', component: Wiki, children: [
        {
          path: 'mywiki',
          component: MyWiki,
          alias: '/'
        },
        {
          path: 'favoritewiki',
          component: LikeWiki
        },
        {
          path: 'search',
          component: Search
        }
      ] },
  { path: '/mysodan', name: 'mysodan', component: MySodan },
  { path: '/creatememo', name: 'creatememo', component: CreateMemo },
  { path: '/tag/:name', name: 'tagpage', component: TagPage },
  { path: '/apitest', name: 'apitest', component: ApiTest },
  { path: '/:path(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router