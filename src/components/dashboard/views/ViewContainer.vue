<template>
  <component :is="componentMap[page.mode]" :pageId="pageId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Page } from '@/utils/config'
import { useStore } from '@/utils/store'
import CardView from './CardView.vue'
import ListView from './ListView.vue'
import SingleView from './SingleView.vue'

const store = useStore()

const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
})

const page = computed(():Page => {
  return store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
})

const componentMap = {
  'list': ListView,
  'card': CardView,
  'single': SingleView,
} as {[k:string]:any}

</script>
