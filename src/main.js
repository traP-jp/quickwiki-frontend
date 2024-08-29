import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Router from './router'
import vuetify from "./vuetify";
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBold, faItalic, faStrikethrough, faQuoteRight, faListUl, faListOl, faTable, faSquareCheck, faTrashCan, faImage, faLink, faHeart } from '@fortawesome/free-solid-svg-icons'
import { far } from "@fortawesome/free-regular-svg-icons";
library.add( faBold, faItalic, faStrikethrough, faQuoteRight, faListOl, faListUl, faTable, faSquareCheck, faTrashCan, faImage, faLink, faHeart, far )

createApp(App).use(Router).use(ToastPlugin).use(vuetify).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
