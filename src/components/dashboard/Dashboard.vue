<template>
  <Loading v-model="loading" />
  <div v-if="supabase.auth.user()" class="relative min-h-screen flex flex-col">
    <div class="flex-grow w-full max-w-7xl mx-auto sm:flex border">
      <div class="flex-1 min-w-0 bg-white sm:flex">
        <SidePanel :loading="loading" @update:loading="(value:boolean) => loading=value" />
        <MainPanel>
          <router-view :view="views.find(view => view.view_id === viewId) || {}" :loading="loading" @update:loading="(value:boolean) => loading=value" />
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
import config from '../../dashibaseConfig'
import SidePanel from './SidePanel.vue'
import MainPanel from './MainPanel.vue'
import Loading from './Loading.vue'

const user = supabase.auth.user()
if (user) store.user = user
supabase.auth.onAuthStateChange((_, session) => {
  store.user = session?.user as User
})

const props = defineProps({
  viewId: {
    type: String,
    default: '',
  }
})

const views = ref(config.views)
const loading = ref(false)

if (!store.user.id) window.location.href = '/signin'
const route = useRoute()
if (route.path === '/' && views.value.length) window.location.href = `/${views.value[0].view_id}`
</script>
