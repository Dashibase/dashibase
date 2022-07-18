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
              <div v-else-if="attribute.type === AttributeType.Bool" class="sm:text-sm flex items-center gap-2">
                <Toggle :modelValue="item[attribute.id] || false" :disabled="true" />
                <span class="capitalize">{{ [true, 'true'].includes(item[attribute.id]) }}</span>
              </div>
              <!-- AttributeType.Join && Array -->
              <div v-else-if="attribute.type === AttributeType.Join && item[attribute.id] && item[attribute.id].constructor === Array" class="sm:text-sm flex items-center gap-2">
                <Badge v-for="i in item[attribute.id]" :title="i">{{ i }}</Badge>
              </div>
              <!-- Handle URLs -->
              <div v-else-if="item[attribute.id] && linkify.test(item[attribute.id].toString())" :title="item[attribute.id]"
                class="border px-3 py-2 rounded-md sm:text-sm w-full shadow-sm bg-input-disabled dark:bg-input-disabled-dark transition border-neutral-300 focus:border-neutral-300 dark:border-neutral-700 dark:focus:border-neutral-700 truncate">
                <a :href="linkify.find(item[attribute.id])[0].href" target="_blank" class="underline hover:text-neutral-900" @click="$event.stopImmediatePropagation()">{{ item[attribute.id] }}</a>
              </div>
              <!-- Handle timestamps -->
              <!-- <div v-else-if="item[attribute.id] && !isNaN((new Date(item[attribute.id].toString())).getTime())" :title="item[attribute.id]"
                class="border px-3 py-2 rounded-md sm:text-sm w-full shadow-sm bg-input-disabled dark:bg-input-disabled-dark transition border-neutral-300 focus:border-neutral-300 dark:border-neutral-700 dark:focus:border-neutral-700 truncate">
                {{ (new Date(item[attribute.id])).toLocaleString() }}
              </div> -->
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
                class="sm:text-sm w-full border shadow-sm bg-input dark:bg-input-dark border-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500" />
              <!-- AttributeType.Join -->
              <div v-else-if="attribute.type === AttributeType.Join" class="relative">
                <div v-if="getJoinType(attribute.id) === 'single'">
                  <select :disabled="store.loading" :id="attribute.id"
                    :value="item[getForeignPrimaryKeyAttribute(attribute.id)]"
                    @input="update(getForeignPrimaryKeyAttribute(attribute.id), ($event.target as HTMLInputElement).value)"
                    class="sm:text-sm shadow-sm pr-8 cursor-pointer transition bg-input dark:bg-input-dark border-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500">
                    <option v-for="option in getForeignOptions(attribute.id)" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div v-else-if="getJoinType(attribute.id) === 'multi'">
                  <Combobox :options="getForeignOptions(attribute.id)" :selected="item[getForeignPrimaryKeyAttribute(attribute.id)]"
                    @update="value => update(getForeignPrimaryKeyAttribute(attribute.id), value)" />
                </div>
                <div v-else class="h-10 rounded bg-neutral-200 dark:bg-neutral-800 w-48 flex items-center px-5 text-sm animate-pulse">Loading...</div>
              </div>
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
      <!-- Triggers -->
      <div v-if="page.triggers.length" class="w-full py-2 px-4 md:px-10 flex gap-2 justify-end">
        <SecondaryButton v-for="trigger, i in page.triggers" :key="i" @click="trigger.call ? trigger.call([item], store.user) : null">{{ trigger.label }}</SecondaryButton>
      </div>
      <!-- Buttons -->
      <div class="px-4 md:px-10 flex justify-between gap-4">
        <div>
          <DeleteButton v-if="itemId && !page.readonly" :disabled="store.loading" @click="deleteItem">
            Delete
          </DeleteButton>
        </div>
        <div class="flex gap-4">
          <TertiaryButton v-if="createMode || itemId" :to="`/${pageId}`">
            Back
          </TertiaryButton>
          <PrimaryButton v-if="!page.readonly" :disabled="!haveUnsavedChanges || store.loading" @click="upsertItem(item)">
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
import * as linkify from 'linkifyjs'
import { Page, AttributeType } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import { getForeignTable, getForeignPrimaryKeyAttribute } from '@/utils/joins'
import View from './View.vue'
import Toggle from '../elements/Toggle.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import SecondaryButton from '../elements/buttons/SecondaryButton.vue'
import TertiaryButton from '../elements/buttons/TertiaryButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'
import Combobox from '../elements/Combobox.vue'
import Badge from '../elements/Badge.vue'

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
  const page = store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
  // Create functions
  page.triggers = page.triggers ? page.triggers.map(trigger => {
    const args = ['items', 'user']
    trigger.call = new Function(...args, trigger.code)
    return trigger
  }) : []
  return page
})

const { item, warning, haveUnsavedChanges, joinedData, getItem, upsertItem, deleteItems } = initCrud(page.value, props.itemId)

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
    setTimeout(() => deleteItems([props.itemId]), 100) 
  }
}

// Helper functions for handling joined attributes

function getJoinType (attributeId:string) {
  return Object.keys(joinedData.value).length ? joinedData.value[getForeignTable(attributeId)].type : ''
}

function getForeignId (attributeId:string) {
  return store.dashboard.schema.t[getForeignTable(attributeId)].pk
}

function getForeignOptions (attributeId:string) {
  const innermostAttribute = attributeId.split('(').slice(-1)[0].split(')')[0]
  const options = Object.keys(joinedData.value).length ? joinedData.value[getForeignTable(attributeId)].data
    .map((i:any) => {
      return {
        label: i[innermostAttribute],
        value: i[getForeignId(attributeId)],
      }
    }) : []
  return options
}

if (props.itemId) getItem(props.itemId)
</script>
