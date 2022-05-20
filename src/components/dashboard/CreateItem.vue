<template>
  <div class="space-y-6 sm:px-6 lg:px-0 w-full">
    <div class="py-6 px-4 sm:p-6 mx-auto w-full">
      <div class="px-4 md:px-10 py-12 flex justify-between items-end">
        <PageHeader>
          <h1 class="cursor-pointer" @click="router.push(`/${page.page_id}`)">{{ page.name }}</h1>
          <ChevronRightIcon class="inline text-neutral-500 h-6 w-auto" />
          <h1>New Item</h1>
        </PageHeader>
      </div>
      <div class="mt-6 flex flex-col gap-6" v-if="page.attributes">
        <!-- Attribute Inputs -->
        <div v-for="attribute in page.attributes" :key="attribute.id"
          class="px-4 md:px-10 transition" :class="store.darkMode ? 'text-neutral-200' : 'text-neutral-800'">
          <label :for="attribute.id" class="block text-sm font-medium transition" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-600'">
            {{ attribute.label }}
             <span v-if="attribute.required" class="font-normal pl-2 transition" :class="store.darkMode ? 'text-neutral-600' : 'text-neutral-400'">required</span>
          </label>
          <input v-if="attribute.type === AttributeType.Date" type="date" :disabled="store.loading" :id="attribute.id"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)" />
          <div v-else-if="attribute.type === AttributeType.Bool" class="mt-1 text-sm flex items-center gap-2">
            <Toggle :modelValue="item[attribute.id] || false"
              @update:modelValue="(value:any) => update(attribute.id, value)" />
            <span class="capitalize">{{ item[attribute.id] ? [true, 'true'].includes(item[attribute.id]) : false }}</span>
          </div>
          <select v-else-if="attribute.type === AttributeType.Enum" :disabled="store.loading" :id="attribute.id"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm cursor-pointer transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)">
            <option v-for="option in attribute.enumOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <textarea v-else-if="attribute.type === AttributeType.LongText" :disabled="store.loading" :id="attribute.id"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)" />
          <input v-else type="text" :disabled="store.loading" :id="attribute.id"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)" />
        </div>
        <!-- Warning -->
        <div v-if="warning" class="px-4 md:px-10 text-sm text-red-500">
          {{ warning }}
        </div>
        <!-- Buttons -->
        <div class="px-4 md:px-10 flex justify-end gap-4">
          <TertiaryButton :disabled="store.loading" @click="router.go(-1)">
            Back
          </TertiaryButton>
          <PrimaryButton :disabled="store.loading" @click="createItem(item)">
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/solid'
import router from '@/router'
import { useStore } from '@/utils/store'
import { initCrud } from '@/utils/dashboard'
import { Page, AttributeType } from '@/utils/config'
import PageHeader from './elements/PageHeader.vue'
import TertiaryButton from './elements/TertiaryButton.vue'
import PrimaryButton from './elements/PrimaryButton.vue'
import Toggle from './elements/Toggle.vue'

const store = useStore()

const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
})

const page = computed(():Page => {
  return store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
})

const item = ref({} as {[k:string]:any})

function update (attributeId:string, newVal:any) {
  item.value[attributeId] = newVal
}

const { warning, createItem } = initCrud(page.value)
</script>
