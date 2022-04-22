<template>
  <div class="space-y-6 sm:px-6 lg:px-0 w-full">
    <div class="bg-white mx-auto w-full">
      <div class="px-10 py-12 flex items-center text-2xl font-medium gap-2">
        <h1>{{ view.name }}</h1>
        <ChevronRightIcon class="inline text-gray-500 h-6 w-auto" />
        <h1>Item</h1>
      </div>
      <div class="flex flex-col gap-6">
        <!-- Attribute Inputs -->
        <div v-for="attribute in view.attributes" :key="attribute.id">
          <div class="px-10">
            <label :for="attribute.id" class="block text-sm font-medium text-gray-700">{{ attribute.label }} <span v-if="attribute.required" class="text-gray-400 font-normal pl-2">required</span></label>
            <input type="text" :disabled="loading" :id="attribute.id" :value="attributeValues[attribute.id]" @input="update(attribute.id, ($event.target as HTMLInputElement).value)" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm" />
          </div>
        </div>
        <!-- Warning -->
        <div v-if="warning" class="px-4 md:px-10 text-sm text-red-500">
          {{ warning }}
        </div>
        <!-- Buttons -->
        <div class="px-10 flex justify-end gap-4">
          <button class="bg-white border border-transparent rounded-md py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="back">
            Back
          </button>
          <button class="bg-green-500 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            @click="save">
            Save
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
  mounted () {
    this.getAttributes()
  },
  props: {
    view: {
      type: Object,
      required: true,
    },
    itemId: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    ChevronRightIcon
  },
  data () {
    return {
      warning: '',
      attributeValues: {} as any,
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
    },
  },
  methods: {
    async getAttributes (refresh:boolean=false) {
      if (!this.view.attributes) return
      let attributeValues = window.localStorage.getItem(this.itemId)
      if (!attributeValues || refresh) {
        this.innerLoading = true
        const { data, error } = await supabase
          .from(this.view.table_id)
          .select(this.view.attributes.map((attribute:any) => attribute.id).join(','))
          .eq('id', this.itemId)
          .single()
        this.innerLoading = false
        if (error) {
          this.warning = error.message
        } else {
          this.attributeValues = data
          window.localStorage.setItem(this.itemId, JSON.stringify(data))
        }
      } else {
        this.attributeValues = JSON.parse(attributeValues)
      }
    },
    back () {
      router.go(-1)
    },
    update (attributeId:string, newVal:string) {
      this.attributeValues[attributeId] = newVal
    },
    async save () {
      this.innerLoading = true
      const newItem = Object.fromEntries(this.view.attributes.map((attribute:any) => {
        const inputEl = document.getElementById(attribute.id) as HTMLInputElement
        return [attribute.id, inputEl?.value]
      }))
      newItem.user = store.user.id
      const { error } = await supabase
        .from(this.view.table_id)
        .update(newItem)
        .match({id: this.itemId})
      this.innerLoading = false
      if (error) {
        console.error(error.message)
      } else {
        window.localStorage.setItem(this.itemId, JSON.stringify(newItem))
        window.localStorage.removeItem(this.view.table_id)
        router.push({path: `/${this.view.table_id}`})
      }
    },
  },
})
</script>
