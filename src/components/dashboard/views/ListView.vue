<template>
  <View ref="view">
    <template #header>
      <div>
        {{ page.name }}
      </div>
      <div class="flex gap-2 items-end">
        <FilterMenu :attributes="page.attributes.filter(attr => !attr.hidden)" @close="filterItems"/>
        <DeleteButton v-if="selected.length" @click="deleteRows">
          Delete
        </DeleteButton>
        <PrimaryButton v-if="!selected.length" :to="`/${props.pageId}/new`">
          New
        </PrimaryButton>
      </div>
    </template>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <!-- Mobile view -->
    <div class="mt-2 sm:hidden">
      <div class="overflow-x-auto">
        <Table :attributes="page.attributes.filter(attr => !attr.hidden).slice(0, 1)" :items="items" :countFrom="(paginationNum - 1) * maxItems" @viewItem="viewRow" />
      </div>
      <Pagination v-if="maxPagination > 1" class="mt-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    </div>
    <!-- Normal view -->
    <div class="hidden sm:block mb-24">
      <div class="px-4 md:px-10">
        <Table ref="table" :attributes="page.attributes.filter(attr => !attr.hidden)" :items="items" :countFrom="(paginationNum - 1) * maxItems" @viewItem="viewRow" />
      </div>
      <Pagination v-if="maxPagination > 1" class="mt-10 px-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    </div>
    <DeleteModal ref="deleteModal">
      <template #title>Confirm deletion</template>
      <p>{{ `Are you sure you want to delete ${selected.length > 1 ? 'these items' : 'this item'}?` }}</p>
    </DeleteModal>
  </View>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import router from '@/router'
import { Page } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import View from './View.vue'
import FilterMenu from '../elements/FilterMenu.vue'
import Pagination from '../elements/Pagination.vue'
import Table from '../elements/Table.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'

const store = useStore()

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

const table = ref<any|null>(null)

const { items, warning, maxItems, paginationNum, maxPagination, paginationList, deleteItems, filterItems } = initCrud(page.value)

const selected = computed(() => {
  if (!table.value) return []
  else return table.value.selected
})

function viewRow (itemIdx:number) {
  const itemId = items.value[itemIdx][page.value.id_col]
  router.push(`/${props.pageId}/view/${itemId}`)
}

async function deleteRows () {
  if (!deleteModal.value) return
  const confirm = await deleteModal.value.confirm()
  if (confirm) {
    deleteItems(selected.value.map((idx:number) => items.value[idx][page.value.id_col]))
      .then(() => table.value.selected = [])
  }
}
</script>
