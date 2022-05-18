<template>
  <div class="text-2xl font-medium flex items-center gap-2 truncate transition" :class="store.darkMode ? 'text-neutral-200' : 'text-neutral-800'">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'

const store = useStore()
</script>
