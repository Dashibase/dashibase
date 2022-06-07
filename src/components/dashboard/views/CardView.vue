<template>
  <View ref="view">
    <template #header>
      <div>
        {{ page.name }}
      </div>
      <div class="flex gap-2 items-end">
        <FilterMenu :attributes="page.attributes.filter(attr => !attr.hidden)" @close="filterItems"/>
        <DeleteButton v-if="selected.length" @click="deleteCards">
          Delete
        </DeleteButton>
        <PrimaryButton v-if="!selected.length" :to="`/${props.pageId}/new`">
          New
        </PrimaryButton>
      </div>
    </template>
    <!-- Triggers -->
    <div v-if="page.triggers.length" class="w-full py-2 px-4 md:px-10 flex gap-2 justify-end">
      <SecondaryButton v-for="trigger, i in page.triggers" :key="i" @click="trigger.call ? trigger.call(selectedItems) : null">{{ trigger.label }}</SecondaryButton>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <!-- Cards -->
    <div class="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 text-primary dark:text-primary-dark">
      <div v-if="items.length === 0" class="text-sm">
        No cards found.
      </div>
      <button v-for="(item, i) in items" :key="i" class="text-left border border-2 rounded-lg p-7 flex justify-between hover:shadow-md hover:scale-[101%] transition border-neutral-100 bg-overlay dark:bg-overlay-dark dark:border-neutral-750 shadow"
        @click.exact="router.push(`/${page.page_id}/view/${item[page.id_col || 'id']}`)"
        @click.shift.left.exact="event => selectCard(i, event)">
        <div class="flex flex-col gap-2 w-full">
          <div class="font-semibold text-2xl flex items-center justify-between">
            <div class="truncate">{{ item[page.attributes.filter(attr => !attr.hidden)[0].id] }}</div>
            <input v-if="selected.length" type="checkbox" :checked="selected.includes(i)"
              class="cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-600"
              @click="event => selectCard(i, event)" />
          </div>
          <div v-for="attribute in page.attributes.filter(attr => !attr.hidden).slice(1).filter(attribute => item[attribute.id] || (attribute.type === AttributeType.Bool && ['true', 'false'].includes(String(item[attribute.id]))))" :key="attribute.id"
            class="flex flex-col">
            <div class="text-2xs text-tertiary dark:text-tertiary-dark uppercase">{{ attribute.label }}</div>
            <div v-if="attribute.type === AttributeType.Enum" class="mt-0.5 truncate text-xs font-semibold bg-neutral-600 text-white w-max px-2 py-0.5 rounded dark:bg-neutral-400 dark:text-neutral-800">{{ item[attribute.id] }}</div>
            <div v-else-if="attribute.type === AttributeType.Bool" class="mt-0.5 truncate text-xs font-semibold bg-neutral-600 text-white w-max px-2 py-0.5 rounded dark:bg-neutral-400 dark:text-neutral-800">{{ String(item[attribute.id]) }}</div>
            <div v-else class=" truncate text-sm">{{ item[attribute.id] }}</div>
          </div>
        </div>
      </button>
    </div>
    <Pagination v-if="maxPagination > 1" class="mt-10 px-1 sm:px-10" :paginationList="paginationList" :maxPagination="maxPagination" v-model="paginationNum" />
    <DeleteModal ref="deleteModal">
      <template #title>Confirm deletion</template>
      <p>{{ `Are you sure you want to delete ${selected.length > 1 ? 'these cards' : 'this card'}?` }}</p>
    </DeleteModal>
  </View>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import { Page, AttributeType } from '@/utils/config'
import { initCrud } from '@/utils/dashboard'
import { useStore } from '@/utils/store'
import View from './View.vue'
import FilterMenu from '../elements/FilterMenu.vue'
import Pagination from '../elements/Pagination.vue'
import DeleteButton from '../elements/buttons/DeleteButton.vue'
import PrimaryButton from '../elements/buttons/PrimaryButton.vue'
import SecondaryButton from '../elements/buttons/SecondaryButton.vue'
import DeleteModal from '../modals/DeleteModal.vue'

const store = useStore()
const props = defineProps({
  pageId: {
    type: String,
    required: true,
  },
})

const selected = ref([] as number[])

const selectedItems = computed(() => {
  return selected.value.map((idx:number) => items.value[idx])
})

const page = computed(():Page => {
  const page = store.dashboard.pages.find(page => page.page_id === props.pageId) || {} as Page
  // Create functions
  page.triggers = page.triggers ? page.triggers.map(trigger => {
    const args = ['items']
    trigger.call = new Function(...args, trigger.code)
    return trigger
  }) : []
  return page
})

const deleteModal = ref<any|null>(null)

const { items, warning, paginationNum, maxPagination, paginationList, deleteItems, filterItems } = initCrud(page.value)

function selectCard (idx:number, event:Event) {
  event.stopPropagation()
  if (!selected.value.includes(idx)) selected.value.push(idx)
  else selected.value.splice(selected.value.indexOf(idx), 1)
}

async function deleteCards () {
  if (!deleteModal.value) return
  const confirm = await deleteModal.value.confirm()
  if (confirm) {
    setTimeout(() => {
      deleteItems(selected.value.map((idx:number) => items.value[idx][page.value.id_col || 'id']))
        .then(() => selected.value = [])
    }, 100)
  }
}
</script>
