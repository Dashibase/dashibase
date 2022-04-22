<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto" @close="show=false">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-50 bg-opacity-75 transition-opacity" />
        </TransitionChild>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="relative inline-block align-bottom bg-transparent rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <ClockIcon class="h-6 w-6 text-gray-600" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900"> Loading... </DialogTitle>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { ClockIcon } from '@heroicons/vue/outline'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    ClockIcon,
  },
  computed: {
    show: {
      get () {
        return this.modelValue
      },
      set (newValue:boolean) {
        this.$emit('update:modelValue')
      }
    }
  }
})
</script>