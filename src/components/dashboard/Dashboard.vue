<template>
  <div v-if="store.dashboard.id">
    <Loading />
    <div class="relative min-h-screen flex flex-col">
      <div class="flex-grow w-full mx-auto sm:flex bg-surface dark:bg-surface-dark">
        <div v-if="store.user && store.user.id" class="flex-1 min-w-0 sm:flex w-full h-screen transition">
          <SidePanel @scroll="scrollMainPanel" />
          <MainPanel id="mainpanel">
            <router-view v-slot="{ Component }">
              <transition mode="out-in">
                <component :is="Component" :key="route.fullPath" />
              </transition>
            </router-view>
          </MainPanel>
        </div>
      </div>
    </div>
    <LoadData :key="route.fullPath" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import router from '@/router'
import { useStore } from '@/utils/store'
import Loading from './Loading.vue'
import LoadData from './LoadData.vue'
import MainPanel from './MainPanel.vue'
import SidePanel from './SidePanel.vue'

const store = useStore()
const route = useRoute()

if (route.path === '/' && store.dashboard.pages.length) {
  router.push(`/${store.dashboard.pages[0].page_id}`)
}

function scrollMainPanel(deltaY:number) {
  const element = document.getElementById('mainpanel')
  if (!element) return
  element.scrollBy({top: deltaY, behavior: 'auto'})
}
</script>
