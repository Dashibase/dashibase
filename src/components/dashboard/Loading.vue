<template>
  <!-- Loader CSS from https://codepen.io/csspoints/pen/LqNdoZ -->
  <TransitionRoot as="template" :show="store.loading || store.dashboard.pages.length === 0 || store.data.length === 0">
    <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto" :class="store.darkMode ? 'dark' : ''">
      <div class="flex items-end justify-center min-h-screen text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-opacity-100 transition-opacity bg-neutral-50 dark:bg-neutral-900 dark:bg-opacity-100" />
        </TransitionChild>
        <!-- <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span> -->
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="relative flex-1 min-w-0 sm:flex w-full h-screen transition">
            <SidePanelPlaceholder />
            <MainPanel>
              <PlaceholderView />
            </MainPanel>
            <div class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-primary dark:text-primary-dark">
              Loading... almost there!
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { useStore } from '@/utils/store'
import SidePanelPlaceholder from './SidePanelPlaceholder.vue';
import MainPanel from './MainPanel.vue';
import PlaceholderView from './views/PlaceholderView.vue';

const store = useStore()
</script>
