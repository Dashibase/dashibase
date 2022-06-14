<template>
  <!-- Filter -->
  <Popover v-slot="{ open }" class="relative">
    <PopoverButton
      :class="[open ? '' : 'text-opacity-90', 'shadow border border-transparent bg-overlay text-primary hover:bg-highlight hover:text-primary-focus disabled:bg-input-disabled disabled:text-tertiary dark:bg-overlay-dark dark:text-primary-dark dark:hover:bg-highlight-dark dark:hover:text-primary-focus-dark dark:disabled:bg-input-disabled-dark dark:disabled:text-tertiary-dark block rounded-md py-1 px-3 flex justify-center items-center gap-1 text-sm font-medium focus:outline-none focus:ring-0 transition']">
      Filter
      <FilterIcon v-if="!filters.length" class="w-3.5" />
      <div v-if="filters.length"
        class="rounded-full px-1.5 text-xs mt-0.5 transition bg-neutral-200 dark:bg-neutral-800">
        {{ filters.length }}
      </div>
    </PopoverButton>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95"
      @after-enter="init" @after-leave="apply">
      <PopoverPanel
        class="min-w-[20rem] origin-top-right fixed sm:absolute left-4 sm:right-0 sm:left-auto mt-2 rounded-md shadow-lg ring-0 ring-opacity-5 focus:outline-none z-50 bg-overlay dark:bg-overlay-dark text-primary dark:text-primary-dark">
        <div v-if="filters.length"
          class="px-3 py-3 text-xs flex flex-col gap-2 w-full text-primary dark:text-primary-dark">
          <div>Show rows</div>
          <div class="flex items-end w-full justify-between" v-for="filter, i in filters" :key="i">
            <div class="flex items-end w-max">
              <div v-if="i === 0">where</div>
              <select v-else-if="i === 1" v-model="conjunction"
                class="w-max border-0 rounded-md py-0 px-0 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-overlay dark:bg-overlay-dark">
                <option value="and">and</option>
                <option value="or">or</option>
              </select>
              <div v-else>{{ conjunction }}</div>
              <select :value="filter.column"
                @input="updateFilter(i, 'column', ($event.target as HTMLInputElement).value)"
                class="mt-1 block w-max max-w-[4rem] sm:max-w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-overlay dark:bg-overlay-dark">
                <option
                  v-for="attribute in attributes.filter(attr => Object.keys(filterOps).includes(getSupabaseType(attr.id)))"
                  :key="attribute.id" :value="attribute.id">{{ attribute.label }}</option>
              </select>
              <select :value="filter.operator" v-if="filterOps[getSupabaseType(filter.column)].length > 1"
                @input="updateFilter(i, 'operator', ($event.target as HTMLInputElement).value)"
                class="w-max max-w-[4rem] sm:max-w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-overlay dark:bg-overlay-dark">
                <option v-for="op in filterOps[getSupabaseType(filter.column)]" :key="op.id" :value="op.id">{{
                    op.label
                }}</option>
              </select>
              <div v-else class="text-xs font-normal">{{ filterOps[getSupabaseType(filter.column)][0].label }}
              </div>
              <input v-if="getSupabaseType(filter.column) === 'text'" :value="filter.value"
                @input="updateFilter(i, 'value', ($event.target as HTMLInputElement).value)"
                placeholder="Enter condition"
                class="w-24 sm:w-32 rounded-md py-0 focus:outline-none focus:ring-0 text-xs border-neutral-300 focus:border-neutral-500 bg-overlay dark:bg-overlay-dark dark:border-neutral-700 dark:focus:border-neutral-500 dark:placeholder:text-neutral-400" />
              <input v-else-if="getSupabaseType(filter.column) === 'date'" type="date" :value="filter.value"
                @input="updateFilter(i, 'value', ($event.target as HTMLInputElement).value)"
                placeholder="Enter condition"
                class="rounded-md p-0 border-none focus:outline-none focus:ring-0 text-xs border-neutral-300 focus:border-neutral-500 bg-overlay dark:bg-overlay-dark dark:border-neutral-700 dark:focus:border-neutral-500 dark:placeholder:text-neutral-400" />
              <select v-else-if="getSupabaseType(filter.column) === 'boolean'" :value="filter.value"
                @input="updateFilter(i, 'value', ($event.target as HTMLInputElement).value)"
                class="rounded-md py-0 border-none focus:outline-none focus:ring-0 text-xs border-neutral-300 focus:border-neutral-500 bg-overlay dark:bg-overlay-dark dark:border-neutral-700 dark:focus:border-neutral-500 dark:placeholder:text-neutral-400">
                <option :value="true">true</option>
                <option :value="false">false</option>
              </select>
            </div>
            <XIcon class="w-3.5 hover:text-red-600 cursor-pointer" @click="deleteFilter(i)" />
          </div>
        </div>
        <button
          class="group px-3 py-3 w-full text-left bg-transparent rounded-b-md text-xs focus:outline-none focus:ring-0 transition flex justify-between"
          @click="addFilter">
          <span>Add filter</span>
          <PlusIcon class="w-3.5 group-hover:text-green-600 dark:group-hover:text-green-300" />
        </button>
      </PopoverPanel>
    </transition>
  </Popover>
  <!-- Sort -->
  <Popover v-slot="{ open }" class="relative">
    <PopoverButton
      :class="[open ? '' : 'text-opacity-90', 'shadow border border-transparent bg-overlay text-primary hover:bg-highlight hover:text-primary-focus disabled:bg-input-disabled disabled:text-tertiary dark:bg-overlay-dark dark:text-primary-dark dark:hover:bg-highlight-dark dark:hover:text-primary-focus-dark dark:disabled:bg-input-disabled-dark dark:disabled:text-tertiary-dark block rounded-md py-1 px-3 flex justify-center items-center gap-1 text-sm font-medium focus:outline-none focus:ring-0 transition']">
      Sort
      <SwitchVerticalIcon v-if="!sorts.length" class="w-3.5" />
      <div v-if="sorts.length" class="rounded-full px-1.5 text-xs mt-0.5 transition bg-neutral-200 dark:bg-neutral-800">
        {{ sorts.length }}
      </div>
    </PopoverButton>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95"
      @after-enter="init" @after-leave="apply">
      <PopoverPanel
        class="min-w-[20rem] origin-top-right fixed sm:absolute left-4 sm:right-0 sm:left-auto mt-2 rounded-md shadow-lg ring-0 ring-opacity-5 focus:outline-none z-50 bg-overlay text-primary dark:bg-overlay-dark dark:text-primary-dark">
        <div v-if="sorts.length"
          class="px-3 py-3 text-xs flex flex-col gap-2 w-full text-primary dark:text-primary-dark">
          <div class="flex items-end w-full justify-between" v-for="sort, i in sorts" :key="i">
            <div class="flex items-end w-max">
              <div v-if="i === 0">Sort by</div>
              <div v-else>then</div>
              <select :value="sort.column" @input="updateSort(i, 'column', ($event.target as HTMLInputElement).value)"
                class="mt-1 block w-max max-w-[5rem] sm:max-w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option v-for="attribute in validFilterColumns" :key="attribute.id" :value="attribute.id">{{ attribute.label }}
                </option>
              </select>
              <select :value="sort.ascending"
                @input="updateSort(i, 'ascending', ($event.target as HTMLInputElement).value)"
                class="w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option :value="true">Ascending</option>
                <option :value="false">Descending</option>
              </select>
            </div>
            <XIcon class="w-3.5 hover:text-red-600 cursor-pointer" @click="deleteSort(i)" />
          </div>
        </div>
        <button
          class="group px-3 py-3 w-full text-left bg-transparent rounded-b-md inline-flex text-xs focus:outline-none focus:ring-0 transition flex justify-between"
          @click="addSort">
          <span>Add sort</span>
          <PlusIcon class="w-3.5 group-hover:text-green-600 dark:group-hover:text-green-300" />
        </button>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/utils/store'
