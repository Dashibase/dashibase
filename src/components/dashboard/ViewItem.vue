<template>
  <div class="space-y-6 sm:px-6 lg:px-0 w-full">
    <div class="mx-auto w-full">
      <div class="px-4 md:px-10 py-12 flex justify-between items-end">
        <PageHeader>
          <h1 class="cursor-pointer" @click="router.push(`/${page.page_id}`)">{{ page.name }}</h1>
          <ChevronRightIcon class="inline text-neutral-500 h-6 w-auto" />
          <h1>Item</h1>
        </PageHeader>
      </div>
      <div class="flex flex-col gap-6">
        <!-- Attribute Inputs -->
        <div v-for="attribute in page.attributes" :key="attribute.id">
          <div class="px-4 md:px-10 transition" :class="store.darkMode ? 'text-neutral-200' : 'text-neutral-800'">
            <label :for="attribute.id" class="block text-sm font-medium transition" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-600'">
              {{ attribute.label }}
              <span v-if="attribute.required" class="font-normal pl-2 transition" :class="store.darkMode ? 'text-neutral-600' : 'text-neutral-400'">required</span>
            </label>

            <!-- If input is read-only -->
          <textarea v-if="(page.readonly || attribute.readonly) && attribute.type === AttributeType.LongText" readonly :id="attribute.id" :value="items.length ? item[attribute.id] : ''" 
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition"
            :class="store.darkMode ? 'border-neutral-700 focus:border-neutral-700' : 'border-gray-300 focus:border-gray-300'" />
          <div v-else-if="(page.readonly || attribute.readonly) && attribute.type === AttributeType.Bool" disabled class="mt-1">
            <Toggle :modelValue="items.length ? item[attribute.id] : false" />
            <span class="capitalize">{{ items.length ? [true, 'true'].includes(item[attribute.id]) : false }}</span>
          </div>
          <input v-else-if="page.readonly || attribute.readonly" type="text" readonly :id="attribute.id" :value="items.length ? item[attribute.id] : ''"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition"
            :class="store.darkMode ? 'border-neutral-700 focus:border-neutral-700' : 'border-gray-300 focus:border-gray-300'" />

          <!-- Else input is writeable -->
          <input v-else-if="attribute.type === AttributeType.Date" type="date" :disabled="store.loading" :id="attribute.id" :value="items.length ? item[attribute.id] : ''"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
          <div v-else-if="attribute.type === AttributeType.Bool" class="mt-1 text-sm flex items-center gap-2">
            <Toggle :modelValue="items.length ? item[attribute.id] : false" @update:modelValue="(value:any) => update(attribute.id, value)" />
            <span class="capitalize">{{ items.length ? [true, 'true'].includes(item[attribute.id]) : false }}</span>
          </div>
          <select v-else-if="attribute.type === AttributeType.Enum" :disabled="store.loading" :id="attribute.id" :value="items.length ? item[attribute.id] : (attribute.enumOptions ? attribute.enumOptions[0] : '')"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm cursor-pointer transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'">
            <option v-for="option in attribute.enumOptions" :key="option" :value="option">{{ option }}</option>
          </select>
          <textarea v-else-if="attribute.type === AttributeType.LongText" :disabled="store.loading" :id="attribute.id" :value="items.length ? item[attribute.id] : ''"
            @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
            class="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-0 sm:text-sm transition"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
          <input v-else type="text" :disabled="store.loading" :id="attribute.id" :value="items.length ? item[attribute.id] : ''"
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
        <div class="px-4 md:px-10 flex justify-between gap-4">
          <DeleteButton :disabled="store.loading" @click="deleteItemHelper">
            Delete
          </DeleteButton>
          <div class="flex gap-4">
            <TertiaryButton :disabled="store.loading" @click="router.go(-1)">
              Back
            </TertiaryButton>
            <PrimaryButton :disabled="!haveUnsavedChanges || store.loading" @click="upsertItem(itemId)">
              Save
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
    <DeleteModal ref="deleteModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/solid'
import router from '@/router'
import { useStore } from '@/utils/store'
import { initCrud } from '@/utils/dashboard'
import { AttributeType, Page } from '@/utils/config'
import { isUUID } from '@/utils/utils'
import PageHeader from './elements/PageHeader.vue'
import TertiaryButton from './elements/TertiaryButton.vue'
import DeleteButton from './elements/DeleteButton.vue'
import PrimaryButton from './elements/PrimaryButton.vue'
import DeleteModal from './DeleteModal.vue'
import Toggle from './elements/Toggle.vue'

const store = useStore()

const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    default: '',
  },
})
const deleteModal = ref<any|null>(null)

const page = computed(():Page => {
  return store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
})
const { items, warning, haveUnsavedChanges, upsertItem, deleteItems, getItem } = initCrud(page.value)

const item = computed(() => {
  let itemId = props.itemId as string|number
  if (!isUUID(props.itemId)) itemId = parseInt(props.itemId)
  return items.value.find((item:any) => item.id === itemId) || {}
})

function update (attributeId:string, newVal:any) {
  item.value[attributeId] = newVal
  haveUnsavedChanges.value = true
}

async function deleteItemHelper () {
  if (!deleteModal.value) return
  deleteModal.value.title = 'Confirm deletion'
  deleteModal.value.message = 'Are you sure you want to delete this?'
  const confirm = await deleteModal.value?.confirm()
  if (confirm) {
    deleteItems([props.itemId])
      .then(() => router.push(`/${props.pageId}`))
  }
}

getItem(props.itemId)
</script>
