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
        <div class="px-4 md:px-10 transition" :class="store.darkMode ? 'text-neutral-200' : 'text-neutral-800'">
          
          <!-- Attribute label -->
          <label :for="attribute.id" class="block text-sm font-medium transition" :class="store.darkMode ? 'text-neutral-400' : 'text-neutral-600'">
            {{ attribute.label }}
            <span v-if="attribute.required" class="font-normal pl-2 transition" :class="store.darkMode ? 'text-neutral-600' : 'text-neutral-400'">required</span>
          </label>

          <!-- Attribute value -->
          <div class="mt-1">
            <!-- If input is read-only -->
            <div v-if="(page.readonly || attribute.readonly)">
              <!-- AttributeType.LongText -->
              <textarea v-if="attribute.type === AttributeType.LongText" readonly :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''" 
                class="sm:text-sm w-full shadow-sm bg-transparent transition"
                :class="store.darkMode ? 'border-neutral-700 focus:border-neutral-700' : 'border-gray-300 focus:border-gray-300'" />
              <!-- AttributeType.Bool -->
              <div v-else-if="attribute.type === AttributeType.Bool" disabled>
                <Toggle :modelValue="items.length ? items[0][attribute.id] || false : false" />
                <span class="capitalize">{{ items.length ? [true, 'true'].includes(items[0][attribute.id]) : false }}</span>
              </div>
              <!-- Default -->
              <input v-else type="text" readonly :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
                class="sm:text-sm w-full shadow-sm bg-transparent transition"
                :class="store.darkMode ? 'border-neutral-700 focus:border-neutral-700' : 'border-neutral-300 focus:border-neutral-300'" />
            </div>
            <!-- Else input is writeable -->
            <div v-else>
              <!-- AttributeType.Date -->
              <input v-if="attribute.type === AttributeType.Date" type="date" :disabled="store.loading" :id="attribute.id"
                :value="items.length ? items[0][attribute.id] : ''"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm w-full border shadow-sm cursor-pointer transition"
                :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
              <!-- AttributeType.Bool -->
              <div v-else-if="attribute.type === AttributeType.Bool" class="sm:text-sm flex items-center gap-2">
                <Toggle :modelValue="items.length ? items[0][attribute.id] || false : false" @update:modelValue="value => update(attribute.id, value)" />
                <span class="capitalize">{{ items.length ? [true, 'true'].includes(items[0][attribute.id]) : false }}</span>
              </div>
              <!-- AttributeType.Enum -->
              <select v-else-if="attribute.type === AttributeType.Enum" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : (attribute.enumOptions ? attribute.enumOptions[0] : '')"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm shadow-sm pr-8 cursor-pointer transition"
                :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'">
                <option v-for="option in attribute.enumOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <!-- AttributeType.LongText -->
              <textarea v-else-if="attribute.type === AttributeType.LongText" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm w-full border shadow-sm transition"
                :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
              <!-- Default -->
              <input v-else type="text" :disabled="store.loading" :id="attribute.id" :value="items.length ? items[0][attribute.id] : ''"
                @input="update(attribute.id, ($event.target as HTMLInputElement).value)"
                class="sm:text-sm w-full shadow-sm transition"
                :class="store.darkMode ? 'bg-neutral-900 border-neutral-700 focus:border-neutral-500' : 'bg-white border-neutral-300 focus:border-neutral-500'" />
            </div>
          </div>
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
  </View>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Page, AttributeType } from '@/utils/config'
import { useStore } from '@/utils/store'
import { initCrud } from '@/utils/dashboard'
import View from './View.vue'
import Toggle from '../elements/Toggle.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'

const store = useStore()

const props = defineProps({
  page: {
    type: Object as PropType<Page>,
    required: true,
  },
  itemId: {
    type: String,
    default: '',
  }
})

const { items, warning, haveUnsavedChanges, upsertItem } = initCrud(props.page)

function update (attributeId:string, newVal:any) {
  items.value[0][attributeId] = newVal
  haveUnsavedChanges.value = true
}
</script>
