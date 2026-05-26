import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'


import App from './App.vue'
import router from './router'
import '/src/style.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
/* ✅ ADD THIS */
const auth = useAuthStore(pinia)

auth.hydrate()

app.mount('#app')
