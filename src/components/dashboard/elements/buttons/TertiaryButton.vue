<template>
  <Button class="hover:shadow text-neutral-600 hover:bg-white disabled:text-neutral-300 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:disabled:text-neutral-500"
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
