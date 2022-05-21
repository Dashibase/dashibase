<template>
  <Button :disabled="props.disabled" class="border border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-red-600 hover:border-red-600 disabled:text-neutral-300 disabled:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:text-red-400 dark:hover:border-red-400 dark:disabled:text-neutral-600 dark:disabled:border-neutral-700"
    @click="emit('click')">
    <slot />
  </Button>
</template>

<script setup lang="ts">
import Button from './Button.vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['click'])
</script>
