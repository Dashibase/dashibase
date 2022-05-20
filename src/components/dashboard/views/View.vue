<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
      <PageHeader>
        <slot name="header" />
      </PageHeader>
    </div>
    <slot />
    <DeleteModal ref="deleteModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '../elements/PageHeader.vue'
import DeleteModal from '../modals/DeleteModal.vue'

const deleteModal = ref<any|null>(null)

defineExpose({
  deleteModal,
})
</script>
