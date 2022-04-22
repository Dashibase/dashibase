<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import config from './dashibaseConfig'

export default defineComponent({
  mounted () {
    // Set page title to app name
    const appName = config.name
    if (appName) document.title = appName
  }
})
</script>
