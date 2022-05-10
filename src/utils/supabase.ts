import { createClient, SupabaseClient } from '@supabase/supabase-js'
import config from '../dashibaseConfig'
import { store } from './store'
import { Attribute, AttributeType, Page } from './config'

export const isHostedByDashibase = import.meta.env.VITE_HOSTED_BY_DASHIBASE === 'true' || false

let supabaseUrl = config.supabase_url
let supabaseAnonKey = config.supabase_anon_key

let supabase = undefined as unknown as SupabaseClient

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

    supabaseUrl = window.localStorage.getItem('dashibase.supabase_url') as string
    supabaseAnonKey = window.localStorage.getItem('dashibase.supabase_anon_key') as string

    if (!supabaseUrl || !supabaseAnonKey) {
      const baseSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const baseSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
      const baseSupabase = createClient(baseSupabaseUrl, baseSupabaseAnonKey)
      const response = await baseSupabase.from('dashboards').select('supabase_url,supabase_anon_key,app_name,id').eq('app_id', appId).single()
      if (response.error) {
        console.error(response.error.message)
        return
      }
      supabaseUrl = response.data.supabase_url as string
      supabaseAnonKey = response.data.supabase_anon_key as string
      window.localStorage.setItem('dashibase.supabase_url', supabaseUrl)
      window.localStorage.setItem('dashibase.supabase_anon_key', supabaseAnonKey)
      window.localStorage.setItem('dashibase.app_name', response.data.app_name)
      window.localStorage.setItem('dashibase.dashboard_id', response.data.id)
      store.appName = response.data.app_name
      document.title = response.data.app_name
      const { data, error } = await baseSupabase.from('views').select('id,label,table_id,attributes,mode,readonly').eq('dashboard', response.data.id)
      if (error) {
        console.error(error.message)
        return
      }
      window.localStorage.setItem('dashibase.pages', JSON.stringify(data?.map(view => {
        return {
          name: view.label,
          page_id: view.table_id, // TODO: Support page_id
          table_id: view.table_id,
          mode: view.mode,
          readonly: view.readonly,
          attributes: view.attributes ? view.attributes.map((attribute:any) => {
            let type = attribute.type || AttributeType.Text
            let enumOptions = [] as string[]
            if (attribute.type.startsWith('ENUM')) {
              type = AttributeType.Enum
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

export { supabase, __tla }
