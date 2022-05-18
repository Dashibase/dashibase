<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
      <PageHeader>{{ page.name }}</PageHeader>
      <div class="flex gap-2">
        <FilterMenu :attributes="page.attributes" @close="filterItems"/>
        <DeleteButton v-if="selected.length" @click="deleteRows">
          Delete
        </DeleteButton>
        <PrimaryButton v-if="!selected.length" @click="createRow">
          New
        </PrimaryButton>
      </div>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <!-- Mobile view -->
    <div class="mt-2 sm:hidden overflow-x-auto max-w-full w-full">
      <Table :headers="page.attributes.slice(0, 1)" :items="items" :readonly="page.readonly" :countFrom="(paginationNum - 1) * maxItems" @viewItem="viewRow" />
      <Pagination v-if="maxPagination > 1" class="border border-x-0 border-t-0 border-b-1 border-t-gray-100" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    </div>
    <!-- Normal view -->
    <div class="hidden sm:block mb-24">
      <div class="w-[calc(100vw-16rem)] overflow-x-auto">
        <Table ref="table" :headers="page.attributes" :items="items" :readonly="page.readonly" :countFrom="(paginationNum - 1) * maxItems" @viewItem="viewRow" />
      </div>
      <Pagination v-if="maxPagination > 1" class="mt-10 px-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    </div>
    <DeleteModal ref="deleteModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import {
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/solid'
import router from '@/router'
import { Page } from '@/utils/config'
import { useStore } from '@/utils/store'
import { initLoading, initCrud } from '../../utils/dashboard'
import Pagination from './Pagination.vue'
import PageHeader from './elements/PageHeader.vue'
import Table from './elements/Table.vue'
import Button from './elements/Button.vue'
import PrimaryButton from './elements/PrimaryButton.vue'
import FilterMenu from './elements/FilterMenu.vue'
import DeleteButton from './elements/DeleteButton.vue'
import DeleteModal from './DeleteModal.vue'

const store = useStore()

const props = defineProps({
  page: {
    type: Object as PropType<Page>,
    required: true,
  },
})
const deleteModal = ref<any|null>(null)

const table = ref<any|null>(null)

const { items, warning, maxItems, paginationNum, maxPagination, paginationList, deleteItems, filterItems } = initCrud(props.page)

const selected = computed(() => {
  if (!table.value) return []
  else return table.value.selected
})

function createRow () {
  router.push(`/${props.page.page_id}/new`)
}

function viewRow (itemIdx:number) {
  const itemId = items.value[itemIdx].id
  router.push(`/${props.page.page_id}/view/${itemId}`)
}

async function deleteRows () {
  if (!deleteModal.value) return
  deleteModal.value.title = 'Confirm deletion'
  deleteModal.value.message = `Are you sure you want to delete ${selected.value.length > 1 ? 'these items' : 'this item'}?`
  const confirm = await deleteModal.value?.confirm()
  if (confirm) {
    deleteItems(selected.value.map((idx:number) => items.value[idx].id))
      .then(() => table.value.selected = [])
  }
}
</script>
