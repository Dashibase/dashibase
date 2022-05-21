<template>
  <!-- Loader CSS from https://codepen.io/csspoints/pen/LqNdoZ -->
  <TransitionRoot as="template" :show="store.loading || store.dashboard.pages.length === 0 || store.data.length === 0">
    <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto" :class="store.darkMode ? 'dark' : ''">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-opacity-75 transition-opacity bg-neutral-50 dark:bg-neutral-900 dark:bg-opacity-75" />
        </TransitionChild>
        <!-- <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span> -->
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="">
            <div class="h-screen w-screen flex items-center justify-center">
              <div class="loader" />
              <div class="mt-3 text-center sm:mt-28 relative">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium text-neutral-600 dark:text-neutral-400"> Loading... </DialogTitle>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
.loader {
  position: absolute;
  width: 70px;
  height: 70px;
}
.loader:before, .loader:after {
  box-sizing: content-box;
  position: absolute;
  content: '';
  border: 4px solid #444;
  opacity: 1;
  border-radius: 50%;
  left: 44%; 
  top: 44%; 
  transform: translate(-50%, - 50%);
  animation: wave 1.2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.dark .loader:before, .dark .loader:after {
  border: 4px solid #ccc;
}
.loader:after {
  animation-delay: -0.4s;
}
@keyframes wave {
  0% {    
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: -6%;
    left: -6%;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>

<script setup lang="ts">
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { useStore } from '@/utils/store'

const store = useStore()
</script>
