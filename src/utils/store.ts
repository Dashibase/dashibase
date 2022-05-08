import { reactive } from "vue"
import { User } from "@supabase/supabase-js"
import { Page } from './config'

export const store = reactive({
  user: {} as User,
  appName: '',
  pages: [] as Page[],
})