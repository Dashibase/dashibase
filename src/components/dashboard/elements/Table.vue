<template>
  <div class="sm:rounded-lg border border-[#EAEAEA] dark:border-[#2F2F2F] shadow overflow-y-hidden">
    <table class="w-full table-fixed transition text-primary dark:text-primary-dark overflow-x-auto">
      <thead class="drop-shadow dark:border-b-2 dark:border-b-neutral-750">
        <tr class="transition bg-table-hover dark:bg-table-hover-dark">
          <th class="hidden sm:table-cell px-1 py-2 text-center text-xs font-medium uppercase tracking-wider w-[1rem] text-tertiary dark:text-tertiary-dark">
            <span v-if="!selected.length">#</span>
            <input v-if="selected.length" type="checkbox"
              class="cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-600"
              @click="selectAll" :checked="selected.length === items.length" />
          </th>
          <th v-for="attribute in attributes" :key="attribute.id" class="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-[10rem]">
            <span class="lg:pl-2">{{ attribute.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y transition text-primary divide-neutral-200 bg-surface dark:bg-surface-dark dark:text-primary-dark dark:divide-neutral-750">
        <div v-if="items.length === 0" class="table-row text-sm bg-input-disabled dark:bg-input-disabled-dark text-secondary dark:text-secondary-dark">
          <td></td>
          <td class="px-2 py-2 max-w-0 whitespace-nowrap text-sm">No rows found.</td>
          <td v-for="attribute, i in attributes.slice(1)" :key="i"></td>
        </div>
        <a v-for="item, i in items" :key="i" class="table-row cursor-pointer hover:bg-table-hover dark:hover:bg-table-hover-dark text-primary dark:text-primary-dark"
          @click.exact="event => viewItem(i, event)"
          @click.shift.left.exact="event => selectRow(i, event)">
          <td class="hidden sm:table-cell w-10 px-1 py-2 whitespace-nowrap text-sm text-center transition group text-tertiary dark:text-tertiary-dark">
            <span v-if="!selected.length" class="group-hover:hidden">{{ i + 1 + countFrom }}</span>
            <input type="checkbox"
              class="hidden group-hover:inline-block cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-600"
              @click="event => selectRow(i, event)" :checked="selected.includes(i)" />
            <input v-if="selected.length" type="checkbox"
              class="group-hover:hidden cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-600"
              :checked="selected.includes(i)" />
          </td>
          <td v-for="attribute, i in attributes" :key="attribute.id"
            class="px-2 py-2 max-w-0 whitespace-nowrap text-sm" :class="i === 0 ? 'font-medium' : ''">
            <div class="flex items-center space-x-3 lg:pl-2">
              <div v-if="(attribute.type === AttributeType.Enum && item[attribute.id]) || (attribute.type === AttributeType.Bool && ['true', 'false'].includes(String(item[attribute.id])))" class="truncate text-xs font-semibold bg-neutral-600 text-white w-max px-2 py-0.5 rounded dark:bg-neutral-400 dark:text-neutral-800">{{ item[attribute.id] }}</div>
              <div v-else class="truncate" :title="item[attribute.id]">
                {{ item[attribute.id] }}
              </div>
            </div>
          </td>
        </a>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import { Attribute, AttributeType } from '@/utils/config'

const selected = ref([] as number[])

const props = defineProps({
  attributes: {
    type: Array as PropType<Attribute[]>,
    default: [],
  },
  items: {
    type: Array as PropType<any[]>,
    default: [],
  },
  countFrom: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['createItem', 'viewItem', 'deleteItem'])

function viewItem (itemIdx:number, event:Event) {
  event.preventDefault()
  emit('viewItem', itemIdx)
}

function selectRow (idx:number, event:Event) {
  event.stopPropagation()
  if (!selected.value.includes(idx)) selected.value.push(idx)
  else selected.value.splice(selected.value.indexOf(idx), 1)
}

function selectAll () {
  if (selected.value.length !== props.items.length) selected.value = [...Array(props.items.length).keys()]
  else selected.value = []
}

defineExpose({
  selected,
})
</script>
