<template>
  <View>
    <template #header>
      <div>
        {{ page.name }}
      </div>
    </template>
    <div class="flex flex-col gap-6 max-w-[40rem]">
      <!-- Attribute Inputs -->
      <div v-for="attribute in page.attributes" :key="attribute.id">
        <div class="px-4 md:px-10 transition text-primary dark:text-primary-dark">
          
          <!-- Attribute label -->
          <label :for="attribute.id" class="block text-sm font-medium transition text-secondary dark:text-secondary-dark">
            {{ attribute.label }}
            <span v-if="attribute.required" class="font-normal transition">*</span>
          </label>

          <!-- Attribute value -->
          <div class="mt-1">
            <!-- If input is read-only -->
            <div v-if="(page.readonly || attribute.readonly)">
              <!-- AttributeType.LongText -->
              <textarea v-if="attribute.type === AttributeType.LongText" readonly :id="attribute.id" :value="item[attribute.id] || ''" 
                class="sm:text-sm w-full shadow-sm bg-input-disabled dark:bg-input-disabled-dark transition border-neutral-300 focus:border-neutral-300 dark:border-neutral-700 dark:focus:border-neutral-700" />
              <!-- AttributeType.Bool -->
              <div v-else-if="attribute.type === AttributeType.Bool">
                <Toggle :modelValue="item[attribute.id] || false" :disabled="true" />
                <span class="capitalize">{{ [true, 'true'].includes(item[attribute.id]) }}</span>
              </div>
              <!-- Default -->
              <input v-else type="text" readonly :id="attribute.id" :value="item[attribute.id] || ''"
                class="sm:text-sm w-full shadow-sm bg-input-disabled dark:bg-input-disabled-dark transition border-neutral-300 focus:border-neutral-300 dark:border-neutral-700 dark:focus:border-neutral-700" />
            </div>
            <!-- Else input is writeable -->
            <div v-else>
              <!-- AttributeType.Date -->
              <input v-if="attribute.type === AttributeType.Date" type="date" :disabled="store.loading" :id="attribute.id"
                :value="item[attribute.id] || ''"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm w-full border shadow-sm cursor-pointer transition bg-input dark:bg-input-dark border-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500" />
              <!-- AttributeType.Bool -->
              <div v-else-if="attribute.type === AttributeType.Bool" class="sm:text-sm flex items-center gap-2">
                <Toggle :modelValue="item[attribute.id] || false" @update:modelValue="value => update(attribute.id, value)" />
                <span class="capitalize">{{ [true, 'true'].includes(item[attribute.id]) }}</span>
              </div>
              <!-- AttributeType.Enum -->
              <select v-else-if="attribute.type === AttributeType.Enum" :disabled="store.loading" :id="attribute.id" :value="item[attribute.id] || (attribute.enumOptions ? attribute.enumOptions[0] : '')"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm shadow-sm pr-8 cursor-pointer transition bg-input dark:bg-input-dark border-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500">
                <option v-for="option in attribute.enumOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <!-- AttributeType.LongText -->
              <textarea v-else-if="attribute.type === AttributeType.LongText" :disabled="store.loading" :id="attribute.id" :value="item[attribute.id] || ''"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm w-full border shadow-sm transition bg-input dark:bg-input-dark border-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500" />
              <!-- Default -->
              <input v-else type="text" :disabled="store.loading" :id="attribute.id" :value="item[attribute.id] || ''"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm w-full shadow-sm transition bg-input dark:bg-input-dark border-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500" />
            </div>
          </div>
        </div>
      </div>
      <!-- Warning -->
      <div v-if="warning" class="px-4 md:px-10 text-sm text-red-500">
        {{ warning }}
      </div>
      <!-- Buttons -->
      <div class="px-4 md:px-10 flex justify-between gap-4">
        <div>
          <DeleteButton v-if="itemId" :disabled="store.loading" @click="deleteItem">
            Delete
          </DeleteButton>
        </div>
        <div class="flex gap-4">
          <TertiaryButton v-if="createMode || itemId" :to="`/${pageId}`">
            Back
          </TertiaryButton>
          <PrimaryButton :disabled="!haveUnsavedChanges || store.loading" @click="upsertItem(item)">
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
    <DeleteModal ref="deleteModal">
      <template #title>Confirm deletion</template>
      <p>Are you sure you want to delete this?</p>
    </DeleteModal>
  </View>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Page, AttributeType } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import View from './View.vue'
import Toggle from '../elements/Toggle.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import TertiaryButton from '../elements/buttons/TertiaryButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'

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
  createMode: {
    type: Boolean,
    default: false,
  },
})

const page = computed(():Page => {
  return store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
})

const { item, warning, haveUnsavedChanges, getItem, upsertItem, deleteItems } = initCrud(page.value, props.itemId)

if (props.createMode) {
  item.value = {} as {[k:string]:any}
  page.value.attributes.forEach(attr => {
    if (attr.type === AttributeType.Bool) {
      item.value[attr.id] = false
    } else if (attr.type === AttributeType.Enum) {
      if (attr.enumOptions && attr.enumOptions.length) item.value[attr.id] = attr.enumOptions[0]
      else item.value[attr.id] = ''
    }
  })
}

function update (attributeId:string, newVal:any) {
  item.value[attributeId] = newVal
  haveUnsavedChanges.value = true
}

const deleteModal = ref<any|null>(null)
async function deleteItem () {
  if (!deleteModal.value) return
  const confirm = await deleteModal.value.confirm()
  if (confirm) {
    deleteItems([props.itemId])
  }
}

if (props.itemId) getItem(props.itemId)
</script>
