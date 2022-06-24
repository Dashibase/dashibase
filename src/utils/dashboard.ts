import { ref, computed, watch } from 'vue'
import * as _ from 'lodash'
import { createClient } from '@supabase/supabase-js'
import config from '@/dashibaseConfig'
import router from '@/router'
import { Page, Attribute, AttributeType } from './config'
import { useStore } from './store'
import { isHostedByDashibase, supabase, getDashboardMetadata, loadDashboardMetadata } from './supabase'
import { getSchema } from './schema'
import { getQueryAttributes, getForeignPrimaryKeyAttribute } from './joins'

const pageConfigs = {
  list: {
    maxItems: 20,
  },
  card: {
    maxItems: 12,
  },
  single: {
    maxItems: 1,
  },
} as {[k:string]:any}

/*
Initialize dashboard pages and store in Pinia store
*/
export async function initDashboard () {
  await getSchema()
  const store = useStore()
  if (!store.user || !store.user.id) return
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

    // Refresh metadata
    const metadata = await getDashboardMetadata()

    const { data, error } = await baseSupabase
      .from('views')
      .select('label,page_id,table_id,attributes,mode,readonly,user_col,enforce_user_col,triggers')
      .eq('dashboard', metadata.dashboardId)
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
        }),
        triggers: view.triggers,
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
  const store = useStore()
  // Combine attributes to build query string
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
    split.forEach((attr, i) => {
      if (!(attr in tmpObj)) tmpObj[attr] = {} as {[k:string]:any}
      if (i < split.length - 1) tmpObj[attr][store.dashboard.schema.t[attr].pk as string] = {}
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
Assume only first- and second-degree joins
*/
function getJoinedTablesAndAttributes (attributes:string[]) {
  function unionArray (obj:string[], src:string[]) {
    if (!obj) return src
    if (!src) return obj
    return _.union(obj, src)
  }
  const nestedRgx = /(.*?(\(|$))+?/g
  const bracketRgx = /(.*?)(\(|\)|$)+?/
  const tableAttrs = attributes.filter(attr => attr.includes('('))
    .map(attr => {
      const subAttrs = attr.match(nestedRgx)?.slice(0, -1)
      if (!subAttrs) return null
      const foreignTable = subAttrs[subAttrs.length - 2].slice(0, -1)
      let foreignAttr = ''
      const bracketMatch = subAttrs[subAttrs.length - 1].match(bracketRgx)
      if (bracketMatch) foreignAttr = bracketMatch[1]
      else foreignAttr = subAttrs[subAttrs.length - 1]
      

      // const foreignTable = attr.split('(')[0]
      // let foreignAttr = ''
      // if (attr.indexOf('(') > 0) foreignAttr = attr.slice(attr.indexOf('(')+1).slice(0, -1)
      // else foreignAttr = attr.split('(')[1].slice(0, -1)
      return {[foreignTable]: [foreignAttr]}
    })
  let allTableAttrs = {} as {[k:string]: string[]}
  tableAttrs.forEach(tableAttr => {
    allTableAttrs = _.mergeWith(allTableAttrs, tableAttr, unionArray)
  })
  return allTableAttrs
}

/*
Given an object with potentially nested attributes and an attribute
string, retrieve the relevant attribute value by unpeeling the brackets
Example, given
item = {
  film {
    title: 'Predestination'
  }
}
attr = 'film(title)'
returns ['film(title)', 'Predestination']
*/
function getNestedAttribute (item:any, attr:string):[string, any] {
  // Regex matches nested attributes with brackets like "film(title)"
  const nestedRgx = /^(?<attribute>.*?)\((?<subAttribute>.*?)\)$/
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
      return [attr, item.map((i:any) => i ? i[attr] : null)]
    } else {
      return [attr, item ? item[attr] : null]
    }
  }
}

/*
Convert retrieved data into a properly formatted item
- Map nested attributes
- Stringify JSON/JSONB
- Add primary keys
*/
function rowToItem (row:any, page:Page, attributeIds:Attribute[]) {
  const store = useStore()
  // Build item using getNestedAttribute
  const item = attributeIds.map(attr => {
    const attrValue = getNestedAttribute(row, attr.id)
    let attrDetails = {} as { format: string }
    if (attr.id.includes('(')) {
      // Attribute is from a foreign table
      const foreignTable = attr.id.split('(').slice(-2, -1)[0]
      const foreignAttr = attr.id.split('(').slice(-1)[0].split(')')[0]
      attrDetails = store.dashboard.schema.t[foreignTable].properties[foreignAttr]
    } else attrDetails = store.dashboard.schema.t[page.table_id].properties[attr.id]
    if (['json', 'jsonb'].includes(attrDetails.format)) attrValue[1] = JSON.stringify(attrValue[1], null, 2)
    return attrValue
  }).reduce((a:Object, v:string[]) => ({...a, [v[0]]: v[1]}), {}) as {[k:string]:any}
  // Add primaryKey into item
  const primaryKey = store.dashboard.schema.t[page.table_id].pk
  if (!(primaryKey in item)) {
    item[primaryKey] = row[primaryKey]
  }
  return item
}

/*
Retrieve data from joined tables for dropdowns when editing items
*/
async function getJoinedData (page:Page) {
  const store = useStore()
  const attrTables = getJoinedTablesAndAttributes(page.attributes.map(attr => attr.id))
  const selectPromises = Object.keys(attrTables)
    .filter(foreignTableId => foreignTableId !== page.table_id)
    .map(foreignTableId => {
      return new Promise(async (resolve, reject) => {
        const type = store.dashboard.schema.getFkColumns(page.table_id, foreignTableId).length ? 'single' : 'multi'
        const foreignAttributes = attrTables[foreignTableId]
        const foreignPrimaryKey = store.dashboard.schema.t[foreignTableId].pk as string
        if (!foreignAttributes.includes(foreignPrimaryKey)) foreignAttributes.push(foreignPrimaryKey)
        const response = await supabase.from(foreignTableId)
          .select(foreignAttributes.join(','))
        if (response.error) reject(response.error.message)
        
        // May data to foreignAttributes
        const data = response.data?.map((row:any) => {
          // Build item using getNestedAttribute
          const item = foreignAttributes.map((attr:string) => {
            return getNestedAttribute(row, attr)
          }).reduce((a:Object, v:string[]) => ({...a, [v[0]]: v[1]}), {}) as {[k:string]:any}
          return item
        })
        
        resolve({
          tableId: foreignTableId,
          data,
          type,
        })
      })
    })
  const joins = await Promise.all(selectPromises)
    .then(responses => responses.reduce((a:any, v:any) => ({...a, [v.tableId]: v}), {}))
  return joins
}

/*
Initialize user data and store in Pinia store
*/
export async function initUserData () {
  const store = useStore()
  if (!store.dashboard.schema) {
    await getSchema()
  }
  if (!store.user.id) return
  if (store.initializing.data) return
  store.initializing.data = true
  try {
    const metadata = await loadDashboardMetadata()
    const supabase = createClient(metadata.supabaseUrl, metadata.supabaseAnonKey)
    const promises = store.dashboard.pages.map(page => {

      const attributeIds = getQueryAttributes(page)
      const selectionQuery = buildQuery(attributeIds.map(attr => attr.id))

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
        else resolve({ data, count, page })
      })
    })
    await Promise.all(promises)
      .then(async responses => {
        store.data = await Promise.all(responses.map(async (response:any, i) => {
          const data = response.data.map((row:any) => {
            const page = response.page as Page
            const attributeIds = getQueryAttributes(page)
            return rowToItem(row, page, attributeIds)
          })
          return {
            id: store.dashboard.pages[i].page_id,
            data,
            count: response.count,
            joinedData: await getJoinedData(response.page as Page),
          }
        }))
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
  const primaryKey = store.dashboard.schema.t[page.table_id].pk as string
  if (typeof itemId === 'string' && store.dashboard.schema.t[page.table_id].properties[primaryKey].type === 'integer') itemId = parseInt(itemId)
  // warning will be displayed upon any CRUD errors
  const warning = ref('')
  // items stores the retrieved items when reading
  const cache = computed(() => {
    // Make a copy of items so that background updates wouldn't affect the page immediately
    return JSON.parse(JSON.stringify(store.data.find((pageData:any) => pageData.id === page.page_id) || {}))
  })
  // If page.mode is 'single' make sure there is at least an empty object
  const items = ref(JSON.parse(JSON.stringify(cache.value.data || [])))
  const item = ref(JSON.parse(JSON.stringify(itemId  ? items.value.find((item:any) => item[primaryKey] === itemId) || {} : items.value[0] || {})))
  // total number of items in Supabase table
  const itemsCount = ref(cache.value.count)
  // haveUnsavedChanges is used to denote if changes have been made by the user
  const haveUnsavedChanges = ref(false)
  // joinedData is used to store data related to joined tables
  const joinedData = ref(JSON.parse(JSON.stringify(cache.value.joinedData || {})))
  // getJoinedData(page)

  // Update items when cache updates
  watch (cache, (newCache, prevCache) => {
    if (prevCache.data) return
    items.value = JSON.parse(JSON.stringify(cache.value.data || []))
    item.value = JSON.parse(JSON.stringify(itemId ? cache.value.data.find((item:any) => item[primaryKey] === itemId) || {} : cache.value.data[0] || {}))
    itemsCount.value = cache.value.count
    joinedData.value = JSON.parse(JSON.stringify(cache.value.joinedData || {}))
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
  watch (paginationNum, async (currentPagination) => {
    warning.value = ''
    store.loading = true
    const startRow = Math.max(0, currentPagination - 1) * maxItems

    const attributeIds = getQueryAttributes(page)
    const selectionQuery = buildQuery(attributeIds.map(attr => attr.id))

    let request = page.enforce_user_col ?
      supabase
        .from(page.table_id)
        .select(selectionQuery)
        .eq(page.user_col || 'user', store.user.id)
      :
      supabase
        .from(page.table_id)
        .select(selectionQuery)

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
    const response = await request
      .range(startRow, startRow + maxItems - 1)

    store.loading = false
    if (response.error) {
      warning.value = response.error.message
    } else {
      // Map data
      const data = response.data.map((row:any) => {
        return rowToItem(row, page, attributeIds)
      })
      items.value = data
    }
  })

  /*
  Retrieve row from <page.table_id> with id corresponding to itemId
  */
  async function getItem (itemId:string|number) {
    warning.value = ''
    // If itemId is a number instead of UUID, run parseInt
    const primaryKey = store.dashboard.schema.t[page.table_id].pk as string
    if (typeof itemId === 'string' && store.dashboard.schema.t[page.table_id].properties[primaryKey].type === 'integer') itemId = parseInt(itemId)
    if (!page.attributes) return
    if (items.value.find((item:any) => item[primaryKey] === itemId)) {
      item.value = items.value.find((item:any) => item[primaryKey] === itemId)
      return
    }
    store.loading = true
    const attributeIds = getQueryAttributes(page)
    const selectionQuery = buildQuery(attributeIds.map(attr => attr.id))
    const { data, error } = await supabase
      .from(page.table_id)
      .select(selectionQuery)
      .eq(primaryKey, itemId)
      .single()
      store.loading = false
    if (error) {
      warning.value = error.message
    } else {
      item.value = rowToItem(data, page, attributeIds)
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
        if (attribute.type === AttributeType.Bool) {
          item[attribute.id] = false
          return false
        } else if (attribute.type === AttributeType.Enum) {
          item[attribute.id] = attribute.enumOptions ? attribute.enumOptions[0] : ''
          return false
        } else if (attribute.type === AttributeType.Join) {
          // If required, join attributes should be non-null and if array, have length > 0
          const foreignKeyValue = item[getForeignPrimaryKeyAttribute(attribute.id)]
          if (!foreignKeyValue) return true
          else if (foreignKeyValue.constructor === Array && foreignKeyValue.length === 0) return true
          else return false
        } else if (!!value) {
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
    const mainAttributes = page.attributes.filter(attr => !attr.readonly).filter(attr => !attr.id.includes('('))
    const mainItem = mainAttributes.map(attr => [attr.id, item[attr.id]]).reduce((a, v) => ({...a, [v[0]]: v[1]}), {}) as {[k:string]:any}
    try {
      mainAttributes.map(attr => {
        const attrDetails = store.dashboard.schema.t[page.table_id].properties[attr.id]
        try {
          if (['json', 'jsonb'].includes(attrDetails.format)) mainItem[attr.id] = JSON.parse(mainItem[attr.id])
        } catch (error) {
          throw Error(`Could not parse ${attr.id}, enter "null" without the quotes if this is meant to be an empty JSON`)
        }
      })
    } catch (error) {
      warning.value = (error as Error).message
      store.loading = false
      return
    }
    // Include outgoing foreign keys
    Object.keys(foreignTableAttrs).filter(foreignTable => store.dashboard.schema.getFkColumns(page.table_id, foreignTable).length)
      .forEach(foreignTable => {
        mainItem[store.dashboard.schema.getFkColumns(page.table_id, foreignTable)[0]] = item[`${foreignTable}(${store.dashboard.schema.t[foreignTable].pk})`]
      })
    if (item.id) mainItem[store.dashboard.schema.t[page.table_id].pk as string] = item.id
    if (page.enforce_user_col) mainItem[page.user_col] = store.user.id
    const upsertRequest = await supabase
      .from(page.table_id)
      .upsert([mainItem])
    if (upsertRequest.error) throw Error(upsertRequest.error.message)
    if (!item.id) item.id = upsertRequest.data[0][store.dashboard.schema.t[page.table_id].pk as string]
    
    // Then update rest of the tables
    const updatePromises = Object.keys(foreignTableAttrs).filter(foreignTable => store.dashboard.schema.getFkColumns(page.table_id, foreignTable).length === 0)
      .map(foreignTable => {
        return new Promise<void>(async (resolve, reject) => {
          if (store.dashboard.schema.getFkColumns(foreignTable, page.table_id).length) {
            // Foreign table points to main table directly
            // We will run an update to set main table's primary key appropriately
            const foreignItems = item[`${foreignTable}(${store.dashboard.schema.t[foreignTable].pk})`]
              .map((id:any) => {
                return {
                  [store.dashboard.schema.t[foreignTable].pk as string]: id,
                  [store.dashboard.schema.getFkColumns(foreignTable, page.table_id)[0]]: item.id
                }
              })
            // Instead of deleting, we leave the unselected items empty
            await supabase
              .from(foreignTable)
              .update({ [store.dashboard.schema.getFkColumns(foreignTable, page.table_id)[0]]: null })
              .match({ [store.dashboard.schema.getFkColumns(foreignTable, page.table_id)[0]]: item.id })
            // And update the selected items
            await supabase
              .from(foreignTable)
              .update({ [store.dashboard.schema.getFkColumns(foreignTable, page.table_id)[0]]: item.id })
              .or(foreignItems.map((i:any) => `${store.dashboard.schema.t[foreignTable].pk}.eq.${i.id}`).join(','))
          } else {
            // Foreign table is connected via join table
            // Find join table
            const joinTable = store.dashboard.schema.getJoinTable(page.table_id, foreignTable)
            // Delete previous entries
            const deleteRequest = await supabase
              .from(joinTable)
              .delete()
              .match({ [store.dashboard.schema.getFkColumns(joinTable, page.table_id)[0]]: item.id })
            if (deleteRequest.error) reject(deleteRequest.error.message)
            const attributeId = Object.keys(item).find(attr => attr.includes(`${foreignTable}(${store.dashboard.schema.t[foreignTable].pk})`))
            if (item[attributeId as string]) {
              const joinItems = item[attributeId as string]
                .map((id:any) => {
                  return {
                    [store.dashboard.schema.getFkColumns(joinTable, foreignTable)[0]]: id,
                    [store.dashboard.schema.getFkColumns(joinTable, page.table_id)[0]]: item.id
                  }
                })
              const upsertRequest = await supabase
                .from(joinTable)
                .upsert(joinItems)
              if (upsertRequest.error) reject(upsertRequest.error.message)
            }
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
      .or(itemIds.map(id => `${primaryKey}.eq.${id}`).join(','))
    if (error) {
      store.loading = false
      warning.value = error.message
    } else {
      initUserData()
        .then(() => {
          items.value = JSON.parse(JSON.stringify(cache.value.data || []))
          item.value = JSON.parse(JSON.stringify(itemId ? cache.value.data.find((item:any) => item[primaryKey] === itemId) || {} : cache.value.data[0] || {}))
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

    const attributeIds = getQueryAttributes(page)
    const selectionQuery = buildQuery(attributeIds.map(attr => attr.id))

    store.loading = true
    let filterRequest = page.enforce_user_col ? 
      supabase
        .from(page.table_id)
        .select(selectionQuery, { count: 'exact' })
        .eq(page.user_col || 'user', store.user.id)
      :
      supabase
        .from(page.table_id)
        .select(selectionQuery, { count: 'exact' })
    
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

    const response = await filterRequest.range(0, maxItems - 1)

    store.loading = false
    if (response.error) {
      warning.value = response.error.message
    } else {
      // Map data
      const data = response.data.map((row:any) => {
        return rowToItem(row, page, attributeIds)
      })
      items.value = data
      itemsCount.value = response.count
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
