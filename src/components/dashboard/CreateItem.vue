<template>
  <div class="space-y-6 sm:px-6 lg:px-0 w-full">
    <div class="bg-white py-6 px-4 sm:p-6 mx-auto w-full">
      <div class="px-10 py-12 flex items-center text-2xl font-medium gap-2">
        <h1>{{ view.name }}</h1>
        <ChevronRightIcon class="inline text-gray-500 h-6 w-auto" />
        <h1>New Item</h1>
      </div>
      <div class="mt-6 flex flex-col gap-6" v-if="view.attributes">
        <!-- Attribute Inputs -->
        <div v-for="attribute in view.attributes" :key="attribute.id"
          class="px-4 md:px-10">
          <label :for="attribute.id" class="block text-sm font-medium text-gray-700">{{ attribute.label }} <span v-if="attribute.required" class="text-gray-400 font-normal pl-2">required</span></label>
          <input type="text" :disabled="loading" :id="attribute.id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm" />
        </div>
        <!-- Warning -->
        <div v-if="warning" class="px-4 md:px-10 text-sm text-red-500">
          {{ warning }}
        </div>
        <!-- Buttons -->
        <div class="px-4 md:px-10 flex justify-end gap-4">
          <button :disabled="loading" class="bg-white border border-transparent rounded-md py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="back">
            Back
          </button>
          <button :disabled="loading" class="bg-green-500 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            @click="save">
            {{ loading ? 'Loading...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/solid'
import router from '../../router'
import { supabase } from '../../utils/supabase'
import { store } from '../../utils/store'

export default defineComponent({
  props: {
    view: {
      type: Object,
      required: true,
    },
  },
  components: {
    ChevronRightIcon,
  },
  data () {
    return {
      loading: false,
      warning: '',
    }
  },
  methods: {
    back () {
      router.go(-1)
    },
    async save () {
      this.loading = true
      // Check required attributes
      const unfilledRequiredAttributes = this.view.attributes.filter((attribute:any) => {
        if (attribute.required) {
          const inputEl = document.getElementById(attribute.id) as HTMLInputElement
          if (inputEl?.value) return false
          else return true
        } else {
          return false
        }
      })
      if (unfilledRequiredAttributes.length) {
        this.warning = `${unfilledRequiredAttributes.map((attribute:any) => attribute.label).join(', ')} need${unfilledRequiredAttributes.length === 1 ? 's' : ''} to be filled`
        this.loading = false
        return
      }
      // Construct new item
      const newItem = Object.fromEntries(this.view.attributes.map((attribute:any) => {
        const inputEl = document.getElementById(attribute.id) as HTMLInputElement
        return [attribute.id, inputEl?.value]
      }))
      newItem.user = store.user.id
      // Insert new item
      const { error } = await supabase
        .from(this.view.table_id)
        .insert([
          newItem
        ])
      this.loading = false
      if (error) {
        this.warning = error.message
      } else {
        window.localStorage.removeItem(this.view.table_id)
        router.push({path: `/${this.view.view_id}`})
      }
    },
  },
})
</script>
