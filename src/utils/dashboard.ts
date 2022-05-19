import {
  ref,
  computed,
  getCurrentInstance,
  ComponentInternalInstance,
  WritableComputedRef,
  watch,
} from 'vue'
import * as _ from 'lodash'
import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { useStore } from './store'
import { Page, Attribute, AttributeType } from './config'
import router from '../router'
import { isUUID } from './utils'

const pageConfigs = {
  list: {
    maxItems: 20,
  },
  card: {
    maxItems: 10,
  },
  single: {
    maxItems: 1,
  },
} as {[k:string]:any}

/*
Initialize dashboard pages and store in Pinia store
*/
export async function initDashboard () {
  const store = useStore()
  if (!store.user.id) return
  if (store.initializing.dashboard) return

  store.initializing.dashboard = true

  try {
    const baseSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const baseSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    const baseSupabase = createClient(baseSupabaseUrl, baseSupabaseAnonKey)
    baseSupabase.auth.session = () => null
    baseSupabase.auth.user = () => null

    const { data, error } = await baseSupabase
      .from('views')
      .select('label,table_id,attributes,mode,readonly')
      .eq('dashboard', store.dashboard.id)
      .order('order')

    if (error) {
      store.initializing.dashboard = false
      throw Error(error.message)
    }
    store.dashboard.pages = data.map(view => {
      return {
        name: view.label,
        page_id: view.table_id, // TODO: Support page_id
        table_id: view.table_id,
        mode: view.mode,
        readonly: view.readonly,
        attributes: view.attributes.map((attribute:any) => {
          return {
            id: attribute.id,
            label: attribute.label,
            required: attribute.required,
            readonly: attribute.readonly,
            type: Object.values(AttributeType).includes(attribute.type) ? attribute.type : AttributeType.Text,
            enumOptions: attribute.enumOptions || [],
          } as Attribute
        })
      } as Page
    })
  } catch (error) {
    console.error(error)
  } finally {
    store.initializing.dashboard = false
  }
}

