<template>
  <Button :disabled="props.disabled"
    class="hover:shadow"
    :class="store.darkMode ? 'text-neutral-200 hover:bg-neutral-700 disabled:text-neutral-500' : 'text-neutral-600 hover:bg-white disabled:text-neutral-300'"
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
