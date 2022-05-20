<template>
  <div class="block">
    <div class="flex justify-between px-4 py-3 text-sm font-medium items-center" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-500'">
      <div class="flex items-center gap-1">
        Page
        <DropDown :options="paginationList" v-model="paginationNum" />
        of {{ maxPagination }}
      </div>
      <div class="flex gap-2">
        <button class="border rounded px-2 py-1 transition"
          :class="store.darkMode ? 'border-neutral-700 hover:bg-neutral-900 disabled:bg-neutral-800 disabled:text-neutral-700' : 'hover:bg-neutral-50 disabled:bg-white disabled:text-neutral-300'"
          :disabled="paginationNum === 1" @click="paginationNum === 1 ? '' : paginationNum -= 1">
          Prev
        </button>
        <button class="border rounded px-2 py-1 transition"
          :class="store.darkMode ? 'border-neutral-700 hover:bg-neutral-900 disabled:bg-neutral-800 disabled:text-neutral-700' : 'hover:bg-neutral-50 disabled:bg-white disabled:text-neutral-300'"
          :disabled="paginationNum === maxPagination" @click="paginationNum === maxPagination ? '' : paginationNum += 1">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { useStore } from '@/utils/store'
import DropDown from './DropDown.vue'

const store = useStore()

const props = defineProps({
  paginationList: {
    type: Array as PropType<{label: string, value: number}[]>,
    required: true,
  },
  modelValue: {
    type: Number,
    required: true,
  },
  maxPagination: {
    type: Number,
    required: true,
  },
})

const emits = defineEmits(['update:modelValue'])

const paginationNum = computed({
  get () {
    return props.modelValue
  },
  set (newValue:number) {
    emits('update:modelValue', newValue)
  }
})
</script>
