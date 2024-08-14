import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Router from './router'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

createApp(App).use(Router).use(mavonEditor).mount('#app')
