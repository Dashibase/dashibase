<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto" @close="show=false">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-opacity-75 transition-opacity bg-neutral-50 dark:bg-neutral-900" />
        </TransitionChild>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="relative inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:px-12 sm:pb-8 sm:pt-10 bg-white text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
            <div class="h-2 w-full absolute top-0 left-0 bg-neutral-200 dark:bg-neutral-600"></div>
            <XIcon class="h-5 absolute top-6 right-4 cursor-pointer" @click="show=false" />
            <div class="flex items-start gap-2">
              <slot name="icon" />
              <div class="shrink flex flex-col gap-4">
                <div>
                  <DialogTitle as="h3" class="text-2xl font-bold items-start flex gap-2">
                    <slot name="title" />
                  </DialogTitle>
                </div>
                <slot />
              </div>
            </div>
            <div class="mt-5 sm:mt-6 flex gap-2 justify-end text-gray-700">
              <slot name="buttons" />
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon } from '@heroicons/vue/solid'
import { useStore } from '@/utils/store'
const store = useStore()
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue'])
const show = computed({
  get () {
    return props.modelValue
  },
  set (value:boolean) {
    emit('update:modelValue', value)
  }
})
</script>
