<template>
  <div class="text-2xl font-medium flex items-end justify-between gap-2 truncate w-full transition text-neutral-800 dark:text-neutral-200">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'

const store = useStore()
</script>
