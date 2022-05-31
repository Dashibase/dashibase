<template>
  <div class="h-screen min-h-full grid lg:grid-cols-2 bg-white text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
    <div class="flex flex-col justify-center items-center">
      <div class="w-96 max-w-xl">
        <AppLogo class="w-max" />
        <div class="space-y-6 text-neutral-600 dark:text-neutral-400">
          <h2 class="mt-6 text-left text-4xl font-extrabold text-neutral-700 dark:text-neutral-300">Sign up</h2>
          <!-- Inputs -->
          <div class="space-y-4">
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
                  @keyup.enter="signUp"  />
              </div>
            </div>
            <!-- Warning -->
            <div v-if="warning" class="text-sm text-red-500">
              {{ warning }}
            </div>
            <!-- Button -->
            <div>
              <PrimaryButton class="w-full h-10" @click="signUp">
                {{ loading ? 'Loading...' : (success ? (confirmEmail ? 'Check your email!' : 'Redirecting...') : 'Create account') }}
              </PrimaryButton>
            </div>
          </div>
          <div class="text-xs flex justify-between">
            <div>
              Already have an account?
              <router-link to="/signin" class="font-semibold hover:underline">Sign in</router-link>
            </div>
            <div>
              <PoweredBy />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="hidden lg:block bank-note bg-neutral-100 dark:bg-neutral-800 dark:opacity-[3%]" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserCircleIcon } from '@heroicons/vue/solid'
import router from '@/router'
import { supabase } from '@/utils/supabase'
import AppLogo from '../branding/AppLogo.vue'
import PoweredBy from '../branding/PoweredBy.vue'
import PrimaryButton from '../dashboard/elements/buttons/PrimaryButton.vue'

const minPasswordLength = 6 // Set to minimum password length in Supabase
const confirmEmail = true // Assuming confirm email is set to True in Supabase

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')

async function signUp () {
  warning.value = ''
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
        router.push('/')
      }
    }
  }
}
</script>
