import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import { createPinia, Store } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

function resetStore({ store }:{store:Store}) {
  const initialState = {
    loading: false,
    user: {},
    dashboard: {
      pages: [],
    },
    data: [],
    initializing: {
      dashboard: false,
      data: false,
    },
  }
  store.$reset = () => store.$patch(JSON.parse(JSON.stringify(initialState)))
}
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
pinia.use(resetStore)


createApp(App).use(router).use(pinia).mount('#app')
