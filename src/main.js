import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
import VueAxios from 'vue-axios'

// Element-ui
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


// import http from '@/lib/http.js';
// Vue.prototype.$http = http;



createApp(App).use(VueAxios,axios)
//Vue.propotype.$http= axios 

createApp(App).use(store).use(router).use(VueAxios).use(ElementPlus).mount('#app')
//createApp(App).use(axios).mount('#app')
//Vue.prototype.$http= axios

//import http from "./lib/http.js"   // 记得改为你的路径

//Vue.prototype.$http = http  // 此处命名为rq,你可以改
