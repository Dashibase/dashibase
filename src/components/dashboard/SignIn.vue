<template>
  <div class="h-screen min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8" :class="store.darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-neutral-800'">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="py-8 px-4 shadow-center sm:rounded-lg sm:px-10">
        <AppLogo />
        <div class="space-y-6 pt-4">
          <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <UserCircleIcon class="mx-auto h-12 w-auto" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-700'" />
            <h2 class="mt-6 text-center text-3xl font-extrabold">Sign in to your account</h2>
            <p class="mt-2 text-center text-sm" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-700'">
              Or
              {{ ' ' }}
              <a href="/signup" class="font-medium" :class="store.darkMode ? 'text-blue-400 hover:text-blue-500' : 'text-blue-500 hover:text-blue-600'"> sign up </a>
            </p>
          </div>
          <!-- Inputs -->
          <div>
            <label for="email" class="block text-sm font-medium" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-700'"> Email address </label>
            <div class="mt-1">
              <input id="email" :disabled="loading" v-model="email" name="email" type="email" autocomplete="email" required
                class="bg-transparent block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 sm:text-sm"
                :class="store.darkMode ? 'border-neutral-600 focus:border-neutral-600' : 'border-neutral-300 focus:border-neutral-300'" />
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-700'"> Password </label>
            <div class="mt-1">
              <input id="password" @keyup.enter="signIn" :disabled="loading" v-model="password" name="password" type="password" autocomplete="current-password" required
                class="bg-transparent block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-0 sm:text-sm"
                :class="store.darkMode ? 'border-neutral-600 focus:border-neutral-600' : 'border-neutral-300 focus:border-neutral-300'" />
            </div>
          </div>
          <!-- Warning -->
          <div v-if="warning" class="text-sm text-red-500">
            {{ warning }}
          </div>
          <!-- Button -->
          <div>
            <button class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-0"
              :class="store.darkMode ? 'text-neutral-800 bg-green-300 hover:bg-green-400' : 'text-white bg-green-500 hover:bg-green-600'"
              @click="signIn">
              {{ loading ? 'Loading...' : (success ? 'Redirecting...' : 'Sign in') }}
            </button>
          </div>
        </div>
        <div class="flex justify-end mt-10">
          <PoweredBy />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserCircleIcon } from '@heroicons/vue/solid'
import { supabase } from '@/utils/supabase'
import { useStore } from '@/utils/store'
import AppLogo from '../branding/AppLogo.vue'
import PoweredBy from '../branding/PoweredBy.vue'

const store = useStore()

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')

async function signIn () {
  warning.value = ''
  if (!(email && password)) {
    warning.value = 'Please fill in your details'
    return
  }
  loading.value = true
  const { error } = await supabase.auth.signIn({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (error) {
    warning.value = error.message
  } else {
    success.value = true
    // Redirect to dashboard
    window.location.href = '/'
  }
}
</script>
