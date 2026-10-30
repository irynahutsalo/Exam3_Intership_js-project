// Create the Vue application and register the global plugins before mounting it.
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

// Pinia provides a shared state-management layer for features that need it.
app.use(createPinia())
// The router maps browser URLs to page components and handles navigation guards.
app.use(router)

// Mount the root component into the HTML element prepared by Vite.
app.mount('#app')
