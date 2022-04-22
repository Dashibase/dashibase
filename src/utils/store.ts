import { reactive } from "vue"
import { User } from "@supabase/supabase-js"

export const store = reactive({
  user: {} as User,
})