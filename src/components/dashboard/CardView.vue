<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex items-center">
      <h1 class="text-2xl font-medium">{{ view.name }}</h1>
    </div>
    <!-- Warning -->
    <div v-if="warning" class="py-2 px-4 md:px-10 text-sm text-red-500">
      {{ warning }}
    </div>
    <div class="px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2">
      <!-- Cards -->
      <a v-for="(item, i) in items" :key="item.id" class="bg-white block relative hover:bg-gray-50 cursor-pointer border rounded px-2 py-1" :href="`/${view.table_id}/view/${item.id}`">
        <div class="absolute top-0 left-0 w-full text-sm text-gray-300 text-right px-1">
          #{{ i + 1 }}
        </div>
        <div class="flex flex-col gap-2 p-2">
          <div v-for="attribute in view.attributes" :key="attribute.id"
            class="font-medium text-gray-900 flex flex-col gap-1">
            <div class="text-gray-300 text-sm">{{ attribute.label }}</div>
            <div class="truncate">{{ item[attribute.id] }}</div>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full text-sm text-gray-300 hover:text-red-600 flex justify-end px-1 py-1" @click="event => deleteItem(item.id, event)">
          <TrashIcon class="w-4 h-4 cursor-pointer" />
        </div>
      </a>
      <!-- New Item -->
      <a class="w-full border rounded px-4 py-3 text-gray-300 cursor-pointer hover:border-green-200 hover:bg-green-100 hover:text-green-400 flex justify-between"
        :href="`/${view.view_id}/new`">
        <div class="font-medium">New item</div>
        <PlusIcon class="h-5" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
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
