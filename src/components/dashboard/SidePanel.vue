<template>
  <Popover class="relative z-50">
    <div class="sm:flex-shrink-0 sm:w-64 sm:border-r sm:border-gray-200 bg-gray-50 sm:h-full">
      <div class="py-6 flex flex-col h-full justify-between">
        <div class="flex items-center justify-between">
          <div class="flex-1 space-y-8 w-full">
            <div class="flex justify-between items-center sm:block w-full">
              <!-- App Name -->
              <div class="px-4 sm:px-6 sm:my-7">
                <AppLogo />
              </div>
              <div class="mr-4 sm:hidden">
                <PopoverButton class="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500">
                  <span class="sr-only">Open menu</span>
                  <MenuIcon class="h-6 w-6" aria-hidden="true" />
                </PopoverButton>
              </div>
              <div class="hidden sm:block">
                <!-- Profile -->
                <a class="py-6 flex items-center space-x-3 px-4 sm:px-6 select-none w-full" :title="store.user?.email || ''">
                  <div class="flex-shrink-0 h-12 w-12">
                    <UserCircleIcon class="h-12 w-auto text-gray-400" />
                  </div>
                  <div class="space-y-1 shrink font-medium text-gray-800 truncate">
                    {{ store.user?.email || '' }}
                  </div>
                </a>
                <!-- Views -->
                <div class="flex flex-col divide-y border border-x-0 text-gray-800">
                  <template v-for="view in views" :key="view.name" >
                    <template class="block hover:bg-gray-100 font-medium">
                      <a :href="`/${view.view_id}`" class="px-4 sm:px-6 py-4 block w-full truncate">{{ view.name }}</a>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden sm:block py-3 px-4 sm:px-6 w-full cursor-pointer hover:bg-gray-100 font-medium text-gray-800" @click="signOut">
          Sign out
        </div>
      </div>
    </div>
    <transition enter-active-class="duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <PopoverPanel focus class="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
        <div class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
          <div class="pt-4 pb-6 px-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AppLogo />
              </div>
              <div class="-mr-2">
                <PopoverButton class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500">
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
                <UserCircleIcon class="h-12 w-auto text-gray-400" />
              </div>
              <div class="space-y-1 shrink font-medium text-gray-800 truncate">
                {{ store.user?.email || '' }}
              </div>
            </a>
            <!-- Views -->
            <div class="flex flex-col divide-y border border-x-0 text-gray-800">
              <template v-for="view in views" :key="view.name" >
                <template class="block hover:bg-gray-100 font-medium">
                  <a :href="`/${view.view_id}`" class="px-4 sm:px-6 py-4 block w-full truncate">{{ view.name }}</a>
                </template>
              </template>
              <a class="cursor-pointer hover:bg-gray-100 font-medium px-4 sm:px-6 py-4 block w-full truncate" @click="signOut">Sign out</a>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel
} from '@headlessui/vue'
import {
  MenuIcon,
  UserCircleIcon,
  XIcon,
} from '@heroicons/vue/solid'
import { store } from '../../utils/store'
import { supabase } from '../../utils/supabase'
import config from '../../dashibaseConfig'
import AppLogo from '../branding/AppLogo.vue'

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
    MenuIcon,
    UserCircleIcon,
    XIcon,
    AppLogo,
  },
  setup () {
    return {
      store
    }
  },
  data () {
    return {
      appName: config.name,
      views: config.views,
    }
  },
  computed: {
    innerLoading: {
      get () {
        return this.loading
      },
      set (value:boolean) {
        this.$emit('update:loading', value)
      }
    }
  },
  methods: {
    async signOut () {
      this.innerLoading = true
      window.localStorage.clear()
      const { error } = await supabase.auth.signOut()
      if (error) console.error(error)
      else window.location.href = '/signin'
    },
  }
})
</script>
