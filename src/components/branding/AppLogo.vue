<template>
  <h2 class="text-xl text-center font-semibold select-none transition text-primary dark:text-neutral-300" :title="store.dashboard.name">
    {{ store.dashboard.name }}
  </h2>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'

const store = useStore()
</script>
