<template>
  <table class="w-full table-fixed border-t transition" :class="store.darkMode ? 'border-neutral-700 text-neutral-400' : 'text-neutral-500'">
    <thead class="drop-shadow" :class="store.darkMode ? 'border-b-2 border-b-neutral-700' : ''">
      <tr class="transition"
        :class="store.darkMode ? 'bg-neutral-800' : 'bg-neutral-100'">
        <th class="hidden sm:table-cell px-1 py-2 text-center text-xs font-medium uppercase tracking-wider w-[1rem]"
          :class="store.darkMode ? 'text-neutral-600' : 'text-neutral-400'">
          <span v-if="!selected.length">#</span>
          <input v-if="selected.length" type="checkbox"
            class="cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-600' : 'border-neutral-300'"
            @click="selectAll"
            :checked="selected.length === items.length" />
        </th>
        <th v-for="header in headers" :key="header.id" class="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider w-[10rem]">
          <span class="lg:pl-2">{{ header.label }}</span>
        </th>
      </tr>
    </thead>
    <tbody class="divide-y border-b transition" :class="store.darkMode ? 'text-neutral-200 divide-neutral-700 border-b-neutral-700 bg-neutral-800' : 'text-neutral-800 divide-neutral-200 border-b-neutral-200'">
      <a v-for="item, i in items" :key="i" class="table-row cursor-pointer" @click="event => viewItem(i, event)"
        :class="store.darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'">
        <td class="hidden sm:table-cell w-10 px-1 py-2 whitespace-nowrap text-sm text-center transition group" :class="store.darkMode ? 'text-neutral-600' : 'text-neutral-400'">
          <span v-if="!selected.length" class="group-hover:hidden">{{ i + 1 + countFrom }}</span>
          <input type="checkbox"
            class="hidden group-hover:inline-block cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-600' : 'border-neutral-300'"
            @click="event => selectRow(i, event)"
            :checked="selected.includes(i)" />
          <input v-if="selected.length" type="checkbox"
            class="group-hover:hidden cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 h-4 w-4 rounded text-neutral-700"
            :class="store.darkMode ? 'bg-neutral-900 border-neutral-600' : 'border-neutral-300'"
            :checked="selected.includes(i)" />
        </td>
        <td v-for="header, i in headers" :key="header.id"
          class="px-2 py-2 max-w-0 whitespace-nowrap text-sm" :class="i === 0 ? 'font-medium' : ''">
          <div class="flex items-center space-x-3 lg:pl-2">
            <div class="truncate" :title="item[header.id]">
              {{ item[header.id] }}
            </div>
          </div>
        </td>
      </a>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import { TrashIcon, PlusIcon } from '@heroicons/vue/solid'
import { useStore } from '@/utils/store'

const store = useStore()

const selected = ref([] as number[])

interface Header {
  id: string;
  label: string;
}

const props = defineProps({
  headers: {
    type: Array as PropType<Header[]>,
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
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['createItem', 'viewItem', 'deleteItem'])

function createItem (event:Event) {
  event.preventDefault()
  emit('createItem')
}

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

function deleteItem (itemIdx:number, event:Event) {
  event.preventDefault()
  event.stopPropagation()
  emit('deleteItem', itemIdx)
}

defineExpose({
  selected,
})

</script>