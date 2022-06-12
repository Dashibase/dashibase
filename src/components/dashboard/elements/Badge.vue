<template>
  <div class="inline-flex whitespace-nowrap rounded items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-neutral-600 text-white dark:bg-neutral-400 dark:text-neutral-800">
    <slot />
    <button type="button" @click="emit('remove')"
        class="ml-1 flex-shrink-0 h-4 w-4 flex items-center justify-center text-white dark:text-neutral-800 hover:text-red-400 dark:hover:text-red-800">
      <span class="sr-only">Remove</span>
      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['remove'])
</script>