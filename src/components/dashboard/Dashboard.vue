<template>
  <Loading v-model="loading" />
  <div class="relative min-h-screen flex flex-col">
    <div class="flex-grow w-full max-w-7xl mx-auto sm:flex border">
      <div class="flex-1 min-w-0 bg-white sm:flex">
        <SidePanel :loading="loading" @update:loading="(value:boolean) => loading=value" />
        <MainPanel>
          <router-view :view="views.find(view => view.view_id === viewId) || {}" :loading="loading" @update:loading="(value:boolean) => loading=value" />
        </MainPanel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../utils/supabase'
import { store } from '../../utils/store'
import config from '../../dashibaseConfig'
import SidePanel from './SidePanel.vue'
import MainPanel from './MainPanel.vue'
import Loading from './Loading.vue'

export default defineComponent({
  props: {
    viewId: {
      type: String,
      default: '',
    },
  },
  setup() {
    const user = supabase.auth.user()
    if (user) store.user = user
    supabase.auth.onAuthStateChange((_, session) => {
      store.user = session?.user as User
    })
    return {
      store,
    }
  },
  async mounted () {
    if (!store.user.id) window.location.href = '/signin'
    if (this.$route.path === '/' && this.views.length) window.location.href = `/${this.views[0].view_id}`
  },
  components: {
    SidePanel,
    MainPanel,
    Loading,
  },
  data () {
    return {
      loading: false,
      views: config.views,
    }
  },
})
</script>
