import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import '@/assets/tailwind.scss'
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';

import mixin from '@/mixin';
import router from './router'

createApp(App).use(router).use(store).mixin(mixin).mount('#app')
