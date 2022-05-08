<template>
  <router-view />
</template>

<script setup lang="ts">
import config from './dashibaseConfig'
import { store } from './utils/store'
import { Page } from './utils/config'
import { isHostedByDashibase } from './utils/supabase'

if (isHostedByDashibase) {
  store.appName = window.localStorage.getItem('app_name') as string
  store.pages = JSON.parse(window.localStorage.getItem('pages') as string) as Page[]
} else {
  store.appName = config.name
  store.pages = config.pages
}

document.title = store.appName
</script>
