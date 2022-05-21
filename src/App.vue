<template>
  <!-- For Tailwind dark mode support https://tailwindcss.com/docs/dark-mode -->
  <div :class="store.darkMode ? 'dark' : ''">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'
const store = useStore()
</script>
