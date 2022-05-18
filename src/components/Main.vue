<template>
  <router-view />
  <div class="z-50 absolute w-full top-0 bg-white transition-all duration-500"
    :class="store.dashboard.name ? 'opacity-0 pointer-events-none' : 'opacity-100'">
    <Placeholder />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'
import { useStore } from '@/utils/store'
import Placeholder from './dashboard/Placeholder.vue'

const store = useStore()
const route = useRoute()

if (!store.user.id && !['/signin', '/signup'].includes(route.path)) window.location.href = '/signin'

const intervalId = setInterval(() => {
  if (supabase) {
    clearInterval(intervalId)

    store.dashboard.supabaseAnonKey = window.localStorage.getItem('dashibase.supabase_anon_key') || ''
    store.dashboard.supabaseUrl = window.localStorage.getItem('dashibase.supabase_url') || ''
    store.dashboard.name = window.localStorage.getItem('dashibase.app_name') || ''
    store.dashboard.id = window.localStorage.getItem('dashibase.dashboard_id') || ''

    const user = supabase.auth.user()
    if (user) store.user = user
    supabase.auth.onAuthStateChange((_, session) => {
      store.user = session?.user as SupabaseUser
    })
    if (!store.user.id) {
      if (!['/signin', '/signup'].includes(route.path)) window.location.href = '/signin'
    }
  }
}, 100)
</script>
