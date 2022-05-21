<template>
  <Popover class="">
    <div class="sm:flex-shrink-0 sm:w-64 sm:h-full">
      <div class="py-6 flex flex-col h-full justify-between text-neutral-700 dark:text-neutral-400">
        <div class="flex items-center justify-between">
          <div class="flex-1 space-y-8 w-full">
            <div class="flex justify-between items-center sm:block w-full">
              <!-- App Name -->
              <div class="px-4 sm:px-6 sm:my-7">
                <AppLogo />
              </div>
              <div class="mr-4 sm:hidden">
                <PopoverButton class="rounded-md p-2 inline-flex items-center justify-center text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-0">
                  <span class="sr-only">Open menu</span>
                  <MenuIcon class="h-6 w-6" aria-hidden="true" />
                </PopoverButton>
              </div>
              <div class="hidden sm:block">
                <!-- Profile -->
                <a class="py-6 flex items-center space-x-3 px-4 sm:px-6 select-none w-full" :title="store.user?.email || ''">
                  <div class="flex-shrink-0 h-12 w-12">
                    <Avatar />
                  </div>
                  <div class="space-y-1 shrink font-medium truncate transition">
                    {{ store.user?.email || '' }}
                  </div>
                </a>
                <!-- Pages -->
                <div class="flex flex-col">
                  <template v-for="page in store.dashboard.pages" :key="page.name" >
                    <template class="block font-medium">
                      <button @click="router.push(`/${page.page_id}`)" class="group px-4 py-2 block w-full truncate font-medium text-left">
                        <div class="px-4 py-2 rounded transition group-hover:bg-[#ECECEC] group-hover:text-neutral-800 dark:group-hover:bg-[#2E2E2E] dark:group-hover:text-neutral-300"
                          :class="route.params.pageId === page.page_id ? 'bg-[#ECECEC] text-neutral-800 dark:bg-[#2E2E2E] dark:text-neutral-300' : ''">
                          {{ page.name }}
                        </div>
                      </button>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="py-3 px-4 sm:px-6 flex justify-between items-center">
          <div class="hidden sm:block w-full cursor-pointer font-medium" @click="signOut">
            Sign out
          </div>
          <DarkMode />
        </div>
      </div>
    </div>
    <transition enter-active-class="duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <PopoverPanel focus class="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-50">
        <div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y-2 bg-white divide-neutral-50 dark:bg-neutral-800 dark:divide-neutral-700">
          <div class="pt-4 pb-6 px-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AppLogo />
              </div>
              <div class="-mr-2">
                <PopoverButton class="rounded-md p-2 inline-flex items-center justify-center focus:outline-none focus:ring-0 text-neutral-400 dark:text-neutral-500">
                  <span class="sr-only">Close menu</span>
                  <XIcon class="h-6 w-6" aria-hidden="true" />
                </PopoverButton>
              </div>
            </div>
          </div>
          <div class="sm:hidden">
            <!-- Profile -->
            <a class="py-6 flex items-center space-x-3 px-4 sm:px-6 select-none w-full" :title="store.user?.email || ''">
              <div class="flex-shrink-0 h-12 w-12">
                <UserCircleIcon class="h-12 w-auto text-neutral-400" />
              </div>
              <div class="space-y-1 shrink font-medium truncate text-neutral-800 dark:text-neutral-200">
                {{ store.user?.email || '' }}
              </div>
            </a>
            <!-- Pages -->
            <div class="flex flex-col divide-y border-t text-neutral-800 border-neutral-200 divide-neutral-200 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700">
              <template v-for="page in store.dashboard.pages" :key="page.name" >
                <template class="block hover:bg-gray-100 font-medium">
                  <button @click="router.push(`/${page.page_id}`)" class="px-4 sm:px-6 py-4 block w-full truncate">{{ page.name }}</button>
                </template>
              </template>
              <a class="cursor-pointer hover:bg-neutral-100 font-medium px-4 sm:px-6 py-4 block w-full truncate" @click="signOut">Sign out</a>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
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
import router from '@/router'
import { useRoute } from 'vue-router'
import { useStore } from '@/utils/store'
import { supabase } from '@/utils/supabase'
import AppLogo from '../branding/AppLogo.vue'
import Avatar from './elements/Avatar.vue'
import DarkMode from './elements/DarkMode.vue'

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
