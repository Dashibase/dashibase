<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex items-center">
      <h1 class="text-2xl font-medium">{{ page.name }}</h1>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <div class="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2">
      <!-- Cards -->
      <a v-for="(item, i) in items" :key="item.id" class="bg-white block relative hover:bg-gray-50 cursor-pointer border rounded px-2 py-1" :href="`/${page.page_id}/view/${item.id}`">
        <div class="absolute top-0 left-0 w-full text-sm text-gray-300 text-right px-1">
          #{{ i + 1 + ((paginationNum - 1) * maxItems) }}
        </div>
        <div class="flex flex-col gap-2 p-2">
          <div v-for="attribute in page.attributes" :key="attribute.id"
            class="font-medium text-gray-900 flex flex-col gap-1">
            <div class="text-gray-300 text-sm">{{ attribute.label }}</div>
            <div class="truncate">{{ item[attribute.id] }}</div>
          </div>
        </div>
        <div v-if="!page.readonly" class="absolute bottom-0 right-0 text-sm text-gray-300 hover:text-red-600 flex justify-end px-1 py-1" @click="event => deleteItem(item.id, event)">
          <TrashIcon class="w-4 h-4 cursor-pointer" />
        </div>
      </a>
      <!-- New Item -->
      <a v-if="!page.readonly" class="w-full border rounded px-4 py-3 text-gray-300 cursor-pointer hover:border-green-200 hover:bg-green-100 hover:text-green-400 flex justify-between"
        :href="`/${page.page_id}/new`">
        <div class="font-medium">New item</div>
        <PlusIcon class="h-5" />
      </a>
    </div>
    <Pagination class="mt-10 px-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import {
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/solid'
import { Page } from '../../utils/config'
import { initLoading, initCrud } from '../../utils/dashboard'
import DropDown from './form-elements/DropDown.vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Object as PropType<Page>,
    required: true,
  },
})

const maxItems = 10

const { loading } = initLoading(props.loading)
const { page, warning, items, paginationNum, maxPagination, paginationList, getItems, deleteItem } = initCrud(loading, props.page, maxItems)

getItems()
</script>
