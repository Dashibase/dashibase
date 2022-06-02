<template>
  <div class="bg-surface dark:bg-surface-dark">
    <div v-if="!store.dashboard.id" class="absolute w-full top-0 z-0">
      <Placeholder />
    </div>
    <div class="z-10 relative">
      <router-view v-slot="{ Component }">
        <transition mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}
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

if (store.dashboard.id && !store.user.id && !['/login', '/signup'].includes(route.path)) router.push('/login')

function checkUser () {
  const user = supabase.auth.user()
  if (user) store.user = user
  else store.user = undefined as any
  supabase.auth.onAuthStateChange((_, session) => {
    store.user = session?.user as SupabaseUser
  })
  if (!store.user || !store.user.id) {
    if (!['/login', '/signup'].includes(route.path)) router.push('/login')
  } else {
    if (['/login', '/signup'].includes(route.path)) router.push('/')
  }
}

if (isHostedByDashibase) {
  const intervalId = setInterval(() => {
    if (supabase) {
      clearInterval(intervalId)
      store.dashboard.supabaseAnonKey = window.localStorage.getItem('dashibase.supabase_anon_key') || ''
      store.dashboard.supabaseUrl = window.localStorage.getItem('dashibase.supabase_url') || ''
      store.dashboard.name = window.localStorage.getItem('dashibase.app_name') || ''
      store.dashboard.id = window.localStorage.getItem('dashibase.dashboard_id') || ''
      checkUser()
    }
  }, 100)
} else {
  store.dashboard.supabaseAnonKey = config.supabase_anon_key
  store.dashboard.supabaseUrl = config.supabase_url
  store.dashboard.name = config.name
  checkUser()
}
</script>