/*
Initialize user data and store in Pinia store
*/
export async function initUserData () {
  const store = useStore()
  if (!store.user.id) return
  if (store.initializing.data) return

  store.initializing.data = true

  try {
    const supabase = createClient(store.dashboard.supabaseUrl, store.dashboard.supabaseAnonKey)
    const promises = store.dashboard.pages.map(page => {
      return new Promise(async (resolve, reject) => {
        const { data, error, count } = await supabase
          .from(page.table_id)
          .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
          .eq('user', store.user.id)
          .range(0, pageConfigs[page.mode].maxItems-1)
        if (error) reject(error.message)
        else resolve({ data, count })
      })
    })
    await Promise.all(promises)
      .then(responses => {   
        store.data = responses.map((response:any, i) => {
          return {
            id: store.dashboard.pages[i].page_id,
            data: response.data,
            count: response.count
          }
        })
      })
  } catch (error) {
    console.error(error)
  } finally {
    store.initializing.data = false
  }

  
}

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
export function initCrud (page:Page) {
  const store = useStore()
  // warning will be displayed upon any CRUD errors
  const warning = ref('')
  // items stores the retrieved items when reading
  const cache = computed(() => {
    // Make a copy of items so that background updates wouldn't affect the page immediately
    return JSON.parse(JSON.stringify(store.data.find((pageData:any) => pageData.id === page.page_id) || {}))
  })
  // If page.mode is 'single' make sure there is at least an empty object
  const items = ref(JSON.parse(JSON.stringify(cache.value.data || [])))
  if (!items.value.length && page.mode === 'single') items.value = [{}]
  // total number of items in Supabase table
  const itemsCount = ref(cache.value.count)
  // haveUnsavedChanges is used to denote if changes have been made by the user
  const haveUnsavedChanges = ref(false)
  watch (cache, (newCache, prevCache) => {
    if (prevCache.data) {
      return
    }
    items.value = JSON.parse(JSON.stringify(cache.value.data))
    if (!items.value.length && page.mode === 'single') items.value = [{}]
    itemsCount.value = cache.value.count
  })

  // Filters and sorts
  const filters = ref([] as any[])
  const conjunction = ref('')
  const sorts = ref([] as any[])

  // properties for pagination
  const maxItems = pageConfigs[page.mode].maxItems
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
    store.loading = true
    const startRow = Math.max(0, currentPagination - 1) * maxItems

    let request = supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id')
      .eq('user', store.user.id)

    if (filters.value.length) {
      if (conjunction.value === 'and') {
        filters.value.forEach(condition => {
          request = request.filter(condition.column, condition.operator, condition.value)
        })
      } else if (conjunction.value === 'or') {
        request = request.or(filters.value.map(filter => {
          return `${filter.column}.${filter.operator}.${filter.value}`
        }).join(','))
      }
    }

    sorts.value.forEach(sort => {
      request = request.order(sort.column, { ascending: sort.ascending })
    })

    const { data, error, count } = await request
      .range(startRow, startRow + maxItems - 1)

    store.loading = false
    if (error) {
      warning.value = error.message
    } else {
      items.value = data
    }
  })

  /*
  Insert a new item into table named <page.table_id>
  */
  async function createItem (item:any) {
    store.loading = true
    // Check required attributes
    const unfilledRequiredAttributes = page.attributes.filter((attribute:any) => {
      if (attribute.required) {
        const value = item[attribute.id]
        if (!!value) {
          return false
        } else if (attribute.type === AttributeType.Bool) {
          item[attribute.id] = false
          return false
        } else if (attribute.type === AttributeType.Enum) {
          item[attribute.id] = attribute.enumOptions ? attribute.enumOptions[0] : ''
          return false
        } else return true
      } else {
        return false
      }
    })
    if (unfilledRequiredAttributes.length) {
      warning.value = `${unfilledRequiredAttributes.map((attribute:any) => attribute.label).join(', ')} need${unfilledRequiredAttributes.length === 1 ? 's' : ''} to be filled`
      store.loading = false
      return
    }
    item.user = store.user.id
    // Insert new item
    const { error } = await supabase
      .from(page.table_id)
      .insert([
        item
      ])
    store.loading = false

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
  async function getItem (itemId:string|number, refresh:boolean=false) {
    // If itemId is a number instead of UUID, run parseInt
    if (typeof itemId === 'string' && !isUUID(itemId)) itemId = parseInt(itemId)
    if (!page.attributes) return
    let storedItem = window.localStorage.getItem(itemId.toString())
    if (!storedItem || refresh) {
      store.loading = true
      const { data, error } = await supabase
        .from(page.table_id)
        .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id')
        .eq('id', itemId)
        .single()
        store.loading = false
      if (error) {
        warning.value = error.message
      } else {
        items.value = [data]
        window.localStorage.setItem(itemId.toString(), JSON.stringify(data))
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
      store.loading = true
      const { data, error, count } = await supabase
        .from(page.table_id)
        .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
        .eq('user', store.user.id)
        .range(0, max - 1)
        store.loading = false
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
    store.loading = true

    let item = items.value[0]
    if (itemId) item = items.value.find((item:any) => item.id === itemId) || {}
    item.user = store.user.id

    // Check required attributes
    const unfilledRequiredAttributes = page.attributes.filter((attribute:any) => {
      if (attribute.required) {
        const value = item[attribute.id]
        if (!!value) return false
        else if (attribute.type === AttributeType.Bool) return false
        else return true
      } else {
        return false
      }
    })
    if (unfilledRequiredAttributes.length) {
      warning.value = `${unfilledRequiredAttributes.map((attribute:any) => attribute.label).join(', ')} need${unfilledRequiredAttributes.length === 1 ? 's' : ''} to be filled`
      store.loading = false
      return
    }
    // Run upsert since user may or may not have inserted before
    const { error } = await supabase
      .from(page.table_id)
      .upsert([item])
    if (error) {
      store.loading = false
      warning.value = error.message
    } else {
      initUserData().then(() => {
        store.loading = false
        haveUnsavedChanges.value = false
        router.push({path: `/${page.page_id}`})
      })
    }
  }

  /*
  Delete row from <page.table_id> with id corresponding to itemId
  */
  async function deleteItems (itemIds:string[], event:Event|null=null) {
    if (event) event.preventDefault()
    store.loading = true
    const { error } = await supabase
      .from(page.table_id)
      .delete()
      .or(itemIds.map(id => `id.eq.${id}`).join(','))
      // .match({ id: itemId })
    if (error) {
      warning.value = error.message
    } else {
      // getItems(maxItems, true).then(() => store.loading = false)
      initUserData().then(() => store.loading = false)
    }
  }

  async function filterItems (newFilters:any[], newConjunction:string, newSorts:any[]) {

    filters.value = newFilters
    conjunction.value = newConjunction
    sorts.value = newSorts

    store.loading = true
    let filterRequest = supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + ',id', { count: 'exact' })
      .eq('user', store.user.id)
    
    if (newFilters.length) {
      if (newConjunction === 'and') {
        newFilters.forEach(condition => {
          filterRequest = filterRequest.filter(condition.column, condition.operator, condition.value)
        })
      } else if (newConjunction === 'or') {
        filterRequest = filterRequest.or(newFilters.map(filter => {
          return `${filter.column}.${filter.operator}.${filter.value}`
        }).join(','))
      }
    }

    newSorts.forEach(sort => {
      filterRequest = filterRequest.order(sort.column, { ascending: sort.ascending })
    })

    const { data, error, count } = await filterRequest.range(0, maxItems - 1)

    store.loading = false
    if (error) {
      warning.value = error.message
    } else {
      items.value = data
      itemsCount.value = count
    }
  }

  return {
    page,
    warning,
    items,
    maxItems,
    paginationNum,
    maxPagination,
    paginationList,
    haveUnsavedChanges,
    createItem,
    getItem,
    getItems,
    upsertItem,
    deleteItems,
    filterItems,
  }
}
