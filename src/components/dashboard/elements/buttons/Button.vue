<template>
  <button :disabled="props.disabled"
    class="rounded-md py-1 px-3 h-max inline-flex justify-center items-center gap-1 text-sm font-medium focus:outline-none focus:ring-0 transition"
    @click="emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useStore } from '@/utils/store'

const store = useStore()

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['click'])
</script>