import { Attribute, AttributeType } from '@/utils/config'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { XIcon, PlusIcon } from '@heroicons/vue/solid'
import { FilterIcon, SwitchVerticalIcon } from '@heroicons/vue/outline'


const route = useRoute()
const store = useStore()
const props = defineProps({
  attributes: {
    type: Array as PropType<Attribute[]>,
    required: true,
  },
})
const emit = defineEmits(['close'])

function init() {
  prevConjunction.value = conjunction.value
  prevFilters.value = JSON.parse(JSON.stringify(filters.value))
  prevSorts.value = JSON.parse(JSON.stringify(sorts.value))
}

function apply() {
  const haveUnsavedChanges =
    (JSON.stringify(filters.value) !== JSON.stringify(prevFilters.value)) ||
    (JSON.stringify(sorts.value) !== JSON.stringify(prevSorts.value)) ||
    (conjunction.value !== prevConjunction.value)
  // Only apply filters/sorts if they have been changed 
  if (haveUnsavedChanges) emit('close', filters.value, conjunction.value, sorts.value)
}

// Customize the filters based on attribute type inferred from Supabase schema

const tableId = computed(() => {
  const pageId = route.params.pageId
  const page = store.dashboard.pages.find(page => page.page_id === pageId)
  if (!page) return ''
  else return page.table_id
})

