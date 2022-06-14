import { ref } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@supabase/supabase-js'
import { Page } from './config'
import { Schema } from './schema'

export const useStore = defineStore(
  'main',
  () => {
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
    const data = ref([] as { id: string; data: unknown; count: number; joinedData: unknown }[])
    const initializing = ref({
      dashboard: false,
      data: false,
    })
    return {
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
        // Escape hatch for infinite loading
        context.store.loading = false
        if (context.store.dashboard.schema) context.store.dashboard.schema = new Schema(context.store.dashboard.schema._schema)
      },
    },
  },
)
