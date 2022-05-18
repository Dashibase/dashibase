<template>
  <Switch v-model="selected" :disabled="disabled" :class="[
    store.darkMode ? (selected ? 'bg-neutral-900' : 'bg-neutral-900') : (selected ? 'bg-neutral-500' : 'bg-neutral-200'), 'disabled:cursor-default relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition focus:outline-none focus:ring-0']">
    <span class="sr-only">Use setting</span>
    <span aria-hidden="true" :class="[store.darkMode ? (selected ? 'bg-neutral-300' : 'bg-neutral-700') : (selected ? 'bg-white' : 'bg-neutral-100'), selected ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full shadow transform ring-0 transition']" />
  </Switch>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@headlessui/vue'
import { useStore } from '@/utils/store'

const store = useStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  }
})

const emits = defineEmits(['update:modelValue'])

const selected = computed({
  get () {
    return props.modelValue
  },
  set (newValue:boolean) {
    emits('update:modelValue', newValue)
  }
})
</script>