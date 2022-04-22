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
      <a class="block group border border-x-0 border-t-gray-100 cursor-pointer hover:bg-green-50" :href="`/${view.view_id}/new`">
        <div class="flex justify-between px-4 py-3 text-sm font-medium text-gray-400 group-hover:text-green-700">
          <div>New</div>
          <PlusIcon class="w-5 h-5" />
        </div>
      </a>
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
              <th class="px-2 pr-4 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <a v-for="(item, i) in items" :key="item.id" class="table-row hover:bg-gray-50 cursor-pointer" :href="`/${view.view_id}/view/${item.id}`">
              <td class="hidden md:table-cell w-10 px-2 pl-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                {{ i + 1 }}
              </td>
              <td v-for="attribute in view.attributes" :key="attribute.id"
                class="px-2 py-3 max-w-0 whitespace-nowrap text-sm font-medium text-gray-900">
                <div class="flex items-center space-x-3 lg:pl-2">
                  <div class="truncate hover:text-gray-600" :title="item[attribute.id]">
                    {{ item[attribute.id] }}
                  </div>
                </div>
              </td>
              <td class="w-10 px-2 pr-4 py-3 whitespace-nowrap text-right text-sm font-medium z-10" @click="event => deleteItem(item.id, event)">
                <TrashIcon class="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
              </td>
            </a>
          </tbody>
        </table>
      </div>
      <!-- New Item -->
      <a class="block group border border-x-0 border-t-0 border-b-1 border-t-gray-100 cursor-pointer hover:bg-green-50" :href="`/${view.view_id}/new`">
        <div class="flex justify-between px-4 py-3 text-sm font-medium text-gray-400 group-hover:text-green-700">
          <div>New</div>
          <PlusIcon class="w-5 h-5" />
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/solid'
import { supabase } from '../../utils/supabase'
import { store } from '../../utils/store'

export default defineComponent({
  props: {
    view: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    ChevronRightIcon,
    PlusIcon,
    TrashIcon,
  },
  mounted () {
    this.getItems()
  },
  data () {
    return {
      warning: '',
      items: [] as any[],
    }
  },
  computed: {
    innerLoading: {
      get () {
        return this.loading
      },
      set (value:boolean) {
        this.$emit('update:loading', value)
      }
    }
  },
  methods: {
    async getItems (refresh:boolean=false) {
      if (!this.view.attributes) return
      let items = window.localStorage.getItem(this.view.table_id)
      if (!items || refresh) {
        this.innerLoading = true
        const { data, error } = await supabase
          .from(this.view.table_id)
          .select(this.view.attributes.map((attribute:any) => attribute.id).join(',') + ',id')
          .eq('user', store.user.id)
        this.innerLoading = false
        if (error) {
          this.warning = error.message
        } else {
          this.items = data as any[]
          window.localStorage.setItem(this.view.table_id, JSON.stringify(data));
          (data as any[]).forEach(item => {
            window.localStorage.setItem(item.id, JSON.stringify(item))
          })
        }
      } else {
        this.items = JSON.parse(items)
      }
    },
    async deleteItem (itemId:string, event:Event) {
      event.preventDefault()
      this.innerLoading = true
      const { error } = await supabase
        .from(this.view.table_id)
        .delete()
        .match({ id: itemId })
      if (error) {
        this.warning = error.message
      } else {
        this.getItems(true).then(() => this.innerLoading = false)
      }
    },
  },
})
</script>
