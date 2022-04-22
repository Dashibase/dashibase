import { createClient } from '@supabase/supabase-js'
import config from '../dashibaseConfig'

export const supabase = createClient(config.supabase_url, config.supabase_anon_key)
