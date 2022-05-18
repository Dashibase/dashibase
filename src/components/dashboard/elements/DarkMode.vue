<template>
  <div class="flex gap-2 items-center justify-center rounded-full w-8 h-8 cursor-pointer" @click="toggleDarkMode"
    :class="store.darkMode ? 'text-neutral-400 hover:bg-neutral-700' : 'text-neutral-700 hover:bg-neutral-200'"
    title="Toggle dark mode">
    <SunIcon v-if="!store.darkMode" class="w-5" />
    <MoonIcon v-if="store.darkMode" class="w-5" />
  </div>
</template>

<script setup lang="ts">
import {
  SunIcon,
  MoonIcon,
} from '@heroicons/vue/outline'
import { useStore } from '@/utils/store'

const store = useStore()

function toggleDarkMode () {
  store.darkMode = !store.darkMode
}
</script>
