<template>
<!-- Component used to asynchronously run database queries on every page navigation -->
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import router from '@/router'
import { initDashboard, initUserData } from '@/utils/dashboard'
import { useStore } from '@/utils/store'

const route = useRoute()
const store = useStore()

initDashboard().then(() => {
  if (route.path === '/' && store.dashboard.pages.length) router.push(`/${store.dashboard.pages[0].page_id}`)
})
if (store.user && store.user.id) {
  initUserData()
}
</script>
