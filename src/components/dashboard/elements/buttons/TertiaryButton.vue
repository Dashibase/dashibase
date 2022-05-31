<template>
  <Button class="border border-transparent hover:shadow text-primary hover:bg-overlay disabled:hover:shadow-none disabled:text-tertiary dark:text-primary-dark dark:hover:bg-overlay-dark dark:disabled:text-tertiary-dark dark:disabled:bg-transparent"
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
