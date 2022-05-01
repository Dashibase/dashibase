<template>
  <router-view />
</template>

<script setup lang="ts">
import config from './dashibaseConfig'

if (config.name) document.title = config.name
</script>
