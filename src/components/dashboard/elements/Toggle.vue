<template>
  <Switch v-model="selected" :disabled="disabled" :class="[selected ? 'bg-neutral-500 dark:bg-neutral-900' : 'bg-neutral-200 dark:bg-neutral-900', 'disabled:cursor-default relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition focus:outline-none focus:ring-0']">
    <span class="sr-only">Use setting</span>
    <span aria-hidden="true" :class="[selected ? 'bg-white dark:bg-neutral-300 translate-x-5' : 'bg-neutral-100 dark:bg-neutral-700 translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full shadow transform ring-0 transition']" />
  </Switch>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@headlessui/vue'

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
