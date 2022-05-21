<template>
  <View ref="view">
    <template #header>
      <div>
        {{ page.name }}
      </div>
      <div class="flex gap-2 items-end">
        <FilterMenu :attributes="page.attributes" @close="filterItems"/>
        <DeleteButton v-if="selected.length" @click="deleteCards">
          Delete
        </DeleteButton>
        <PrimaryButton v-if="!selected.length" @click="createCard">
          New
        </PrimaryButton>
      </div>
    </template>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <!-- Cards -->
    <div class="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2 text-neutral-800 dark:text-neutral-200">
      <div v-if="items.length === 0" class="text-sm">
        No cards found.
      </div>
      <button v-for="(item, i) in items" :key="item.id" class="text-left border rounded px-2 py-1 flex justify-between hover:shadow-lg hover:scale-[101%] transition border-neutral-300 bg-white dark:border-neutral-750 dark:bg-neutral-800 dark:hover:bg-[#282828]"
        @click.exact="router.push(`/${page.page_id}/view/${item.id}`)"
        @click.shift.left.exact="event => selectCard(i, event)">
        <div class="flex flex-col gap-1 p-2 w-full">
          <div class="font-medium text-lg flex items-center justify-between">
            <div class="truncate">{{ item[page.attributes[0].id] }}</div>
            <input v-if="selected.length" type="checkbox" :checked="selected.includes(i)"
              class="cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-600"
              @click="event => selectCard(i, event)" />
          </div>
          <div v-for="attribute in page.attributes.slice(1).filter(attribute => item[attribute.id] || attribute.type === AttributeType.Bool)" :key="attribute.id"
            class="flex flex-col">
            <div class="text-xs text-neutral-300 dark:text-neutral-700">{{ attribute.label }}</div>
            <div class="-mt-0.5 truncate text-sm">{{ item[attribute.id] }}</div>
          </div>
        </div>
      </button>
    </div>
    <Pagination v-if="maxPagination > 1" class="mt-10 px-1 sm:px-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    <DeleteModal ref="deleteModal">
      <template #title>Confirm deletion</template>
      <p>{{ `Are you sure you want to delete ${selected.length > 1 ? 'these rows' : 'this row'}?` }}</p>
    </DeleteModal>
  </View>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import router from '@/router'
import { Page, AttributeType } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import View from './View.vue'
import FilterMenu from '../elements/FilterMenu.vue'
import Pagination from '../elements/Pagination.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'

const store = useStore()

const selected = ref([] as number[])

const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
})

const page = computed(():Page => {
  return store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
})

const deleteModal = ref<any|null>(null)

const { items, warning, paginationNum, maxPagination, paginationList, deleteItems, filterItems } = initCrud(page.value)

function createCard () {
  router.push(`/${props.pageId}/new`)
}

function selectCard (idx:number, event:Event) {
  event.stopPropagation()
  if (!selected.value.includes(idx)) selected.value.push(idx)
  else selected.value.splice(selected.value.indexOf(idx), 1)
}

async function deleteCards () {
  if (!deleteModal.value) return
  const confirm = await deleteModal.value.confirm()
  if (confirm) {
    deleteItems(selected.value.map((idx:number) => items.value[idx].id))
      .then(() => selected.value = [])
  }
}
</script>
