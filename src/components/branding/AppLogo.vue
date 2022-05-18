<template>
  <h2 class="text-lg text-center font-bold select-none transition" :class="store.darkMode ? 'text-neutral-300' : 'text-neutral-700'">
    {{ store.dashboard.name }}
  </h2>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'
const store = useStore()
</script>
