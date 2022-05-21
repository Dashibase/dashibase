<template>
  <div class="h-screen min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="py-8 px-4 shadow-center sm:rounded-lg sm:px-10">
        <AppLogo />
        <div class="space-y-6 pt-4 text-neutral-600 dark:text-neutral-400">
          <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <UserCircleIcon class="mx-auto h-12 w-auto" />
            <h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-700 dark:text-neutral-300">Sign in to your account</h2>
            <p class="mt-2 text-center text-sm">
              Or
              <button @click="$router.push('/signup')" class="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500">
                sign up
              </button>
            </p>
          </div>
          <!-- Inputs -->
          <div>
            <label for="email" class="block text-sm font-medium">Email address</label>
            <div class="mt-1">
              <input id="email" :disabled="loading" v-model="email" name="email" type="email" autocomplete="email" required
                class="bg-transparent w-full px-3 py-2 shadow-sm sm:text-sm border-neutral-300 focus:border-neutral-300 dark:border-neutral-600 dark:focus:border-neutral-600 dark:autofill:text-neutral-800" />
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium">Password</label>
            <div class="mt-1">
              <input id="password" :disabled="loading" v-model="password" name="password" type="password" autocomplete="current-password" required
                class="bg-transparent w-full px-3 py-2 shadow-sm sm:text-sm border-neutral-300 focus:border-neutral-300 dark:border-neutral-600 dark:focus:border-neutral-600 dark:autofill:text-neutral-800"
                @keyup.enter="signIn"  />
            </div>
          </div>
          <!-- Warning -->
          <div v-if="warning" class="text-sm text-red-500">
            {{ warning }}
          </div>
          <!-- Button -->
          <div>
            <button class="w-full py-2 px-4 rounded-md shadow-sm sm:text-sm font-medium text-white bg-green-500 hover:bg-green-600 dark:text-neutral-800 dark:bg-green-300 dark:hover:bg-green-400"
              @click="signIn" :disabled="loading || success">
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
import router from '@/router'
import { supabase } from '@/utils/supabase'
import AppLogo from '../branding/AppLogo.vue'
import PoweredBy from '../branding/PoweredBy.vue'

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')

async function signIn () {
  warning.value = ''
  if (!(email.value && password.value)) {
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
    router.push('/')
  }
}
</script>
