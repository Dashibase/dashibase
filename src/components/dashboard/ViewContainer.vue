<template>
  <component :is="componentMap[page.mode]" :page="page" :loading="loading" @update:loading="(value:boolean) => loading=value" />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import CardView from './CardView.vue'
import ListView from './ListView.vue'
import SingleView from './SingleView.vue'
import { Page } from '../../utils/config'
import { initLoading, initCrud } from '../../utils/dashboard'

const props = defineProps({
  page: {
    type: Object as PropType<Page>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const componentMap = {
  'list': ListView,
  'card': CardView,
  'single': SingleView,
} as any

const { loading } = initLoading(props.loading)
const { page } = initCrud(loading, props.page)
</script>
