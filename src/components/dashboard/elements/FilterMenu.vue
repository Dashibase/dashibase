<template>
  <Popover v-slot="{ open }" class="relative">
      <PopoverButton :class="open ? '' : 'text-opacity-90'">
      <SecondaryButton>
        Filter
        <AdjustmentsIcon v-if="!filters.length" class="w-4" />
        <div v-if="filters.length" class="rounded-full px-1.5 pb-0.5 text-xs mt-0.5 transition" :class="store.darkMode ? 'bg-neutral-800' : 'bg-neutral-200'">
          {{ filters.length }}
        </div>
      </SecondaryButton>
    </PopoverButton>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95" @after-enter="init" @after-leave="apply">
      <PopoverPanel class="min-w-[20rem] origin-top-right fixed sm:absolute left-4 sm:right-0 sm:left-auto mt-2 rounded-md shadow-lg ring-0 ring-opacity-5 focus:outline-none z-50"
        :class="store.darkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-white text-neutral-800'">
        <div v-if="filters.length" class="px-3 py-3 text-xs flex flex-col gap-2 w-max" :class="store.darkMode ? '' : 'text-neutral-700'">
          <div>Show rows</div>
          <div class="flex items-end w-full justify-between" v-for="filter, i in filters" :key="i">
            <div class="flex items-end w-max">
              <div v-if="i === 0">where</div>
              <select v-else-if="i === 1" class="w-max border-0 rounded-md -ml-1 py-0 px-0 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer"
                :class="store.darkMode ? 'bg-neutral-700' : 'bg-white'" v-model="conjunction">
                <option value="and">and</option>
                <option value="or">or</option>
              </select>
              <div v-else>{{ conjunction }}</div>
              <select class="mt-1 block w-max max-w-[4rem] sm:max-w-auto border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer"
                :class="store.darkMode ? 'bg-neutral-700' : 'bg-white'" :value="filter.column" @input="updateFilter(i, 'column', ($event.target as HTMLInputElement).value)">
                <option v-for="attribute in attributes" :key="attribute.id" :value="attribute.id">{{ attribute.label }}</option>
              </select>
              <select class="w-max max-w-[4rem] sm:max-w-auto border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer"
                :class="store.darkMode ? 'bg-neutral-700' : 'bg-white'" :value="filter.operator" @input="updateFilter(i, 'operator', ($event.target as HTMLInputElement).value)">
                <option value="eq">is</option>
                <option value="neq">is not</option>
              </select>
              <input class="w-24 sm:w-40 rounded-md py-0 focus:outline-none focus:ring-0 text-xs" placeholder="Enter condition"
                :class="store.darkMode ? 'bg-neutral-700 border-neutral-700 focus:border-neutral-500 placeholder:text-neutral-400' : 'bg-white border-neutral-300 focus:border-neutral-500'" :value="filter.value" @input="updateFilter(i, 'value', ($event.target as HTMLInputElement).value)" />
            </div>
            <XIcon class="w-3.5 hover:text-red-600 cursor-pointer" @click="deleteFilter(i)" />
          </div>
        </div>
        <button class="group px-3 py-3 w-full text-left bg-transparent rounded-b-md inline-flex text-xs focus:outline-none focus:ring-0 transition flex justify-between" :class="store.darkMode ? '' : 'border-t border-t-neutral-100 text-neutral-600'"
          @click="addFilter">
          <span>Add filter</span>
          <PlusIcon class="w-3.5" :class="store.darkMode ? 'group-hover:text-green-300' : 'group-hover:text-green-600'" />
        </button>
      </PopoverPanel>
    </transition>
  </Popover>
  <Popover v-slot="{ open }" class="relative">
      <PopoverButton :class="open ? '' : 'text-opacity-90'">
      <SecondaryButton>
        Sort
        <SwitchVerticalIcon v-if="!sorts.length" class="w-4" />
        <div v-if="sorts.length" class="rounded-full px-1.5 pb-0.5 text-xs mt-0.5 transition" :class="store.darkMode ? 'bg-neutral-800' : 'bg-neutral-200'">
          {{ sorts.length }}
        </div>
      </SecondaryButton>
    </PopoverButton>
    <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95" @after-enter="init" @after-leave="apply">
      <PopoverPanel class="min-w-[20rem] origin-top-right fixed sm:absolute left-4 sm:right-0 sm:left-auto mt-2 rounded-md shadow-lg ring-0 ring-opacity-5 focus:outline-none z-50"
        :class="store.darkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-white text-neutral-800'">
        <div v-if="sorts.length" class="px-3 py-3 text-xs flex flex-col gap-2 w-full" :class="store.darkMode ? '' : 'text-neutral-700'">
          <div class="flex items-end w-full justify-between" v-for="sort, i in sorts" :key="i">
            <div class="flex items-end w-max">
              <div v-if="i === 0">Sort by</div>
              <div v-else>then</div>
              <select class="mt-1 block w-max max-w-[5rem] sm:max-w-auto border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer"
                :class="store.darkMode ? 'bg-neutral-700' : 'bg-white'" :value="sort.column" @input="updateSort(i, 'column', ($event.target as HTMLInputElement).value)">
                <option v-for="attribute in attributes" :key="attribute.id" :value="attribute.id">{{ attribute.label }}</option>
              </select>
              <select class="w-max border-0 rounded-md py-0 px-1 pr-8 focus:outline-none focus:ring-0 text-xs cursor-pointer"
                :class="store.darkMode ? 'bg-neutral-700' : 'bg-white'" :value="sort.ascending" @input="updateSort(i, 'ascending', ($event.target as HTMLInputElement).value)">
                <option :value="true">Ascending</option>
                <option :value="false">Descending</option>
              </select>
            </div>
            <XIcon class="w-3.5 hover:text-red-600 cursor-pointer" @click="deleteSort(i)" />
          </div>
        </div>
        <button class="group px-3 py-3 w-full text-left bg-transparent rounded-b-md inline-flex text-xs focus:outline-none focus:ring-0 transition flex justify-between" :class="store.darkMode ? '' : 'border-t border-t-neutral-100 text-neutral-600'"
          @click="addSort">
          <span>Add sort</span>
          <PlusIcon class="w-3.5 group-hover:text-green-600" />
        </button>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { XIcon, PlusIcon, AdjustmentsIcon, SwitchVerticalIcon } from '@heroicons/vue/solid'
import { useStore } from '@/utils/store'
import SecondaryButton from './SecondaryButton.vue'

const store = useStore()

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

const prevConjunction = ref('and')
const prevFilters = ref([] as Filter[])
const prevSorts = ref([] as Sort[])
const conjunction = ref('and')
const filters = ref([] as Filter[])
const sorts = ref([] as Sort[])

const props = defineProps({
  attributes: {
    type: Array as PropType<Header[]>,
    required: true,
  },
})

const emit = defineEmits(['close'])

function addFilter () {
  filters.value.push({
    column: props.attributes[0].id,
    operator: 'eq',
    value: '',
  })
}

function updateFilter (idx:number, key:string, value:string) {
  (filters.value[idx] as {[k:string]: any})[key] = value
}

function deleteFilter (idx:number) {
  filters.value.splice(idx, 1)
}

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
  if (haveUnsavedChanges) emit('close', filters.value, conjunction.value, sorts.value)
}
</script>
