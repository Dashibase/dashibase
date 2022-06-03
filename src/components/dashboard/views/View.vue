<template>
  <div class="w-full mb-24">
    <div class="px-4 md:px-10 py-10 sm:pt-20 flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
      <PageHeader>
        <slot name="header" />
      </PageHeader>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../elements/PageHeader.vue'
</script>
