<template>
  <Button :disabled="props.disabled" class="shadow"
    :class="store.darkMode ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white disabled:text-neutral-600 disabled:bg-neutral-700' : 'bg-neutral-50 text-neutral-600 hover:bg-white hover:text-neutral-900 disabled:text-neutral-300'"
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
