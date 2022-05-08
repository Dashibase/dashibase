<template>
  <Placeholder v-if="!initialized" />
  <div v-else class="h-screen min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-center sm:rounded-lg sm:px-10">
        <AppLogo />
        <div class="space-y-6 pt-4">
          <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <UserCircleIcon class="mx-auto h-12 w-auto text-gray-600" />
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
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
              <input id="password" @keyup.enter="signUp" :disabled="loading" v-model="password" name="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
            </div>
          </div>
          <!-- Warning -->
          <div v-if="warning" class="text-sm text-red-500">
            {{ warning }}
          </div>
          <!-- Button -->
          <div>
            <button @click="signUp" :disabled="loading || success" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              {{ loading ? 'Loading...' : (success ? (confirmEmail ? 'Check your email!' : 'Redirecting...') : 'Create account') }}
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
import { supabase } from '../../utils/supabase'
import { store } from '../../utils/store'
import Placeholder from './Placeholder.vue'
import AppLogo from '../branding/AppLogo.vue'
import PoweredBy from '../branding/PoweredBy.vue'

const initialized = ref(false)

if (!supabase) {
  const intervalId = setInterval(() => {
    if (supabase) {
      clearInterval(intervalId)
      const user = supabase.auth.user()
      if (user) store.user = user
      supabase.auth.onAuthStateChange((_, session) => {
        store.user = session?.user as User
      })
      initialized.value = true
      if (store.user.id) window.location.href = '/'
    }
  }, 300)
} else {
  const user = supabase.auth.user()
  if (user) store.user = user
  supabase.auth.onAuthStateChange((_, session) => {
    store.user = session?.user as User
  })
  initialized.value = true
  if (store.user.id) window.location.href = '/'
}

const minPasswordLength = 6 // Set to minimum password length in Supabase
const confirmEmail = true // Assuming confirm email is set to True in Supabase

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')

async function signUp () {
  loading.value = true
  if (password.value.length < minPasswordLength) {
    warning.value = `Password needs to be at least ${minPasswordLength} characters`
  } else {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    }, {
      redirectTo: window.location.origin
    })
    loading.value = false
    if (error) {
      warning.value = error.message
    } else {
      success.value = true
      if (!confirmEmail) {
        // Redirect user if confirmEmail is false
        window.location.href = '/'
      }
    }
  }
}
</script>
