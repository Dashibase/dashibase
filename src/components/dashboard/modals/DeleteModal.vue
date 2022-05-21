<template>
  <Modal v-model="show">
    <template #icon>
      <ExclamationIcon class="mt-0.5 shrink-0 w-7 text-red-500" />
    </template>
    <template #title>
      <slot name="title">
        Are you sure you want to delete?
      </slot>
    </template>
    <slot>
      <p>
        Deleting is irreversible
      </p>
    </slot>
    <template #buttons>
      <TertiaryButton @click="_cancel">Cancel</TertiaryButton>
      <DeleteButton @click="_confirm">Confirm</DeleteButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ExclamationIcon } from '@heroicons/vue/solid'
import TertiaryButton from '../elements/buttons/TertiaryButton.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import Modal from './Modal.vue'

const show = ref(false)
const resolvePromise = ref<Function|undefined>(undefined)
const rejectPromise = ref<Function|undefined>(undefined)

function confirm () {
  show.value = true
  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve
    rejectPromise.value = reject
  })
}

function _confirm () {
  show.value = false
  if (resolvePromise.value) resolvePromise.value(true)
}

function _cancel () {
  show.value = false
  if (resolvePromise.value) resolvePromise.value(false)
}

defineExpose({
  confirm,
})
</script>
