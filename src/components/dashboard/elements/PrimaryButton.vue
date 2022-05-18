<template>
  <Button :disabled="props.disabled"
    class="shadow"
    :class="!store.darkMode ? 'bg-neutral-700 text-neutral-100 hover:bg-green-600 disabled:bg-white disabled:text-neutral-300 disabled:bg-white' : 'bg-neutral-100 text-neutral-700 hover:bg-green-300 disabled:text-neutral-500 disabled:bg-neutral-700'"
    @click="emit('click')">
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'
import Button from './Button.vue'

const store = useStore()

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['click'])
</script>
