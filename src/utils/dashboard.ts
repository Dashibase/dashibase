import {
  ref,
  computed,
  getCurrentInstance,
  ComponentInternalInstance,
  WritableComputedRef,
  watch,
} from 'vue'
import * as _ from 'lodash'
import { supabase } from './supabase'
import { store } from './store'
import { Page } from './config'
import router from '../router'

/*
Initialize computed loading value for loading screen
*/
export function initLoading (loading:boolean) {

  const { emit } = getCurrentInstance() as ComponentInternalInstance

  const innerLoading = computed({
    get () {
      return loading
    },
    set (value:boolean) {
      emit('update:loading', value)
    },
  })

  return { loading: innerLoading, }
}

/*
Initialize CRUD functions and related variables
*/
export function initCrud (loading:WritableComputedRef<boolean>, page:Page, maxItems:number=10) {
  // warning will be displayed upon any CRUD errors
  const warning = ref('')
  // items stores the retrieved items when reading
  const items = ref([] as {[k: string]: any}[])
  // total number of items in Supabase table
  const itemsCount = ref(0)
  // haveUnsavedChanges is used to denote if changes have been made by the user
  const haveUnsavedChanges = ref(false)

  // properties for pagination
  const paginationNum = ref(1)
  const maxPagination = computed (() => {
    return Math.max(1, Math.ceil(itemsCount.value / maxItems))
  })
  const paginationList = computed(() => {
    return _.range(1, maxPagination.value + 1).map((i:number) => {
      return {
        label: i.toString(),
        value: i,
      }
    })
  })
  watch(paginationNum, async (currentPagination) => {
    if (currentPagination === 1) {
      let storedItems = window.localStorage.getItem(page.table_id)
      if (storedItems) {
        const storedItemsJson = JSON.parse(storedItems)
        items.value = storedItemsJson.data
        return
      }
    }
    loading.value = true
    const startRow = Math.max(0, currentPagination - 1) * maxItems
    const { data, error } = await supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
      .eq('user', store.user.id)
      .range(startRow, startRow + maxItems - 1)
    loading.value = false
    if (error) {
      warning.value = error.message
    } else {
      items.value = data
    }
  })

  /*
  Insert a new item into table named <page.table_id>
  */
  async function createItem () {
    loading.value = true
    // Check required attributes
    const unfilledRequiredAttributes = page.attributes.filter((attribute:any) => {
      if (attribute.required) {
        const inputEl = document.getElementById(attribute.id) as HTMLInputElement
        if (inputEl?.value) return false
        else return true
      } else {
        return false
      }
    })
    if (unfilledRequiredAttributes.length) {
      warning.value = `${unfilledRequiredAttributes.map((attribute:any) => attribute.label).join(', ')} need${unfilledRequiredAttributes.length === 1 ? 's' : ''} to be filled`
      loading.value = false
      return
    }
    // Construct new item
    const newItem = Object.fromEntries(page.attributes.map((attribute:any) => {
      const inputEl = document.getElementById(attribute.id) as HTMLInputElement
      return [attribute.id, inputEl?.value]
    }))
    newItem.user = store.user.id
    // Insert new item
    const { error } = await supabase
      .from(page.table_id)
      .insert([
        newItem
      ])
    loading.value = false

    if (error) {
      warning.value = error.message
    } else {
      window.localStorage.removeItem(page.table_id)
      router.push({path: `/${page.page_id}`})
    }
  }

  /*
  Retrieve row from <page.table_id> with id corresponding to itemId
  */
  async function getItem (itemId:string, refresh:boolean=false) {
    if (!page.attributes) return
    let storedItem = window.localStorage.getItem(itemId)
    if (!storedItem || refresh) {
      loading.value = true
      const { data, error } = await supabase
        .from(page.table_id)
        .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id')
        .eq('id', itemId)
        .single()
        loading.value = false
      if (error) {
        warning.value = error.message
      } else {
        items.value = [data]
        window.localStorage.setItem(itemId, JSON.stringify(data))
      }
    } else {
      items.value = [JSON.parse(storedItem)]
    }
  }

  /*
  Retrieve all rows from <page.table_id> with user corresponding to user_id
  */
  async function getItems (max:number=maxItems, refresh:boolean=false) {
    if (!page.attributes) return
    let storedItems = window.localStorage.getItem(page.table_id)
    if (!storedItems || refresh) {
      loading.value = true
      const { data, error, count } = await supabase
        .from(page.table_id)
        .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
        .eq('user', store.user.id)
        .range(0, max - 1)
        loading.value = false
      if (error) {
        warning.value = error.message
      } else {
        items.value = data
        if (count) itemsCount.value = count
        window.localStorage.setItem(page.table_id, JSON.stringify({
          count,
          data,
        }));
        (data as any[]).forEach(item => {
          window.localStorage.setItem(item.id, JSON.stringify(item))
        })
      }
    } else {
      const storedItemsJson = JSON.parse(storedItems)
      items.value = storedItemsJson.data
      itemsCount.value = storedItemsJson.count || 0
    }
  }

  /*
  Upsert row into <page.table_id> with user corresponding to user_id and id corresponding to itemId
  */
  async function upsertItem (itemId:string='') {
    loading.value = true
    const newItem = Object.fromEntries(page.attributes.map((attribute:any) => {
      const inputEl = document.getElementById(attribute.id) as HTMLInputElement
      return [attribute.id, inputEl?.value]
    }))
    newItem.user = store.user.id
    if (itemId) newItem.id = itemId
    else if ((items.value as {[k: string]: any}[])[0].id) newItem.id = (items.value as {[k: string]: any}[])[0].id
    // Run upsert since user may or may not have inserted before
    const { error } = await supabase
      .from(page.table_id)
      .upsert([newItem])
    loading.value = false
    if (error) {
      warning.value = error.message
    } else {
      haveUnsavedChanges.value = false
      window.localStorage.removeItem(page.table_id)
      router.push({path: `/${page.page_id}`})
    }
  }

  /*
  Delete row from <page.table_id> with id corresponding to itemId
  */
  async function deleteItem (itemId:string, event:Event) {
    event.preventDefault()
    loading.value = true
    const { error } = await supabase
      .from(page.table_id)
      .delete()
      .match({ id: itemId })
    if (error) {
      warning.value = error.message
    } else {
      getItems(maxItems, true).then(() => loading.value = false)
    }
  }

  return {
    page,
    warning,
    items,
    paginationNum,
    maxPagination,
    paginationList,
    haveUnsavedChanges,
    createItem,
    getItem,
    getItems,
    upsertItem,
    deleteItem
  }
}
