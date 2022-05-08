import { createClient, SupabaseClient } from '@supabase/supabase-js'
import config from '../dashibaseConfig'
import { Attribute, AttributeType, Page } from './config'

export const isHostedByDashibase = import.meta.env.VITE_HOSTED_BY_DASHIBASE === 'true' || false

let supabaseUrl = config.supabase_url
let supabaseAnonKey = config.supabase_anon_key

let baseSupabaseUrl = config.supabase_url
let baseSupabaseAnonKey = config.supabase_anon_key

let baseSupabase = undefined as unknown as SupabaseClient
let supabase = undefined as unknown as SupabaseClient

// MIGHT NOT NEED TO EXPORT baseSupabase

let __tla = new Promise(async () => {
  // If not self-hosted, dynamically retrieve Supabase URL and Anon Key
  if (isHostedByDashibase) {
    let appId = 'demo'
    if (process.env.NODE_ENV !== 'development') {
      const host = window.location.host
      if (host.includes('.app.dashibase.com')) {
        appId = host.split('.app.dashibase.com')[0]
      } else if (host.includes('.beta.dashibase.com')) {
        appId = host.split('.beta.dashibase.com')[0]
      }
    }
    console.log(appId)
  
    baseSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    baseSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

    baseSupabase = createClient(baseSupabaseUrl, baseSupabaseAnonKey)

    supabaseUrl = window.localStorage.getItem('supabase_url') as string
    supabaseAnonKey = window.localStorage.getItem('supabase_anon_key') as string

    if (!supabaseUrl || !supabaseAnonKey) {
      const response = await baseSupabase.from('dashboards').select('supabase_url,supabase_anon_key,app_name,id').eq('app_id', appId).single()
      if (response.error) console.error(response.error.message)
      supabaseUrl = response.data.supabase_url as string
      supabaseAnonKey = response.data.supabase_anon_key as string
      window.localStorage.setItem('supabase_url', supabaseUrl)
      window.localStorage.setItem('supabase_anon_key', supabaseAnonKey)
      window.localStorage.setItem('app_name', response.data.app_name)
      window.localStorage.setItem('dashboard_id', response.data.id)
      document.title = response.data.app_name
      const { data, error } = await baseSupabase.from('views').select('id,label,table_id,attributes,mode,readonly').eq('dashboard', response.data.id)
      if (error) console.error(error.message)
      window.localStorage.setItem('pages', JSON.stringify(data?.map(view => {
        return {
          name: view.label,
          page_id: view.table_id, // TODO: Support page_id
          table_id: view.table_id,
          mode: view.mode,
          readonly: view.readonly,
          attributes: view.attributes ? view.attributes.map((attribute:any) => {
            let type = AttributeType.Text
            switch (attribute.type) {
              case 'textarea':
                type = AttributeType.LongText
                break
              case 'date':
                type = AttributeType.Date
                break
              case 'bool':
                type = AttributeType.Bool
                break
              default:
                if (attribute.type && attribute.type.startsWith('enum')) {
                  type = AttributeType.Enum
                }
            }
            let enumOptions = [] as string[]
            if (type === AttributeType.Enum) {
              enumOptions = attribute.type.slice(5, -1).split(',')
            }
            return {
              id: attribute.id,
              label: attribute.label,
              required: attribute.required,
              readonly: attribute.readonly,
              type,
              enumOptions,
            } as Attribute
          }) : [],
        } as Page
      })))
    }
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
})

export { supabase, baseSupabase, __tla }
