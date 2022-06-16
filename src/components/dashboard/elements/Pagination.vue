<template>
  <div class="block">
    <div class="flex justify-between px-4 py-3 text-sm font-medium items-center text-neutral-500 dark:text-neutral-400">
      <div class="flex items-center gap-1">
        Page
        <input type="text" :value="paginationNum" @keyup.enter="updatePaginationNum"
          class="text-sm py-1 px-2 w-12 border-neutral-300 dark:border-neutral-700 focus:border-neutral-300 focus:dark:border-neutral-700" />
        of {{ maxPagination }}
      </div>
      <div class="flex gap-2">
        <button class="border rounded px-2 py-1 transition hover:bg-neutral-50 disabled:bg-white disabled:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-900 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-700"
          :disabled="paginationNum === 1" @click="paginationNum === 1 ? '' : paginationNum -= 1">
          Prev
        </button>
        <button class="border rounded px-2 py-1 transition hover:bg-neutral-50 disabled:bg-white disabled:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-900 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-700"
          :disabled="paginationNum === maxPagination" @click="paginationNum === maxPagination ? '' : paginationNum += 1">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'

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
    newValue = Math.max(1, Math.min(props.maxPagination, newValue))
    emits('update:modelValue', newValue)
  }
})

function updatePaginationNum (event:Event) {
  try {
    const inputTarget = event.target as HTMLInputElement
    const newPage = parseInt(inputTarget.value)
    if (!newPage) return
    paginationNum.value = newPage
  } catch {
    return
  }
}
</script>