function getSupabaseType(attributeId: string) {
  if (!store.dashboard.schema.t[tableId.value].properties[attributeId]) return ''
  else return store.dashboard.schema.t[tableId.value].properties[attributeId].format
}

// Filters

interface Filter {
  column: string;
  operator: string;
  value: any;
}

const prevConjunction = ref('and')
const conjunction = ref('and')
const prevFilters = ref([] as Filter[])
const filters = ref([] as Filter[])

const filterOps = {
  'text': [
    { label: 'contains', id: 'fts', },
    { label: 'is not', id: 'neq', },
  ],
  'date': [
    { label: 'after', id: 'gt', },
    { label: 'on', id: 'eq', },
    { label: 'before', id: 'lt', },
  ],
  'boolean': [
    { label: 'is', id: 'is', },
  ],
} as { [k: string]: any[] }

function addFilter() {
  filters.value.push({
    column: props.attributes[0].id,
    operator: 'fts',
    value: '',
  })
}

function updateFilter(idx: number, key: string, value: string) {
  (filters.value[idx] as { [k: string]: any })[key] = value
  if (key === 'column') {
    const type = getSupabaseType(value)
    if (!filterOps[type].map(op => op.id).includes(filters.value[idx].operator)) {
      filters.value[idx].operator = filterOps[type][0].id
    }
    if (type === 'date') {
      filters.value[idx].value = (new Date()).toISOString().slice(0,10)
    } else if (type === 'boolean' && ![true, false].includes(filters.value[idx].value)) {
      filters.value[idx].value = true
    }
  }
}

function deleteFilter(idx: number) {
  filters.value.splice(idx, 1)
}

// Sorts

interface Sort {
  column: string;
  ascending: boolean;
}

const validFilterColumns = computed(() => {
  return props.attributes
    .filter(attr => attr.type !== AttributeType.Join)
    .filter(attr => !['json', 'jsonb'].includes(getSupabaseType(attr.id)))
})

const prevSorts = ref([] as Sort[])
const sorts = ref([] as Sort[])

function addSort() {
  sorts.value.push({
    column: props.attributes[0].id,
    ascending: true,
  })
}

function updateSort(idx: number, key: string, value: string) {
  (sorts.value[idx] as { [k: string]: any })[key] = key === 'ascending' ? value === 'true' : value
}

function deleteSort(idx: number) {
  sorts.value.splice(idx, 1)
}
</script>
