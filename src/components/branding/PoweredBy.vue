<template>
  <a class="font-medium text-sm" :class="store.darkMode ? 'text-neutral-500' : 'text-neutral-400'" href="https://dashibase.com">
    Powered by Dashibase
  </a>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'
const store = useStore()
</script>
