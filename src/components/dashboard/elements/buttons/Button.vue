<template>
  <router-link v-if="to" :to="to"
    class="block rounded-md py-1 px-3 inline-flex justify-center items-center gap-1 text-sm font-medium focus:outline-none focus:ring-0 transition"
    @click="emit('click')">
    <slot />
  </router-link>
  <button v-else :disabled="props.disabled" class="rounded-md py-1 px-3 inline-flex justify-center items-center gap-1 text-sm font-medium focus:outline-none focus:ring-0 transition"
    @click="emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  to: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['click'])
</script>
