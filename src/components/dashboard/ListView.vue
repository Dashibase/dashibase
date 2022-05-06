<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex items-center">
      <h1 class="text-2xl font-medium">{{ view.name }}</h1>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <!-- Mobile view -->
    <div class="mt-2 sm:hidden">
      <div class="px-4 sm:px-10">
        <h2 class="text-gray-500 text-xs font-medium uppercase tracking-wide">Items</h2>
      </div>
      <ul role="list" class="mt-3 border-t border-gray-200 divide-y divide-gray-100">
        <li v-for="(item, i) in items" :key="i">
          <a :href="`/${view.view_id}/view/${item.id}`" class="group flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6">
            <span class="flex items-center truncate space-x-3">
              <span class="font-medium truncate text-sm leading-6">
                {{ item[view.attributes[0].id] }}
              </span>
            </span>
            <ChevronRightIcon class="ml-4 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
          </a>
        </li>
      </ul>
      <!-- New Item -->
      <a v-if="!view.readonly" class="block group border border-x-0 border-t-gray-100 cursor-pointer hover:bg-green-50" :href="`/${view.view_id}/new`">
        <div class="flex justify-between px-4 py-3 text-sm font-medium text-gray-400 group-hover:text-green-700">
          <div>New</div>
          <PlusIcon class="w-5 h-5" />
        </div>
      </a>
      <div class="block border border-x-0 border-t-0 border-b-1 border-t-gray-100">
        <div class="flex justify-between px-4 py-3 text-sm font-medium text-gray-400 items-center">
          <div class="flex items-center gap-1">
            Page
            <DropDown :options="pages" v-model="page" />
            of {{ maxPage }}
          </div>
          <div class="flex gap-2">
            <button class="border rounded px-2 py-1 hover:bg-neutral-50 disabled:hover:bg-white disabled:text-gray-300" :disabled="page === 1" @click="page === 1 ? '' : page -= 1">Prev</button>
            <button class="border rounded px-2 py-1 hover:bg-neutral-50 disabled:hover:bg-white disabled:text-gray-300" :disabled="page === maxPage" @click="page === maxPage ? '' : page += 1">Next</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Normal view -->
    <div class="hidden sm:block mb-24">
      <div class="align-middle inline-block min-w-full border-y border-gray-200 max-h-[36rem] overflow-y-auto">
        <table class="min-w-full">
          <thead class="drop-shadow">
            <tr class="">
              <th class="hidden md:table-cell px-2 pl-4 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th v-for="attribute in view.attributes" :key="attribute.id" class="px-2 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span class="lg:pl-2">{{ attribute.label }}</span>
              </th>
              <th v-if="!view.readonly" class="px-2 pr-4 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <a v-for="(item, i) in items" :key="item.id" class="table-row hover:bg-gray-50 cursor-pointer" :href="`/${view.view_id}/view/${item.id}`">
              <td class="hidden md:table-cell w-10 px-2 pl-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                {{ i + 1 + ((page - 1) * maxItems) }}
              </td>
              <td v-for="attribute in view.attributes" :key="attribute.id"
                class="px-2 py-3 max-w-0 whitespace-nowrap text-sm font-medium text-gray-900">
                <div class="flex items-center space-x-3 lg:pl-2">
                  <div class="truncate hover:text-gray-600" :title="item[attribute.id]">
                    {{ item[attribute.id] }}
                  </div>
                </div>
              </td>
              <td v-if="!view.readonly" class="w-10 px-2 pr-4 py-3 whitespace-nowrap text-right text-sm font-medium z-10" @click="event => deleteItem(item.id, event)">
                <TrashIcon class="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
              </td>
            </a>
          </tbody>
        </table>
      </div>
      <!-- New Item -->
      <a v-if="!view.readonly" class="block group border border-x-0 border-t-0 border-b-1 border-t-gray-100 cursor-pointer hover:bg-green-50" :href="`/${view.view_id}/new`">
        <div class="flex justify-between px-4 py-3 text-sm font-medium text-gray-400 group-hover:text-green-700">
          <div>New</div>
          <PlusIcon class="w-5 h-5" />
        </div>
      </a>
      <div class="block border border-x-0 border-t-0 border-b-1 border-t-gray-100">
        <div class="flex justify-between px-4 py-3 text-sm font-medium text-gray-400 items-center">
          <div class="flex items-center gap-1">
            Page
            <DropDown :options="pages" v-model="page" />
            of {{ maxPage }}
          </div>
          <div class="flex gap-2">
            <button class="border rounded px-2 py-1 hover:bg-neutral-50 disabled:hover:bg-white disabled:text-gray-300" :disabled="page === 1" @click="page === 1 ? '' : page -= 1">Prev</button>
            <button class="border rounded px-2 py-1 hover:bg-neutral-50 disabled:hover:bg-white disabled:text-gray-300" :disabled="page === maxPage" @click="page === maxPage ? '' : page += 1">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import {
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/solid'
import { Page } from '../../utils/config'
import { initLoading, initCrud } from '../../utils/dashboard'
import DropDown from './form-elements/DropDown.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  view: {
    type: Object as PropType<Page>,
    required: true,
  },
})

const maxItems = 20

const { loading } = initLoading(props.loading)
const { view, warning, items, page, maxPage, pages, getItems, deleteItem } = initCrud(loading, props.view, maxItems)

getItems()
</script>
