<template>
  <Button :disabled="props.disabled" class="shadow border border-transparent bg-overlay text-primary hover:text-red-600 hover:border-red-600 disabled:bg-input-disabled disabled:text-tertiary disabled:border-transparent dark:bg-overlay-dark dark:text-primary-dark dark:hover:text-red-400 dark:hover:border-red-400 dark:disabled:bg-input-disabled-dark dark:disabled:text-tertiary-dark"
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
