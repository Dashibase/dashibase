<template>
  <div class="inline-flex whitespace-nowrap rounded items-center py-0.5 pl-2 text-sm font-medium dark:bg-neutral-700 dark:text-neutral-200 bg-neutral-200 text-neutral-700 transition duration-300" :class="[props.removable ? 'pr-1' : 'pr-2', props.size === 'sm' ? 'text-xs' : '']">
    <slot />
    <button v-if="props.removable" type="button" @click="emit('remove')"
        class="ml-1 flex-shrink-0 h-4 w-4 flex items-center justify-center dark:text-white text-neutral-700 dark:hover:text-red-400 hover:text-red-700">
      <span class="sr-only">Remove</span>
      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  removable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
  }
})
const emit = defineEmits(['remove'])
</script>