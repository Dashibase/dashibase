<!-- Used in the loading screen -->
<template>
  <View>
    <template #header>
      <Placeholder class="w-48 h-10 animate-pulse" />
    </template>
  </View>
</template>

<script setup lang="ts">
import View from './View.vue'
import Placeholder from '../elements/Placeholder.vue'
</script>
