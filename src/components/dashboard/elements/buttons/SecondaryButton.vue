<template>
  <Button class="shadow border border-transparent bg-overlay text-primary hover:bg-highlight hover:text-primary-focus disabled:bg-input-disabled disabled:text-tertiary dark:bg-overlay-dark dark:text-primary-dark dark:hover:bg-highlight-dark dark:hover:text-primary-focus-dark dark:disabled:bg-input-disabled-dark dark:disabled:text-tertiary-dark"
    :disabled="props.disabled" @click="emit('click')">
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
