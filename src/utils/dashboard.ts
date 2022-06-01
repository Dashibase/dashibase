import {
  ref,
  computed,
  watch,
} from 'vue'
import * as _ from 'lodash'
import { createClient } from '@supabase/supabase-js'
import config from '@/dashibaseConfig'
import router from '@/router'
import { Page, Attribute, AttributeType } from './config'
import { useStore } from './store'
import { isHostedByDashibase, supabase } from './supabase'
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
  if (!isHostedByDashibase) {
    store.dashboard.pages = config.pages
    return
  }
  if (store.initializing.dashboard) return
  store.initializing.dashboard = true
  try {
    const baseSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const baseSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    const baseSupabase = createClient(baseSupabaseUrl, baseSupabaseAnonKey)
    baseSupabase.auth.session = () => null

    const { data, error } = await baseSupabase
      .from('views')
      .select('label,page_id,table_id,attributes,mode,readonly')
      .eq('dashboard', store.dashboard.id)
      .order('order')

    if (error) {
      store.initializing.dashboard = false
      throw Error(error.message)
    }
    store.dashboard.pages = data.map(view => {
      return {
        name: view.label,
        page_id: view.page_id || view.table_id, // TODO: Support page_id
        table_id: view.table_id,
        mode: view.mode,
        readonly: view.readonly,
        id_col: view.id_col || 'id',
        user_col: view.user_col || 'user',
        attributes: view.attributes.map((attribute:any) => {
          return {
            id: attribute.id,
            label: attribute.label,
            required: attribute.required,
            readonly: attribute.readonly,
            hidden: attribute.hidden || false,
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
      // First get all attribute IDs and split them into table and column
      let attributeIds = page.attributes.map((attr:any) => {
        const rgx = /^((?<table>.*?)\.)?(?<column>.*?)$/
        const matches = attr.id.match(rgx)
        return {
          table: matches.groups.table || '',
          column: matches.groups.column
        }
      })
      // Get set of tables
      const tables = attributeIds.map(attr => attr.table).filter((val, idx, self) => self.indexOf(val) === idx)
      // Add ID attributes
      tables.forEach(table => {
        attributeIds.push({
          table,
          column: page.id_col, // NOTE: This will break table joins
        })
      })
      attributeIds = attributeIds.filter((attr, idx, self) => self.findIndex(i => i.table === attr.table && i.column === attr.column) === idx)
      // Build selectionQuery
      const selectionQuery = tables.map(table => {
        const attributes = attributeIds.filter(attr => attr.table === table).map(attr => attr.column).join(',')
        if (table === '') return attributes
        else return `${table}(${attributes})`
      }).join(',')
      return new Promise(async (resolve, reject) => {
        const { data, error, count } = await supabase
          .from(page.table_id)
          .select(selectionQuery, { count: 'exact' })
          .eq(page.user_col, store.user.id)
          .range(0, pageConfigs[page.mode].maxItems-1)
        if (error) reject(error.message)
        else resolve({ data, count, attributeIds })
      })
    })
    await Promise.all(promises)
      .then(responses => {   
        store.data = responses.map((response:any, i) => {
          const data = response.data.map((row:any) => {
            return response.attributeIds.map((attr:any) => {
              if (attr.table === '') return [attr.column, row[attr.column]]
              else return [`${attr.table}.${attr.column}`, row[attr.table][attr.column]]
            }).reduce((a:Object, v:string[]) => ({...a, [v[0]]: v[1]}), {})
          })
          return {
            id: store.dashboard.pages[i].page_id,
            data,
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
Initialize CRUD functions and related variables
*/
export function initCrud (page:Page, itemId:string|number='') {
  const store = useStore()
  if (typeof itemId === 'string' && !isUUID(itemId)) itemId = parseInt(itemId)
  // warning will be displayed upon any CRUD errors
  const warning = ref('')
  // items stores the retrieved items when reading
  const cache = computed(() => {
    // Make a copy of items so that background updates wouldn't affect the page immediately
    return JSON.parse(JSON.stringify(store.data.find((pageData:any) => pageData.id === page.page_id) || {}))
  })
  // If page.mode is 'single' make sure there is at least an empty object
  const items = ref(JSON.parse(JSON.stringify(cache.value.data || [])))
  const item = ref(JSON.parse(JSON.stringify(itemId  ? items.value.find((item:any) => item[page.id_col] === itemId) || {} : items.value[0] || {})))
  // total number of items in Supabase table
  const itemsCount = ref(cache.value.count)
  // haveUnsavedChanges is used to denote if changes have been made by the user
  const haveUnsavedChanges = ref(false)
  watch (cache, (newCache, prevCache) => {
    if (prevCache.data) return
    items.value = JSON.parse(JSON.stringify(cache.value.data || []))
    item.value = JSON.parse(JSON.stringify(itemId ? cache.value.data.find((item:any) => item[page.id_col] === itemId) || {} : cache.value.data[0] || {}))
    itemsCount.value = cache.value.count
  })

  // Filters and sorts
  const filters = ref([] as any[])
  const conjunction = ref('')
  const sorts = ref([] as any[])

  // Properties for pagination
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

  // Watch pagination and query new page when necessary
  watch(paginationNum, async (currentPagination) => {
    warning.value = ''
    store.loading = true
    const startRow = Math.max(0, currentPagination - 1) * maxItems
    let request = supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col}`)
      .eq(page.user_col, store.user.id)

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
    const { data, error } = await request
      .range(startRow, startRow + maxItems - 1)
    store.loading = false
    if (error) {
      warning.value = error.message
    } else {
      items.value = data
    }
  })

  /*
  Retrieve row from <page.table_id> with id corresponding to itemId
  */
  async function getItem (itemId:string|number) {
    warning.value = ''
    // If itemId is a number instead of UUID, run parseInt
    if (typeof itemId === 'string' && !isUUID(itemId)) itemId = parseInt(itemId)
    if (!page.attributes) return
    if (items.value.find((item:any) => item[page.id_col] === itemId)) {
      item.value = items.value.find((item:any) => item[page.id_col] === itemId)
      return
    }
    store.loading = true
    const { data, error } = await supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col}`)
      .eq(page.id_col, itemId)
      .single()
      store.loading = false
    if (error) {
      warning.value = error.message
    } else {
      item.value = data
    }
  }

  /*
  Upsert row into <page.table_id> with user corresponding to user_id and id corresponding to itemId
  */
  async function upsertItem (item:any) {
    warning.value = ''
    store.loading = true
    item.user = store.user.id

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
    
    // Get all attribute IDs and split them into table and column
    let attributeIds = page.attributes.map((attr:any) => {
      const rgx = /^((?<table>.*?)\.)?(?<column>.*?)$/
      const matches = attr.id.match(rgx)
      return {
        table: matches.groups.table || '',
        column: matches.groups.column
      }
    })
    // Get set of tables
    const tables = attributeIds.map(attr => attr.table).filter((val, idx, self) => self.indexOf(val) === idx)
    // Reverse sort so that working table is last to be updated
    tables.sort().reverse()
    // Add ID attributes
    tables.forEach(table => {
      attributeIds.push({
        table,
        column: page.id_col, // NOTE: This will break table joins
      })
    })
    attributeIds = attributeIds.filter((attr, idx, self) => self.findIndex(i => i.table === attr.table && i.column === attr.column) === idx)

    // Run upsert for each table
    tables.forEach(async table => {
      // Build item
      const tableAttributes = attributeIds.filter(attr => attr.table === table)
      const newItem = {user: store.user.id} as {[k:string]:any}
      tableAttributes.forEach(attr => {
        newItem[attr.column] = item[table === '' ? attr.column : `${table}.${attr.column}`]
      })
      // Run upsert since user may or may not have inserted before
      const { error } = await supabase
        .from(table === '' ? page.table_id : table)
        .upsert([newItem])
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
    })
  }

  /*
  Delete rows from <page.table_id> with id corresponding to itemId
  */
  async function deleteItems (itemIds:string[], event:Event|null=null) {
    warning.value = ''
    if (event) event.preventDefault()
    store.loading = true
    const { error } = await supabase
      .from(page.table_id)
      .delete()
      .or(itemIds.map(id => `${page.id_col}.eq.${id}`).join(','))
    if (error) {
      store.loading = false
      warning.value = error.message
    } else {
      initUserData()
        .then(() => {
          items.value = JSON.parse(JSON.stringify(cache.value.data || []))
          item.value = JSON.parse(JSON.stringify(itemId ? cache.value.data.find((item:any) => item[page.id_col] === itemId) || {} : cache.value.data[0] || {}))
          itemsCount.value = cache.value.count
          router.push({path: `/${page.page_id}`})
          store.loading = false
        })
    }
  }

  /*
  Apply filters and sorts to query
  */
  async function filterItems (newFilters:any[], newConjunction:string, newSorts:any[]) {
    warning.value = ''

    filters.value = newFilters
    conjunction.value = newConjunction
    sorts.value = newSorts

    store.loading = true
    let filterRequest = supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col}`, { count: 'exact' })
      .eq(page.user_col, store.user.id)
    
    // Apply filters
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

    // Apply sorts
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
    item,
    maxItems,
    paginationNum,
    maxPagination,
    paginationList,
    haveUnsavedChanges,
    getItem,
    upsertItem,
    deleteItems,
    filterItems,
  }
}
