<template>
  <View>
    <template #header>
      <Placeholder class="w-48 h-10 animate-pulse" />
    </template>
  </View>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import router from '@/router'
import { Page, AttributeType } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import View from './View.vue'
import Toggle from '../elements/Toggle.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import TertiaryButton from '../elements/buttons/TertiaryButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'
import Placeholder from '../elements/Placeholder.vue'
</script>
