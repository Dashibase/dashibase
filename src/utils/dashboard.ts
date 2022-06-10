import { ref, computed, watch } from 'vue'
import * as _ from 'lodash'
import { createClient } from '@supabase/supabase-js'
import config from '@/dashibaseConfig'
import router from '@/router'
import { Page, Attribute, AttributeType } from './config'
import { useStore } from './store'
import { isHostedByDashibase, supabase } from './supabase'
import { isUUID } from './utils'
import { Schema } from './schema'

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

    let appId = 'demo' // Placeholder ID
    // If in production, get appId from host name
    if (process.env.NODE_ENV !== 'development') {
      const host = window.location.host
      appId = host.split('.')[0]
    }
    const response = await baseSupabase.from('dashboards').select('id,supabase_url,supabase_anon_key,app_name').eq('app_id', appId).single()
    if (response.error) {
      throw Error(response.error.message)
      return
    } else {
      store.dashboard.supabaseUrl = response.data.supabase_url as string
      store.dashboard.supabaseAnonKey = response.data.supabase_anon_key as string
      store.dashboard.name = response.data.app_name
      document.title = response.data.app_name
    }

    const { data, error } = await baseSupabase
      .from('views')
      .select('label,page_id,table_id,attributes,mode,readonly,id_col,user_col,enforce_user_col')
      .eq('dashboard', store.dashboard.id)
      .order('order')

    if (error) {
      store.initializing.dashboard = false
      throw Error(error.message)
    }
    store.dashboard.pages = data.map(view => {
      return {
        name: view.label,
        page_id: view.page_id || view.table_id,
        table_id: view.table_id,
        mode: view.mode,
        readonly: view.readonly,
        id_col: view.id_col || 'id',
        enforce_user_col: typeof view.enforce_user_col === "boolean" ? view.enforce_user_col : true,
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
Build a SELECT query from multiple attributes strings
e.g. "title", "actors(name)", "actors(age)" -> "title,actors(name,age)"
*/
function buildQuery (attributes:string[]) {
  // TODO: Design better regex
  const nestedRgx = /(.*?(\(|$))+?/g
  const splitAttributes = attributes.map(attr => {
    const matches = attr.match(nestedRgx)
    if (!matches) return []
    else return matches.map(m => {
      // Remove brackets e.g. "a(" -> "a"
      const bracketRgx = /(.*?)(\(|\)|$)+?/
      const bracketMatch = m.match(bracketRgx)
      if (bracketMatch) return bracketMatch[1]
      else return m
    }).filter(m => !!m)
  })
  const queryObj = {} as {[k:string]:any}
  splitAttributes.forEach(split => {
    let tmpObj = queryObj
    split.forEach(attr => {
      if (!(attr in tmpObj)) tmpObj[attr] = {} as {[k:string]:any}
      tmpObj = tmpObj[attr]
    })
  })
  function buildString (obj:any):string {
    return Object.keys(obj).map(key => {
      if (Object.keys(obj[key]).length) {
        return key + '(' + buildString(obj[key]) + ')'
      } else {
        return key
      }
    }).join(',')
  }
  return buildString(queryObj)
}

/*
Assume only first-degree joins
*/
function getJoinedTablesAndAttributes (attributes:string[]) {
  function unionArray (obj:string[], src:string[]) {
    if (!obj) return src
    if (!src) return obj
    return _.union(obj, src)
  }
  const tableAttrs = attributes.filter(attr => attr.includes('('))
    .map(attr => {
      const foreignTable = attr.split('(')[0]
      const foreignAttr = attr.split('(')[1].slice(0, -1)
      return {[foreignTable]: [foreignAttr]}
    })
  let allTableAttrs = {} as {[k:string]: string[]}
  tableAttrs.forEach(tableAttr => {
    allTableAttrs = _.mergeWith(allTableAttrs, tableAttr, unionArray)
  })
  return allTableAttrs
}

/*
Initialize user data and store in Pinia store
*/
export async function initUserData () {
  const store = useStore()
  if (!store.dashboard.schema) {
    await getSchema()
  }
  const schema = new Schema(store.dashboard.schema)
  if (!store.user.id) return
  if (store.initializing.data) return
  store.initializing.data = true
  try {
    const supabase = createClient(store.dashboard.supabaseUrl, store.dashboard.supabaseAnonKey)
    const promises = store.dashboard.pages.map(page => {

      const attributeIds = page.attributes.map(attr => attr.id)
      // For each foreign table, add the foreign primary key
      const foreignTables = [] as string[]
      attributeIds.filter(attr => attr.includes('('))
        .forEach(attr => {
          const foreignTable = attr.split('(')[0]
          if (!foreignTables.includes(foreignTable)) foreignTables.push(foreignTable)
        })
      foreignTables.forEach(table => {
        const foreignKeyAttr = `${table}(${schema.getPrimaryKey(table)})`
        if (!attributeIds.includes(foreignKeyAttr)) attributeIds.push(foreignKeyAttr)
      })

      const selectionQuery = buildQuery(attributeIds.concat(page.id_col || 'id'))

      return new Promise(async (resolve, reject) => {
        const { data, error, count } = page.enforce_user_col ?
          await supabase
            .from(page.table_id)
            .select(selectionQuery, { count: 'exact' })
            .eq(page.user_col || 'user', store.user.id)
            .range(0, pageConfigs[page.mode].maxItems-1)
        :
          await supabase
            .from(page.table_id)
            .select(selectionQuery, { count: 'exact' })
            .range(0, pageConfigs[page.mode].maxItems-1)
        
        if (error) reject(error.message)
        else resolve({ data, count, attributeIds: page.attributes.map(attr => attr.id) })
      })
    })
    await Promise.all(promises)
      .then(responses => {
        store.data = responses.map((response:any, i) => {
          const nestedRgx = /^(?<attribute>.*?)\((?<subAttribute>.*?)\)$/
          function getNestedAttribute (item:any, attr:string):[string, any] {
            const nestedMatch = attr.match(nestedRgx)
            if (nestedMatch) {
              const attribute = nestedMatch.groups?.attribute as string
              const subAttribute = nestedMatch.groups?.subAttribute as string
              let subItem = null as any
              if (item.constructor === Array) {
                subItem = item.map((i:any) => i[attribute])
              } else {
                subItem = item[attribute]
              }
              return [attr, getNestedAttribute(subItem, subAttribute)[1]]
            } else {
              if (item && item.constructor === Array) {
                return [attr, item.map((i:any) => i[attr])]
              } else {
                return [attr, item ? item[attr] : null]
              }
            }
          }
          const data = response.data.map((row:any) => {
            const attributeIds = response.attributeIds as string[]
            // For each foreign table, add the foreign primary key
            const foreignTables = [] as string[]
            attributeIds.filter(attr => attr.includes('('))
              .forEach(attr => {
                const foreignTable = attr.split('(')[0]
                if (!foreignTables.includes(foreignTable)) foreignTables.push(foreignTable)
              })
            foreignTables.forEach(table => {
              const foreignKeyAttr = `${table}(${schema.getPrimaryKey(table)})`
              if (!attributeIds.includes(foreignKeyAttr)) attributeIds.push(foreignKeyAttr)
            })
            const item = attributeIds.map((attr:string) => {
              return getNestedAttribute(row, attr)
            }).reduce((a:Object, v:string[]) => ({...a, [v[0]]: v[1]}), {}) as {[k:string]:any}
            const idCol = store.dashboard.pages[i].id_col || 'id'
            if (!(idCol in item)) {
              item[idCol] = row[idCol]
            }
            return item
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
  const schema = new Schema(store.dashboard.schema)
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
  const item = ref(JSON.parse(JSON.stringify(itemId  ? items.value.find((item:any) => item[page.id_col || 'id'] === itemId) || {} : items.value[0] || {})))
  // total number of items in Supabase table
  const itemsCount = ref(cache.value.count)
  // haveUnsavedChanges is used to denote if changes have been made by the user
  const haveUnsavedChanges = ref(false)
  // joinedData is used to store data related to joined tables
  const joinedData = ref({} as any)
  getJoinedData()

  // Update items when cache updates
  watch (cache, (newCache, prevCache) => {
    if (prevCache.data) return
    items.value = JSON.parse(JSON.stringify(cache.value.data || []))
    item.value = JSON.parse(JSON.stringify(itemId ? cache.value.data.find((item:any) => item[page.id_col || 'id'] === itemId) || {} : cache.value.data[0] || {}))
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
    let request = page.enforce_user_col ?
      supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col || 'id'}`)
      .eq(page.user_col || 'user', store.user.id)
    :
      supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col || 'id'}`)

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

  function getJoinedData () {
    const attrTables = getJoinedTablesAndAttributes(page.attributes.map(attr => attr.id))
    const selectPromises = Object.keys(attrTables)
      .filter(foreignTableId => foreignTableId !== page.table_id)
      .map(foreignTableId => {
        return new Promise(async (resolve, reject) => {
          const type = schema.getFkColumns(page.table_id, foreignTableId).length ? 'single' : 'multi'
          const foreignAttributes = attrTables[foreignTableId]
          const foreignPrimaryKey = schema.getPrimaryKey(foreignTableId) as string
          if (!foreignAttributes.includes(foreignPrimaryKey)) foreignAttributes.push(foreignPrimaryKey)
          const { data, error } = await supabase.from(foreignTableId)
            .select(foreignAttributes.join(','))
          if (error) reject(error.message)
          else resolve({
            tableId: foreignTableId,
            idCol: foreignPrimaryKey,
            data,
            type,
          })
        })
      })
    Promise.all(selectPromises)
      .then(responses => {
        const joins = responses.reduce((a:any, v:any) => ({...a, [v.tableId]: v}), {})
        joinedData.value = joins
      })
  }

  /*
  Retrieve row from <page.table_id> with id corresponding to itemId
  */
  async function getItem (itemId:string|number) {
    warning.value = ''
    // If itemId is a number instead of UUID, run parseInt
    if (typeof itemId === 'string' && !isUUID(itemId)) itemId = parseInt(itemId)
    if (!page.attributes) return
    if (items.value.find((item:any) => item[page.id_col || 'id'] === itemId)) {
      item.value = items.value.find((item:any) => item[page.id_col || 'id'] === itemId)
      return
    }
    store.loading = true
    const query = buildQuery(page.attributes.map(attr => attr.id))
    const { data, error } = await supabase
      .from(page.table_id)
      .select(query)
      .eq(page.id_col || 'id', itemId)
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
    console.log(item)
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

    const foreignTableAttrs = getJoinedTablesAndAttributes(page.attributes.filter(attr => !attr.readonly).map(attr => attr.id))
    // First update main table
    // Gather main attributes
    const mainAttributes = page.attributes.filter(attr => !attr.readonly).map(attr => attr.id).filter(attr => !attr.includes('('))
    const mainItem = mainAttributes.map(attr => [attr, item[attr]]).reduce((a, v) => ({...a, [v[0]]: v[1]}), {}) as {[k:string]:any}
    // Include outgoing foreign keys
    Object.keys(foreignTableAttrs).filter(foreignTable => schema.getFkColumns(page.table_id, foreignTable).length)
      .forEach(foreignTable => {
        // mainAttributes.push(schema.getFkColumns(page.table_id, foreignTable)[0])
        mainItem[schema.getFkColumns(page.table_id, foreignTable)[0]] = item[`${foreignTable}(${schema.getPrimaryKey(foreignTable)})`]
      })
    mainItem[schema.getPrimaryKey(page.table_id) as string] = item.id
    const upsertRequest = await supabase
      .from(page.table_id)
      .upsert([mainItem])
    if (upsertRequest.error) throw Error(upsertRequest.error.message)
    
    // Then update rest of the tables
    const updatePromises = Object.keys(foreignTableAttrs).filter(foreignTable => schema.getFkColumns(page.table_id, foreignTable).length === 0)
      .map(foreignTable => {
        return new Promise<void>(async (resolve, reject) => {
          if (schema.getFkColumns(foreignTable, page.table_id).length) {
            // Foreign table points to main table directly
            // We will run an update to set main table's primary key appropriately
            const foreignItems = item[`${foreignTable}(${schema.getPrimaryKey(foreignTable)})`]
              .map((id:any) => {
                return {
                  [schema.getPrimaryKey(foreignTable) as string]: id,
                  [schema.getFkColumns(foreignTable, page.table_id)[0]]: item.id
                }
              })
            console.log(foreignItems)
            // Instead of deleting, we leave the unselected items empty
            await supabase
              .from(foreignTable)
              .update({ [schema.getFkColumns(foreignTable, page.table_id)[0]]: null })
              .match({ [schema.getFkColumns(foreignTable, page.table_id)[0]]: item.id })
            console.log(`(${foreignItems.map((i:any) => i.id).join(',')})`)
            // And update the selected items
            await supabase
              .from(foreignTable)
              .update({ [schema.getFkColumns(foreignTable, page.table_id)[0]]: item.id })
              .or(foreignItems.map((i:any) => `${schema.getPrimaryKey(foreignTable)}.eq.${i.id}`).join(','))
          } else {
            // Foreign table is connected via join table
            // Find join table
            const joinTable = schema.getJoinTable(page.table_id, foreignTable)
            // Delete previous entries
            const deleteRequest = await supabase
              .from(joinTable)
              .delete()
              .match({ [schema.getFkColumns(joinTable, page.table_id)[0]]: item.id })
            if (deleteRequest.error) reject(deleteRequest.error.message)
            const joinItems = item[`${foreignTable}(${schema.getPrimaryKey(foreignTable)})`]
              .map((id:any) => {
                return {
                  [schema.getFkColumns(joinTable, foreignTable)[0]]: id,
                  [schema.getFkColumns(joinTable, page.table_id)[0]]: item.id
                }
              })
            const upsertRequest = await supabase
              .from(joinTable)
              .upsert(joinItems)
            if (upsertRequest.error) reject(upsertRequest.error.message)
          }
          resolve()
        })
      })

    Promise.all(updatePromises)
      .then(initUserData)
      .then(async () => {
        await router.push({path: `/${page.page_id}`})
        setTimeout(() => store.loading = false, 200)
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
      .or(itemIds.map(id => `${page.id_col || 'id'}.eq.${id}`).join(','))
    if (error) {
      store.loading = false
      warning.value = error.message
    } else {
      initUserData()
        .then(() => {
          items.value = JSON.parse(JSON.stringify(cache.value.data || []))
          item.value = JSON.parse(JSON.stringify(itemId ? cache.value.data.find((item:any) => item[page.id_col || 'id'] === itemId) || {} : cache.value.data[0] || {}))
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
    let filterRequest = page.enforce_user_col ? 
      supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col || 'id'}`, { count: 'exact' })
      .eq(page.user_col || 'user', store.user.id)
    :
      supabase
      .from(page.table_id)
      .select(page.attributes.map((attribute:any) => attribute.id).join(',') + `,${page.id_col || 'id'}`, { count: 'exact' })
    
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
    joinedData,
    getItem,
    upsertItem,
    deleteItems,
    filterItems,
  }
}

export async function getSchema () {
  const store = useStore()
  const response = await fetch(`${store.dashboard.supabaseUrl}/rest/v1/?apikey=${store.dashboard.supabaseAnonKey}`)
  const schema = await (await response.json()).definitions
  store.dashboard.schema = schema
  return schema 
}
