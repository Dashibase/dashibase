<template>
  <Listbox as="div" v-model="selected" class="inline-block">
    <div class="relative">
      <ListboxButton class="bg-white relative w-full border border-gray-00 rounded-md pl-2 pr-6 py-1 text-left focus:outline-none focus:ring-0 focus:border-gray-300 sm:text-sm">
        <span class="block truncate">{{ selectedLabel }}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-0 pointer-events-none">
          <SelectorIcon class="h-5 w-5 text-gray-300" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition enter-active-class="transition ease-in duration-150" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0" enter-from-class="opacity-0" enter-to-class="opacity-100">
        <ListboxOptions class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <ListboxOption as="template" v-for="option, i in options" :key="i" :value="option.value" v-slot="{ active, selected }">
            <li :class="[active ? 'bg-gray-100' : '', 'text-gray-500 select-none relative py-2 pl-2 pr-6']">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ option.label }}
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { SelectorIcon } from '@heroicons/vue/solid'

interface Option {
  label: string;
  value: string | boolean | number;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: [String, Boolean, Number],
    required: true,
  },
})

const emits = defineEmits(['update:modelValue'])

const selected = computed({
  get () {
    return props.modelValue
  },
  set (newValue:string | boolean | number) {
    emits('update:modelValue', newValue)
  }
})

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(option => option.value === selected.value)
  if (selectedOption) return selectedOption.label
  else return ''
})
</script>