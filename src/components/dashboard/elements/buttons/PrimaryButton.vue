<template>
  <Button class="shadow bg-neutral-100 text-neutral-700 hover:bg-green-300 disabled:text-neutral-500 disabled:bg-neutral-700 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-green-600 dark:disabled:bg-white dark:disabled:text-neutral-300 dark:disabled:bg-white"
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
