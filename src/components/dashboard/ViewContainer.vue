<template>
  <component :is="componentMap[view.mode]" :view="view" :loading="loading" @update:loading="(value:boolean) => innerLoading=value" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CardView from './CardView.vue'
import ListView from './ListView.vue'
import SingleView from './SingleView.vue'

export default defineComponent({
  props: {
    view: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      componentMap: {
        'list': ListView,
        'card': CardView,
        'single': SingleView,
      } as any,
    }
  },
  computed: {
    innerLoading: {
      get () {
        return this.loading
      },
      set (value:boolean) {
        this.$emit('update:loading', value)
      }
    },
  },
})
</script>
