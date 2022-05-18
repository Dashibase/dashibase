<template>
  <Button :disabled="props.disabled"
    class="border"
    :class="store.darkMode ? 'border-neutral-700 text-neutral-200 hover:text-red-400 hover:border-red-400 hover:text-white disabled:text-neutral-600 disabled:border-neutral-700' : 'border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-red-600 hover:border-red-600 disabled:text-neutral-300 disabled:bg-neutral-50'"
    @click="emit('click')">
    <slot />
  </button>
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
