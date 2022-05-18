<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex justify-between items-end">
      <PageHeader>{{ page.name }}</PageHeader>
    </div>
    <div class="flex flex-col gap-6 max-w-[40rem]">
      <!-- Attribute Inputs -->
      <div v-for="attribute in page.attributes" :key="attribute.id">
        <div class="px-4 md:px-10 transition" :class="store.darkMode ? 'text-neutral-200' : 'text-neutral-800'">
          <label :for="attribute.id" class="block text-sm font-medium transition" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-600'">
            {{ attribute.label }}
          </label>
          
          <!-- If input is read-only -->
          <textarea v-if="(page.readonly || attribute.readonly) && attribute.type === AttributeType.LongText" readonly :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''" 
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition"
            :class="store.darkMode ? 'border-neutral-700 focus:border-neutral-700' : 'border-gray-300 focus:border-gray-300'" />
          <Toggle v-else-if="(page.readonly || attribute.readonly) && attribute.type === AttributeType.Bool" disabled class="mt-1" :modelValue="items.length ? items[0][attribute.id] : false" />
          <input v-else-if="page.readonly || attribute.readonly" type="text" readonly :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition"
            :class="store.darkMode ? 'border-neutral-700 focus:border-neutral-700' : 'border-gray-300 focus:border-gray-300'" />

          <!-- Else input is writeable -->
          <input v-else-if="attribute.type === AttributeType.Date" type="date" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
          <Toggle v-else-if="attribute.type === AttributeType.Bool" class="mt-1" :modelValue="items.length ? items[0][attribute.id] : false" @update:modelValue="value => update(attribute.id, value)" />
          <select v-else-if="attribute.type === AttributeType.Enum" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : (attribute.enumOptions ? attribute.enumOptions[0] : '')"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm cursor-pointer transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'">
            <option v-for="option in attribute.enumOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <textarea v-else-if="attribute.type === AttributeType.LongText" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
          <input v-else type="text" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
        </div>
      </div>
      <!-- Warning -->
      <div v-if="warning" class="px-4 md:px-10 text-sm text-red-500">
        {{ warning }}
      </div>
      <!-- Buttons -->
      <div class="px-4 md:px-10 flex justify-end gap-4">
        <PrimaryButton :disabled="!haveUnsavedChanges || store.loading"
          @click="upsertItem()">
          Save
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import router from '@/router'
import { Page, AttributeType } from '@/utils/config'
import { useStore } from '@/utils/store'
import { initCrud } from '@/utils/dashboard'
import PageHeader from './elements/PageHeader.vue'
import PrimaryButton from './elements/PrimaryButton.vue'
import Toggle from './elements/Toggle.vue'

const store = useStore()

const props = defineProps({
  page: {
    type: Object as PropType<Page>,
    required: true,
  },
})

const { items, warning, haveUnsavedChanges, getItems, upsertItem } = initCrud(props.page)

function update (attributeId:string, newVal:any) {
  items.value[0][attributeId] = newVal
  haveUnsavedChanges.value = true
}
</script>
