import { ref } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@supabase/supabase-js'
import { Page } from './config'
import { Schema } from './schema'
import { supabase } from './supabase'
import router from '@/router'

export const latestVersion = '0.1.3'

export const useStore = defineStore(
  'main',
  () => {
    const version = ref(latestVersion)
    const loading = ref(false)
    const darkMode = ref(false)
    const user = ref({} as User)
    const dashboard = ref({
      id: '',
      name: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      pages: [] as Page[],
      schema: null as unknown as Schema,
    })
    const data = ref([] as { id: string; data: unknown; count: number; joinedData: unknown; }[])
    const initializing = ref({
      dashboard: false,
      data: false,
    })
    return {
      version,
      loading,
      darkMode,
      user,
      dashboard,
      data,
      initializing,
    }
  }, {
    persist: {
      afterRestore: context => {
        if (context.store.version !== latestVersion) {
          signOut()
        } else {
          // Escape hatch for infinite loading
          context.store.loading = false
          try {
            if (context.store.dashboard.schema) context.store.dashboard.schema = new Schema(context.store.dashboard.schema._schema)
          } catch {
            signOut()
          }
        }
      },
    },
  },
)

async function signOut () {
  const store = useStore()
  store.loading = true
  window.localStorage.clear()
  const { error } = await supabase.auth.signOut()
  store.loading = false
  if (error) {
    console.error(error)
  } else {
    store.$reset()
    router.push('/login')
  }
}
