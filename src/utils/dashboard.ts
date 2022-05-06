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
export function initCrud (loading:WritableComputedRef<boolean>, view:any, maxItems:number=10) {
  // warning will be displayed upon any CRUD errors
  const warning = ref('')
  // items stores the retrieved items when reading
  const items = ref([] as any[])
  // total number of items in Supabase table
  const itemsCount = ref(0)
  // haveUnsavedChanges is used to denote if changes have been made by the user
  const haveUnsavedChanges = ref(false)

  // properties for pagination
  const page = ref(1)
  const maxPage = computed (() => {
    return Math.max(1, Math.ceil(itemsCount.value / maxItems))
  })
  const pages = computed(() => {
    return _.range(1, maxPage.value + 1).map((i:number) => {
      return {
        label: i.toString(),
        value: i,
      }
    })
  })
  watch(page, async (currentPage) => {
    if (currentPage === 1) {
      let storedItems = window.localStorage.getItem(view.table_id)
      if (storedItems) {
        const storedItemsJson = JSON.parse(storedItems)
        items.value = storedItemsJson.data
        return
      }
    }
    loading.value = true
    const startRow = Math.max(0, currentPage - 1) * maxItems
    const { data, error } = await supabase
      .from(view.table_id)
      .select(view.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
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
  Insert a new item into table named view.table_id
  */
  async function createItem () {
    loading.value = true
    // Check required attributes
    const unfilledRequiredAttributes = view.attributes.filter((attribute:any) => {
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
    const newItem = Object.fromEntries(view.attributes.map((attribute:any) => {
      const inputEl = document.getElementById(attribute.id) as HTMLInputElement
      return [attribute.id, inputEl?.value]
    }))
    newItem.user = store.user.id
    // Insert new item
    const { error } = await supabase
      .from(view.table_id)
      .insert([
        newItem
      ])
    loading.value = false

    if (error) {
      warning.value = error.message
    } else {
      window.localStorage.removeItem(view.table_id)
      router.push({path: `/${view.view_id}`})
    }
  }

  /*
  Retrieve row from view.table_id with id corresponding to itemId
  */
  async function getItem (itemId:string, refresh:boolean=false) {
    if (!view.attributes) return
    let storedItem = window.localStorage.getItem(itemId)
    if (!storedItem || refresh) {
      loading.value = true
      const { data, error } = await supabase
        .from(view.table_id)
        .select(view.attributes.map((attribute:any) => attribute.id).join(',') + ',id')
        .eq('id', itemId)
        .single()
        loading.value = false
      if (error) {
        warning.value = error.message
      } else {
        items.value = data
        window.localStorage.setItem(itemId, JSON.stringify(data))
      }
    } else {
      items.value = JSON.parse(storedItem)
    }
  }

  /*
  Retrieve all rows from view.table_id with user corresponding to user_id
  */
  async function getItems (max:number=maxItems, refresh:boolean=false) {
    if (!view.attributes) return
    let storedItems = window.localStorage.getItem(view.table_id)
    if (!storedItems || refresh) {
      loading.value = true
      const { data, error, count } = await supabase
        .from(view.table_id)
        .select(view.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
        .eq('user', store.user.id)
        .range(0, max - 1)
        loading.value = false
      if (error) {
        warning.value = error.message
      } else {
        items.value = data
        if (count) itemsCount.value = count
        window.localStorage.setItem(view.table_id, JSON.stringify({
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
  Upsert row into view.table_id with user corresponding to user_id and id corresponding to itemId
  */
  async function upsertItem (itemId:string='') {
    loading.value = true
    const newItem = Object.fromEntries(view.attributes.map((attribute:any) => {
      const inputEl = document.getElementById(attribute.id) as HTMLInputElement
      return [attribute.id, inputEl?.value]
    }))
    newItem.user = store.user.id
    if (itemId) newItem.id = itemId
    else if (items.value[0].id) newItem.id = items.value[0].id
    // Run upsert since user may or may not have inserted before
    const { error } = await supabase
      .from(view.table_id)
      .upsert([newItem])
    loading.value = false
    if (error) {
      warning.value = error.message
    } else {
      haveUnsavedChanges.value = false
      window.localStorage.removeItem(view.table_id)
      router.push({path: `/${view.view_id}`})
    }
  }

  /*
  Delete row from view.table_id with id corresponding to itemId
  */
  async function deleteItem (itemId:string, event:Event) {
    event.preventDefault()
    loading.value = true
    const { error } = await supabase
      .from(view.table_id)
      .delete()
      .match({ id: itemId })
    if (error) {
      warning.value = error.message
    } else {
      getItems(maxItems, true).then(() => loading.value = false)
    }
  }

  return {
    view,
    warning,
    items,
    page,
    maxPage,
    pages,
    haveUnsavedChanges,
    createItem,
    getItem,
    getItems,
    upsertItem,
    deleteItem
  }
}
