import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import '@/assets/tailwind.scss'
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';

import mixin from '@/mixin';

createApp(App).use(store).mixin(mixin).mount('#app')
