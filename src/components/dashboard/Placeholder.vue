<template>
  <div class="flex flex-col justify-between items-center h-screen text-neutral-700">
    <div>&nbsp;</div>
    <div class="space-y-4 transition duration-1000">
      <div class="flex gap-2 justify-center transition duration-1000">
        <img src="@/assets/dashibase-light.png" class="h-8" />
        <h1 class="font-bold text-2xl font-logo">dashibase</h1>
      </div>
      <div :class="[showNotFound ? 'opacity-100' : 'opacity-0']">
        <div :class="[showNotFound ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-full', 'transition duration-[1.5s]']">
          No app found. Did you get the right URL?
        </div>
      </div>
    </div>
    <div :class="[showNotFound ? 'opacity-100' : 'opacity-0', 'py-16']">
      <div :class="[showNotFound ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-full', 'transition duration-[1.5s]']">
        <a href="https://app.dashibase.com/signup" class="hover:underline">Create a Dashibase app</a> | <a href="https://app.dashibase.com/login" class="hover:underline">Log in</a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '@/utils/store'
const store = useStore()
const showNotFound = ref(false)
setTimeout(() => {
  if (!store.dashboard.name) showNotFound.value = true
}, 3000)
</script>