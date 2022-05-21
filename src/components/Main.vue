<template>
  <div class="dark:bg-neutral-800">
    <router-view v-slot="{ Component }">
      <transition mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <div class="z-50 absolute w-full top-0 transition-all duration-500"
      :class="store.dashboard.name ? 'opacity-0 pointer-events-none' : 'opacity-100'">
      <Placeholder />
    </div>
  </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0.3;
}
</style>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { User as SupabaseUser } from '@supabase/supabase-js'
import config from '@/dashibaseConfig'
import router from '@/router'
import { useStore } from '@/utils/store'
import { isHostedByDashibase, supabase } from '@/utils/supabase'
import Placeholder from './dashboard/Placeholder.vue'

const store = useStore()
const route = useRoute()

if (!store.user.id && !['/signin', '/signup'].includes(route.path)) router.push('/signin')

if (isHostedByDashibase) {
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
        if (!['/signin', '/signup'].includes(route.path)) router.push('/signin')
      }
    }
  }, 100)
} else {
  store.dashboard.supabaseAnonKey = config.supabase_anon_key
  store.dashboard.supabaseUrl = config.supabase_url
  store.dashboard.name = config.name
  const user = supabase.auth.user()
  if (user) store.user = user
  supabase.auth.onAuthStateChange((_, session) => {
    store.user = session?.user as SupabaseUser
  })
  if (!store.user.id) {
    if (!['/signin', '/signup'].includes(route.path)) router.push('/signin')
  }
}
</script>
