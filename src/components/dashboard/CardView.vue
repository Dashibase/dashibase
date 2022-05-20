<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
      <PageHeader>{{ page.name }}</PageHeader>
      <div class="flex gap-2">
        <FilterMenu :attributes="page.attributes" @close="filterItems"/>
        <DeleteButton v-if="selected.length" @click="deleteCards">
          Delete
        </DeleteButton>
        <PrimaryButton v-if="!selected.length" @click="createCard">
          New
        </PrimaryButton>
      </div>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <div class="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2" :class="store.darkMode ? 'text-neutral-200' : 'text-neutral-800'">
      <!-- Cards -->
      <button v-for="(item, i) in items" :key="item.id" class="text-left border rounded px-2 py-1 flex justify-between hover:shadow-lg hover:scale-[101%] transition"
        :class="store.darkMode ? 'border-neutral-700 bg-neutral-800' : 'border-neutral-300 bg-white'"
        @click.exact="router.push(`/${page.page_id}/view/${item.id}`)"
        @click.shift.left.exact="event => selectCard(i, event)">
        <div class="flex flex-col gap-1 p-2 w-full">
          <div class="font-medium text-lg flex items-center justify-between">
            <div class="truncate">{{ item[page.attributes[0].id] }}</div>
            <input v-if="selected.length" type="checkbox" class="cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700"
              :class="store.darkMode ? 'bg-neutral-900 border-neutral-600' : 'border-neutral-300'" :checked="selected.includes(i)"
              @click="event => selectCard(i, event)" />
          </div>
          <div v-for="attribute in page.attributes.slice(1).filter(attribute => item[attribute.id] || attribute.type === AttributeType.Bool)" :key="attribute.id"
            class="flex flex-col">
            <div class="text-xs" :class="store.darkMode ? 'text-neutral-700' : 'text-neutral-300'">{{ attribute.label }}</div>
            <div class="-mt-0.5 truncate text-sm">{{ item[attribute.id] }}</div>
          </div>
        </div>
      </button>
    </div>
    <Pagination v-if="maxPagination > 1" class="mt-10 px-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    <DeleteModal ref="deleteModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import router from '@/router'
import { Page, AttributeType } from '@/utils/config'
import { useStore } from '@/utils/store'
import { initCrud } from '@/utils/dashboard'
import Pagination from './Pagination.vue'
import PageHeader from './elements/PageHeader.vue'
import PrimaryButton from './elements/PrimaryButton.vue'
import FilterMenu from './elements/FilterMenu.vue'
import DeleteButton from './elements/DeleteButton.vue'
import DeleteModal from './DeleteModal.vue'

const store = useStore()

const selected = ref([] as number[])

const props = defineProps({
  page: {
    type: Object as PropType<Page>,
    required: true,
  },
})
const deleteModal = ref<any|null>(null)

const { items, page, warning, paginationNum, maxPagination, paginationList, deleteItems, filterItems } = initCrud(props.page)

function createCard () {
  router.push(`/${props.page.page_id}/new`)
}

function selectCard (idx:number, event:Event) {
  event.stopPropagation()
  if (!selected.value.includes(idx)) selected.value.push(idx)
  else selected.value.splice(selected.value.indexOf(idx), 1)
}

async function deleteCards () {
  if (!deleteModal.value) return
  deleteModal.value.title = 'Confirm deletion'
  deleteModal.value.message = `Are you sure you want to delete ${selected.value.length > 1 ? 'these rows' : 'this row'}?`
  const confirm = await deleteModal.value?.confirm()
  if (confirm) {
    deleteItems(selected.value.map((idx:number) => items.value[idx].id))
      .then(() => selected.value = [])
  }
}
</script>
