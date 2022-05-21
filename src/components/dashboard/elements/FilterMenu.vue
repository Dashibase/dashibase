<template>
  <Popover v-slot="{ open }" class="relative">
      <PopoverButton :class="open ? '' : 'text-opacity-90'">
      <SecondaryButton>
        Filter
        <AdjustmentsIcon v-if="!filters.length" class="w-4" />
        <div v-if="filters.length" class="rounded-full px-1.5 text-xs mt-0.5 transition bg-neutral-200 dark:bg-neutral-800">
          {{ filters.length }}
        </div>
      </SecondaryButton>
    </PopoverButton>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95" @after-enter="init" @after-leave="apply">
      <PopoverPanel class="min-w-[20rem] origin-top-right fixed sm:absolute left-4 sm:right-0 sm:left-auto mt-2 rounded-md shadow-lg ring-0 ring-opacity-5 focus:outline-none z-50 bg-white text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
        <div v-if="filters.length" class="px-3 py-3 text-xs flex flex-col gap-2 w-max text-neutral-700 dark:text-neutral-200">
          <div>Show rows</div>
          <div class="flex items-end w-full justify-between" v-for="filter, i in filters" :key="i">
            <div class="flex items-end w-max">
              <div v-if="i === 0">where</div>
              <select v-else-if="i === 1" v-model="conjunction"
                class="w-max border-0 rounded-md -ml-1 py-0 px-0 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option value="and">and</option>
                <option value="or">or</option>
              </select>
              <div v-else>{{ conjunction }}</div>
              <select :value="filter.column" @input="updateFilter(i, 'column', ($event.target as HTMLInputElement).value)"
                class="mt-1 block w-max max-w-[4rem] sm:max-w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option v-for="attribute in attributes" :key="attribute.id" :value="attribute.id">{{ attribute.label }}</option>
              </select>
              <select :value="filter.operator" @input="updateFilter(i, 'operator', ($event.target as HTMLInputElement).value)"
                class="w-max max-w-[4rem] sm:max-w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option value="fts">contains</option>
                <option value="neq">is not</option>
              </select>
              <input :value="filter.value" @input="updateFilter(i, 'value', ($event.target as HTMLInputElement).value)" placeholder="Enter condition"
                class="w-24 sm:w-40 rounded-md py-0 focus:outline-none focus:ring-0 text-xs bg-white border-neutral-300 focus:border-neutral-500 dark:bg-neutral-700 dark:border-neutral-700 dark:focus:border-neutral-500 dark:placeholder:text-neutral-400" />
            </div>
            <XIcon class="w-3.5 hover:text-red-600 cursor-pointer" @click="deleteFilter(i)" />
          </div>
        </div>
        <button class="group px-3 py-3 w-full text-left bg-transparent rounded-b-md inline-flex text-xs focus:outline-none focus:ring-0 transition flex justify-between" @click="addFilter">
          <span>Add filter</span>
          <PlusIcon class="w-3.5 group-hover:text-green-600 dark:group-hover:text-green-300" />
        </button>
      </PopoverPanel>
    </transition>
  </Popover>
  <Popover v-slot="{ open }" class="relative">
      <PopoverButton :class="open ? '' : 'text-opacity-90'">
      <SecondaryButton>
        Sort
        <SwitchVerticalIcon v-if="!sorts.length" class="w-4" />
        <div v-if="sorts.length" class="rounded-full px-1.5 text-xs mt-0.5 transition bg-neutral-200 dark:bg-neutral-800">
          {{ sorts.length }}
        </div>
      </SecondaryButton>
    </PopoverButton>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95" @after-enter="init" @after-leave="apply">
      <PopoverPanel class="min-w-[20rem] origin-top-right fixed sm:absolute left-4 sm:right-0 sm:left-auto mt-2 rounded-md shadow-lg ring-0 ring-opacity-5 focus:outline-none z-50 bg-white text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
        <div v-if="sorts.length" class="px-3 py-3 text-xs flex flex-col gap-2 w-full text-neutral-700 dark:text-neutral-200">
          <div class="flex items-end w-full justify-between" v-for="sort, i in sorts" :key="i">
            <div class="flex items-end w-max">
              <div v-if="i === 0">Sort by</div>
              <div v-else>then</div>
              <select :value="sort.column" @input="updateSort(i, 'column', ($event.target as HTMLInputElement).value)"
                class="mt-1 block w-max max-w-[5rem] sm:max-w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option v-for="attribute in attributes" :key="attribute.id" :value="attribute.id">{{ attribute.label }}</option>
              </select>
              <select :value="sort.ascending" @input="updateSort(i, 'ascending', ($event.target as HTMLInputElement).value)"
                class="w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer bg-white dark:bg-neutral-700">
                <option :value="true">Ascending</option>
                <option :value="false">Descending</option>
              </select>
            </div>
            <XIcon class="w-3.5 hover:text-red-600 cursor-pointer" @click="deleteSort(i)" />
          </div>
        </div>
        <button class="group px-3 py-3 w-full text-left bg-transparent rounded-b-md inline-flex text-xs focus:outline-none focus:ring-0 transition flex justify-between" @click="addSort">
          <span>Add sort</span>
          <PlusIcon class="w-3.5 group-hover:text-green-600 dark:group-hover:text-green-300" />
        </button>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { XIcon, PlusIcon, AdjustmentsIcon, SwitchVerticalIcon } from '@heroicons/vue/solid'
import SecondaryButton from './buttons/SecondaryButton.vue'

interface Header {
  id: string;
  label: string;
}

interface Filter {
  column: string;
  operator: string;
  value: string;
}

interface Sort {
  column: string;
  ascending: boolean;
}

const props = defineProps({
  attributes: {
    type: Array as PropType<Header[]>,
    required: true,
  },
})

const emit = defineEmits(['close'])

function init () {
  prevConjunction.value = conjunction.value
  prevFilters.value = JSON.parse(JSON.stringify(filters.value))
  prevSorts.value = JSON.parse(JSON.stringify(sorts.value))
}

function apply () {
  const haveUnsavedChanges = 
    (JSON.stringify(filters.value) !== JSON.stringify(prevFilters.value)) ||
    (JSON.stringify(sorts.value) !== JSON.stringify(prevSorts.value)) ||
    (conjunction.value !== prevConjunction.value)
  // Only apply filters/sorts if they have been changed 
  if (haveUnsavedChanges) emit('close', filters.value, conjunction.value, sorts.value)
}

// Filters
const prevConjunction = ref('and')
const conjunction = ref('and')
const prevFilters = ref([] as Filter[])
const filters = ref([] as Filter[])

function addFilter () {
  filters.value.push({
    column: props.attributes[0].id,
    operator: 'fts',
    value: '',
  })
}

function updateFilter (idx:number, key:string, value:string) {
  (filters.value[idx] as {[k:string]: any})[key] = value
}

function deleteFilter (idx:number) {
  filters.value.splice(idx, 1)
}

// Sorts
const prevSorts = ref([] as Sort[])
const sorts = ref([] as Sort[])

function addSort () {
  sorts.value.push({
    column: props.attributes[0].id,
    ascending: true,
  })
}

function updateSort (idx:number, key:string, value:string) {
  (sorts.value[idx] as {[k:string]: any})[key] = key === 'ascending' ? value === 'true' : value
}

function deleteSort (idx:number) {
  sorts.value.splice(idx, 1)
}
</script>
