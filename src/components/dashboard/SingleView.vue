<template>
  <div class="w-full">
    <div class="px-4 md:px-10 py-12 flex items-center">
      <h1 class="text-2xl font-medium">{{ view.name }}</h1>
    </div>
    <div class="flex flex-col gap-6">
      <!-- Attribute Inputs -->
      <div v-for="attribute in view.attributes" :key="attribute.id">
        <div class="px-4 md:px-10">
          <label :for="attribute.id" class="block text-sm font-medium text-gray-700">{{ attribute.label }}</label>
          <input type="text" :disabled="loading" :id="attribute.id" :value="attributes[attribute.id]" @input="update(attribute.id, ($event.target as HTMLInputElement).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm" />
        </div>
      </div>
      <!-- Warning -->
      <div v-if="warning" class="px-4 md:px-10 text-sm text-red-500">
        {{ warning }}
      </div>
      <!-- Buttons -->
      <div class="px-4 md:px-10 flex justify-end gap-4">
        <button :disabled="!haveUnsavedChanges || loading" class="bg-green-500 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:focus:ring-gray-300"
          @click="save">
          {{ loading ? 'Loading...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SortAscendingIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/vue/solid'
import { MenuIcon } from '@heroicons/vue/outline'
import router from '../../router'
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
    },
  },
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    ChevronDownIcon,
    ChevronRightIcon,
    MenuIcon,
    PencilIcon,
    PlusIcon,
    SortAscendingIcon,
    StarIcon,
    TrashIcon,
  },
  mounted () {
    this.getItems()
  },
  data () {
    return {
      warning: '',
      attributes: {} as any,
      haveUnsavedChanges: false,
    }
  },
  computed: {
    innerLoading: {
      get () {
        return this.loading
      },
      set (value:boolean) {
        this.$emit('update:loading', value)
      },
    },
  },
  watch: {
    property () {
      this.getItems()
    }
  },
  methods: {
    async getItems (refresh:boolean=false) {
      if (!this.view.attributes) return
      let attributes = window.localStorage.getItem(this.view.table_id)
      if (!attributes || refresh) {
        this.innerLoading = true
        const { data, error } = await supabase
          .from(this.view.table_id)
          .select(this.view.attributes.map((attribute:any) => attribute.id).join(',') + ',id')
          .eq('user', store.user.id)
          .single()
        this.innerLoading = false
        if (error) {
          // User may not have entered anything before - that's okay
          if (error.message !== 'JSON object requested, multiple (or no) rows returned') this.warning = error.message
        } else {
          this.attributes = data
          window.localStorage.setItem(this.view.table_id, JSON.stringify(data))
        }
      } else {
        this.attributes = JSON.parse(attributes)
      }
    },
    update (attributeId:string, newVal:string) {
      this.attributes[attributeId] = newVal
      this.haveUnsavedChanges = true
    },
    async save () {
      this.innerLoading = true
      const newItem = Object.fromEntries(this.view.attributes.map((attribute:any) => {
        const inputEl = document.getElementById(attribute.id) as HTMLInputElement
        return [attribute.id, inputEl?.value]
      }))
      newItem.user = store.user.id
      if (this.attributes.id) newItem.id = this.attributes.id
      // Run upsert since user may or may not have inserted before
      const { error } = await supabase
        .from(this.view.table_id)
        .upsert([newItem])
      this.innerLoading = false
      if (error) {
        this.warning = error.message
      } else {
        this.haveUnsavedChanges = false
        window.localStorage.removeItem(this.view.table_id)
        router.push({path: `/${this.view.view_id}`})
      }
    },
  },
})
</script>
