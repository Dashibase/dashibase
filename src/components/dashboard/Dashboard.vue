<template>
  <Placeholder v-if="!supabase" />
  <Loading v-model="loading" />
  <div v-if="supabase.auth.user()" class="relative min-h-screen flex flex-col">
    <div class="flex-grow w-full max-w-7xl mx-auto sm:flex border">
      <div class="flex-1 min-w-0 bg-white sm:flex">
        <SidePanel :loading="loading" @update:loading="(value:boolean) => loading=value" />
        <MainPanel>
          <router-view :page="store.pages.find(page => page.page_id === pageId) || {}" :loading="loading" @update:loading="(value:boolean) => loading=value" />
        </MainPanel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../utils/supabase'
import { store } from '../../utils/store'
import SidePanel from './SidePanel.vue'
import MainPanel from './MainPanel.vue'
import Loading from './Loading.vue'

if (!supabase) {
  const intervalId = setInterval(() => {
    if (supabase) {
      clearInterval(intervalId)
      const user = supabase.auth.user()
      if (user) store.user = user
      supabase.auth.onAuthStateChange((_, session) => {
        store.user = session?.user as User
      })
      if (!store.user.id) window.location.href = '/signin'
    }
  }, 300)
} else {
  const user = supabase.auth.user()
  if (user) store.user = user
  supabase.auth.onAuthStateChange((_, session) => {
    store.user = session?.user as User
  })
  if (!store.user.id) window.location.href = '/signin'
}

const props = defineProps({
  pageId: {
    type: String,
    default: '',
  }
})

const loading = ref(false)

const route = useRoute()
if (route.path === '/' && store.pages.length) window.location.href = `/${store.pages[0].page_id}`
</script>
