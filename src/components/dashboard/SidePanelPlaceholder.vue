<template>
  <div class="sm:fixed sm:h-screen animate-pulse">
    <div class="h-full bg-gradient-to-b from-backdrop to-surface dark:from-backdrop-dark dark:to-surface-dark flex-none sm:w-64 flex flex-col justify-between text-primary dark:text-primary-dark">
      <div class="space-y-8">
        <div class="px-4 sm:px-0 flex justify-between items-center sm:block w-full">
          <!-- App Name -->
          <div class="sm:px-7 py-4">
            <Placeholder class="w-48 sm:w-full h-10" />
          </div>
          <div class="w-full mr-5 sm:hidden flex items-center justify-end gap-5">
            <Placeholder class="flex-shrink-0 h-8 w-8 rounded-full" />
            <Placeholder class="flex-shrink-0 h-8 w-8 rounded-lg" />
          </div>
          <div class="hidden sm:block">
            <!-- Pages -->
            <div class="space-y-3 px-7 pt-2">
              <Placeholder class="w-full h-8" />
              <Placeholder class="w-full h-8" />
              <Placeholder class="w-full h-8" />
            </div>
          </div>
        </div>
      </div>
      <div class="hidden sm:flex p-4 justify-between items-center">
        <Placeholder class="flex-shrink-0 h-11 w-11 rounded-full" />
        <Placeholder class="flex-shrink-0 h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Placeholder from './elements/Placeholder.vue'
</script>
