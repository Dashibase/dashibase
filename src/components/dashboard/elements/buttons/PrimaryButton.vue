<template>
  <Button class="shadow bg-neutral-700 text-neutral-100 hover:bg-green-600 disabled:bg-neutral-100 disabled:text-neutral-300 dark:bg-neutral-100 dark:text-neutral-700 dark:hover:bg-green-300 dark:disabled:text-neutral-500 dark:disabled:bg-neutral-700"
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
