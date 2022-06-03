<template>
  <Button class="shadow border border-transparent bg-primary text-input-focus hover:bg-primary-focus disabled:bg-input-disabled disabled:text-tertiary dark:bg-primary-dark dark:text-input-focus-dark dark:hover:bg-primary-focus-dark dark:disabled:text-tertiary-dark dark:disabled:bg-input-disabled-dark"
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
