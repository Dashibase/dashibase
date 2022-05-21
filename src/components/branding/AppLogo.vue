<template>
  <h2 class="text-lg text-center font-bold select-none transition text-neutral-700 dark:text-neutral-300">
    {{ store.dashboard.name }}
  </h2>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'

const store = useStore()
</script>
