import { createApp } from 'vue'
import App from './views/App.vue'

import '@/assets/tailwind.scss'
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';

import mixin from '@/mixin';
import store from './store'

createApp(App).use(store).mixin(mixin).mount('#app')
