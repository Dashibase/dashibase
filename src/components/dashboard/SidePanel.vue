<template>
  <Popover class="">
    <div id="sidepanel" class="sm:fixed h-full bg-gradient-to-b from-backdrop to-surface dark:from-backdrop-dark dark:to-surface-dark flex-none sm:w-64 flex flex-col justify-between text-primary dark:text-primary-dark">
      <div class="space-y-8">
        <div class="flex justify-between items-center sm:block w-full">
          <!-- App Name -->
          <div class="px-7 py-6">
            <AppLogo class="w-max" />
          </div>
          <div class="mr-4 sm:hidden flex items-center gap-4">
            <DarkMode />
            <PopoverButton class="rounded-md p-2 inline-flex items-center justify-center text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-0">
              <span class="sr-only">Open menu</span>
              <MenuIcon class="h-6 w-6" aria-hidden="true" />
            </PopoverButton>
          </div>
          <div class="hidden sm:block">
            <!-- Pages -->
            <div class="space-y-1 px-3">
              <template v-for="page in store.dashboard.pages" :key="page.name" >
                <router-link :to="`/${page.page_id}`" class="block w-full truncate font-medium text-left px-4 py-2 hover:bg-surface dark:hover:bg-surface-dark"
                  :class="[route.params.pageId === page.page_id ? 'bg-surface dark:bg-surface-dark font-semibold shadow rounded' : '']">
                  {{ page.name }}
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="hidden sm:flex p-4 justify-between items-center">
        <div class="flex items-center gap-2 group">
          <div class="flex-shrink-0 h-12 w-12">
            <Avatar />
          </div>
          <div class="font-medium text-sm opacity-0 group-hover:opacity-100 transition cursor-pointer" @click="signOut">
            Log out
          </div>
        </div>
        <DarkMode />
      </div>
    </div>
    <transition enter-active-class="duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <PopoverPanel focus class="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-50" v-slot="{ close }">
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
                <template class="block hover:bg-neutral-100 font-medium">
                  <button @click="openLink(page.page_id, close)" class="px-4 sm:px-6 py-4 block w-full truncate font-medium text-left">{{ page.name }}</button>
                </template>
              </template>
              <a class="cursor-pointer hover:bg-neutral-100 font-medium px-4 sm:px-6 py-4 block w-full truncate" @click="signOut">Log out</a>
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
import { useRoute } from 'vue-router'
import router from '@/router'
import { useStore } from '@/utils/store'
import { supabase } from '@/utils/supabase'
import AppLogo from '../branding/AppLogo.vue'
import Avatar from './elements/Avatar.vue'
import DarkMode from './elements/DarkMode.vue'
import { onMounted } from 'vue'

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
    router.push('/login')
  }
}

function openLink (link:string, close:()=>void) {
  router.push(`/${link}`)
  close()
}

const emit = defineEmits(['scroll'])

onMounted(() => {
  const sidePanel = document.getElementById('sidepanel')
  if (!sidePanel) return
  sidePanel.onwheel = (event:WheelEvent) => {
    emit('scroll', event.deltaY)
  }
})
</script>
