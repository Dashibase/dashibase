<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto" @close="show=false">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-opacity-75 transition-opacity" :class="store.darkMode ? 'bg-neutral-900' : 'bg-neutral-50'" />
        </TransitionChild>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="relative inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:px-12 sm:pb-8 sm:pt-10"
            :class="store.darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-neutral-800'">
            <div class="h-2 w-full absolute top-0 left-0" :class="store.darkMode ? 'bg-neutral-600' : 'bg-neutral-200'"></div>
            <XIcon class="h-5 absolute top-6 right-4 cursor-pointer" @click="show=false" />
            <div class="flex items-start gap-2">
              <ExclamationIcon class="mt-0.5 shrink-0 w-7" :class="store.darkMode ? 'text-red-500' : 'text-red-500'" />
              <div class="shrink flex flex-col gap-4">
                <div>
                  <DialogTitle as="h3" class="text-2xl font-bold items-start flex gap-2">
                    {{ title }} 
                  </DialogTitle>
                </div>
               <p>
                  {{ message }}
                </p>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 flex gap-2 justify-end text-gray-700">
              <TertiaryButton @click="_cancel">Cancel</TertiaryButton>
              <DeleteButton @click="_confirm">Confirm</DeleteButton>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon, ExclamationIcon } from '@heroicons/vue/solid'
import { useStore } from '@/utils/store'
import TertiaryButton from './elements/TertiaryButton.vue'
import DeleteButton from './elements/DeleteButton.vue'

const store = useStore()

const props = defineProps({
  title: {
    type: String,
    default: 'Are you sure you want to delete?'
  },
  message: {
    type: String,
    default: ''
  },
})

const title = ref('Are you sure you want to delete?')
const message = ref('Deleting is irreversible')

const show = ref(false)
const resolvePromise = ref<Function|undefined>(undefined)
const rejectPromise = ref<Function|undefined>(undefined)

function confirm () {
  show.value = true
  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve
    rejectPromise.value = reject
  })
}

function _confirm () {
  show.value = false
  if (resolvePromise.value) resolvePromise.value(true)
}

function _cancel () {
  show.value = false
  if (resolvePromise.value) resolvePromise.value(false)
}

defineExpose({
  confirm,
  title,
  message,
})
</script>
