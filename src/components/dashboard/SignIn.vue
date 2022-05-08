<template>
  <Placeholder v-if="!store.appName" />
  <div v-else class="h-screen min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-center sm:rounded-lg sm:px-10">
        <AppLogo />
        <div class="space-y-6 pt-4">
          <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <UserCircleIcon class="mx-auto h-12 w-auto text-gray-600" />
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              Or
              {{ ' ' }}
              <a href="/signup" class="font-medium text-blue-500 hover:text-blue-600"> sign up </a>
            </p>
          </div>
          <!-- Inputs -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
            <div class="mt-1">
              <input id="email" :disabled="loading" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
            <div class="mt-1">
              <input id="password" @keyup.enter="signIn" :disabled="loading" v-model="password" name="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
            </div>
          </div>
          <!-- Warning -->
          <div v-if="warning" class="text-sm text-red-500">
            {{ warning }}
          </div>
          <!-- Button -->
          <div>
            <button class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" @click="signIn">
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
import { User } from '@supabase/supabase-js'
import { supabase, isHostedByDashibase } from '../../utils/supabase'
import { store } from '../../utils/store'
import Placeholder from './Placeholder.vue'
import AppLogo from '../branding/AppLogo.vue'
import PoweredBy from '../branding/PoweredBy.vue'

const user = supabase.auth.user()
if (user) store.user = user
supabase.auth.onAuthStateChange((_, session) => {
  store.user = session?.user as User
})
if (store.user.id) window.location.href = '/'

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')

async function signIn () {
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
