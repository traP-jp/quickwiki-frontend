import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Router from './router'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

createApp(App).use(Router).use(ToastPlugin).mount('#app')
