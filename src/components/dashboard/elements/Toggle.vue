<template>
  <Switch v-model="selected" :disabled="disabled" :class="[selected ? 'bg-tertiary dark:bg-input-focus-dark' : 'bg-tertiary dark:bg-input-focus-dark', 'disabled:cursor-default relative inline-flex flex-shrink-0 border-2 border-transparent h-6 w-11 rounded-full cursor-pointer transition focus:outline-none focus:ring-0']">
    <span class="sr-only">Toggle</span>
    <span aria-hidden="true" :class="[selected ? 'bg-input-focus dark:bg-primary-dark translate-x-5' : 'bg-input-disabled dark:bg-tertiary-dark translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full shadow transform ring-0 transition']" />
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
