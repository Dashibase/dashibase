import { createClient, SupabaseClient } from '@supabase/supabase-js'
import config from '../dashibaseConfig'
import { useStore } from './store'

export const isHostedByDashibase = import.meta.env.VITE_HOSTED_BY_DASHIBASE === 'true' || false

let supabaseUrl = config.supabase_url
let supabaseAnonKey = config.supabase_anon_key

let supabase = undefined as unknown as SupabaseClient

let __tla = new Promise(async () => {
  // If not self-hosted, dynamically retrieve Supabase URL and Anon Key
  if (isHostedByDashibase) {
    let appId = 'demo' // Placeholder ID
    // If in production, get appId from host name
    if (process.env.NODE_ENV !== 'development') {
      const host = window.location.host
      appId = host.split('.')[0]
    }

    supabaseUrl = window.localStorage.getItem('dashibase.supabase_url') as string
    supabaseAnonKey = window.localStorage.getItem('dashibase.supabase_anon_key') as string

    if (!supabaseUrl || !supabaseAnonKey) {
      const baseSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const baseSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
      const baseSupabase = createClient(baseSupabaseUrl, baseSupabaseAnonKey)
      const response = await baseSupabase.from('dashboards').select('id,supabase_url,supabase_anon_key,app_name').eq('app_id', appId).single()
      if (response.error) {
        console.error(response.error.message)
        return
      } else {
        supabaseUrl = response.data.supabase_url as string
        supabaseAnonKey = response.data.supabase_anon_key as string
        window.localStorage.setItem('dashibase.supabase_url', supabaseUrl)
        window.localStorage.setItem('dashibase.supabase_anon_key', supabaseAnonKey)
        window.localStorage.setItem('dashibase.app_name', response.data.app_name)
        window.localStorage.setItem('dashibase.dashboard_id', response.data.id)  
      }
    }
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey)
})

export { supabase, __tla }
