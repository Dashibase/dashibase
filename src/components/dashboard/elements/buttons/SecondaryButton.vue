<template>
  <Button class="shadow bg-neutral-50 text-neutral-600 hover:bg-white hover:text-neutral-900 disabled:text-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600 dark:hover:text-white dark:disabled:text-neutral-600 dark:disabled:bg-neutral-700"
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
