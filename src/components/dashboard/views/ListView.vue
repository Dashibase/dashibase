<template>
  <View ref="view">
    <template #header>
      <div>
        {{ page.name }}
      </div>
      <div class="flex gap-2 items-end">
        <FilterMenu :attributes="page.attributes.filter(attr => !attr.hidden)" @close="filterItems" />
        <DeleteButton v-if="selected.length && !page.readonly" @click="deleteRows">
          Delete
        </DeleteButton>
        <PrimaryButton v-if="!selected.length && !page.readonly" :to="`/${props.pageId}/new`">
          New
        </PrimaryButton>
      </div>
    </template>
    <!-- Triggers -->
    <div v-if="page.triggers.length" class="w-full py-2 px-4 md:px-10 flex gap-2 justify-end">
      <SecondaryButton v-for="trigger, i in page.triggers" :key="i"
        @click="trigger.call ? trigger.call(selectedItems, store.user) : null">{{ trigger.label }}</SecondaryButton>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <!-- Mobile view -->
    <div class="mt-2 sm:hidden">
      <div class="overflow-x-auto">
        <Table :attributes="page.attributes.filter(attr => !attr.hidden).slice(0, 1)" :items="displayItems"
          :countFrom="(paginationNum - 1) * maxItems" @viewItem="viewRow" :readonly="page.readonly" />
      </div>
      <Pagination v-if="maxPagination > 1" class="mt-10" :paginationList="paginationList" :maxPagination="maxPagination"
        v-model="paginationNum" />
    </div>
    <!-- Normal view -->
    <div class="hidden sm:block mb-24 w-full">
      <div class="px-4 md:px-10 w-full">
        <Table ref="table" :attributes="page.attributes.filter(attr => !attr.hidden)" :items="displayItems"
          :countFrom="(paginationNum - 1) * maxItems" @viewItem="viewRow" :readonly="page.readonly" />
      </div>
      <Pagination v-if="maxPagination > 1" class="mt-10 px-10" :paginationList="paginationList"
        :maxPagination="maxPagination" v-model="paginationNum" />
    </div>
    <DeleteModal ref="deleteModal">
      <template #title>Confirm deletion</template>
      <p>{{ `Are you sure you want to delete ${selected.length > 1 ? 'these rows' : 'this row'}?` }}</p>
    </DeleteModal>
  </View>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import router from '@/router'
import { Page } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import { Schema } from '@/utils/schema'
import View from './View.vue'
import FilterMenu from '../elements/FilterMenu.vue'
import Pagination from '../elements/Pagination.vue'
import Table from '../elements/Table.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import SecondaryButton from '../elements/buttons/SecondaryButton.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'

const store = useStore()
const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
})

const page = computed((): Page => {
  const page = store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
  // Create functions
  page.triggers = page.triggers ? page.triggers.map(trigger => {
    const args = ['items', 'user']
    trigger.call = new Function(...args, trigger.code)
    return trigger
  }) : []
  return page
})

const deleteModal = ref<any | null>(null)

const table = ref<any | null>(null)

const { items, warning, maxItems, paginationNum, maxPagination, paginationList, deleteItems, filterItems } = initCrud(page.value)

const displayItems = computed(() => {
  const schema = new Schema(store.dashboard.schema)
  const displayItems = items.value.map((row:any) => {
    page.value.attributes.forEach(attr => {
      const attrDetails = schema.getAttributeDetails(page.value.table_id, attr.id)
      if (attrDetails && ['json', 'jsonb'].includes(attrDetails.format) && row[attr.id] === 'null') row[attr.id] = ''
    })
    return row
  })
  return displayItems
})

const selected = computed(() => {
  if (!table.value) return []
  else return table.value.selected
})

const selectedItems = computed(() => {
  return selected.value.map((idx: number) => items.value[idx])
})

function viewRow(itemIdx: number) {
  const itemId = items.value[itemIdx][page.value.id_col || 'id']
  router.push(`/${props.pageId}/view/${itemId}`)
}

async function deleteRows() {
  if (!deleteModal.value) return
  const confirm = await deleteModal.value.confirm()
  if (confirm) {
    setTimeout(() => {
      deleteItems(selected.value.map((idx: number) => items.value[idx][page.value.id_col || 'id']))
        .then(() => table.value.selected = [])
    }, 100)
  }
}
</script>
