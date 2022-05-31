<template>
  <Popover class="sm:h-screen animate-pulse">
    <div class="h-full bg-gradient-to-b from-backdrop to-surface dark:from-backdrop-dark dark:to-surface-dark flex-none sm:w-64 flex flex-col justify-between text-primary dark:text-primary-dark">
      <div class="space-y-8">
        <div class="flex justify-between items-center sm:block w-full">
          <!-- App Name -->
          <div class="px-7 py-4">
            <Placeholder class="w-48 sm:w-full h-10" />
          </div>
          <div class="w-full mr-5 sm:hidden flex items-center justify-end gap-5">
            <Placeholder class="flex-shrink-0 h-8 w-8 rounded-full" />
            <Placeholder class="flex-shrink-0 h-8 w-8 rounded-lg" />
          </div>
          <div class="hidden sm:block">
            <!-- Pages -->
            <div class="space-y-3 px-7 pt-2">
              <Placeholder class="w-full h-8" />
              <Placeholder class="w-full h-8" />
              <Placeholder class="w-full h-8" />
            </div>
          </div>
        </div>
      </div>
      <div class="hidden sm:flex p-4 justify-between items-center">
        <Placeholder class="flex-shrink-0 h-11 w-11 rounded-full" />
        <Placeholder class="flex-shrink-0 h-8 w-8 rounded-full" />
      </div>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import {
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue'
import {
  MenuIcon,
  UserCircleIcon,
  XIcon,
} from '@heroicons/vue/solid'
import { useRoute } from 'vue-router'
import router from '@/router'
import { useStore } from '@/utils/store'
import { supabase } from '@/utils/supabase'
import AppLogo from '../branding/AppLogo.vue'
import Avatar from './elements/Avatar.vue'
import DarkMode from './elements/DarkMode.vue'
import Placeholder from './elements/Placeholder.vue'

const store = useStore()
const route = useRoute()

async function signOut () {
  store.loading = true
  window.localStorage.clear()
  const { error } = await supabase.auth.signOut()
  store.loading = false
  if (error) {
    console.error(error)
  } else {
    store.$reset()
    router.push('/signin')
  }
}
</script>
