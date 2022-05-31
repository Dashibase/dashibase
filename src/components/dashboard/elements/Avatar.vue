<template>
  <span class="inline-flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 cursor-default bg-neutral-200 dark:bg-neutral-750" :class="sizes[props.size]" :title="store.user?.email || ''">
    <span class="font-medium leading-none uppercase">{{ initials }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/utils/store'

const store = useStore()

const props = defineProps({
  size: {
    type: String,
    default: 'xl',
  },
})


const sizes = {
  xs: ['text-xs', 'h-5', 'w-5'],
  sm: ['text-sm', 'h-7', 'w-7'],
  md: ['text-md', 'h-8', 'w-8'],
  lg: ['text-lg', 'h-10', 'w-10'],
  xl: ['text-xl', 'h-11', 'w-11'],
} as {[k:string]: string[]}

// Compute avatar color as hash of email via HSL
const bgColor = computed(() => {
  if (!store.user.email) return '#D4D4D4'
  const str = store.user.email
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return {
    background: store.darkMode ? `hsl(${hue},60%,30%)` : `hsl(${hue},60%,85%)`
  }
})

// Use first character of email
const initials = computed(() => {
  if (store.user.email) return store.user.email[0]
  else return ''
})
</script>
