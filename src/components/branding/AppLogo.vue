<template>
  <h2 class="text-lg text-center font-bold text-gray-700 select-none">{{ appName }}</h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import config from '../../dashibaseConfig'

export default defineComponent({
  data () {
    return {
      appName: config.name
    }
  }
})
</script>
