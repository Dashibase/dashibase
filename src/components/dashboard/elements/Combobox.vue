<template>
  <div class="w-72 text-primary dark:text-primary-dark">
    <Combobox as="div" v-model="innerSelected" multiple>
      <div v-if="selected.length > 0 && options.length > 0" class="flex gap-1">
        <Badge v-for="i in selected" @remove="remove(i)">
          {{ options.find(opt => opt.value === i).label }}
        </Badge>
      </div>
      <div class="relative mt-1">
        <div
          class="relative w-full cursor-default rounded-lg text-left focus:outline-none sm:text-sm"
        >
          <ComboboxInput
            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 py-2 pl-3 pr-10 text-sm leading-5 focus:ring-0 bg-input dark:bg-input-dark placeholder:text-tertiary dark:placeholder:text-tertiary-dark focus:border-neutral-300 dark:focus:border-neutral-700"
            :displayValue="(option:any) => option.label"
            @change="query = $event.target.value"
            placeholder="Search or select"
          />
          <ComboboxButton
            class="absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <SelectorIcon class="h-5 w-5 text-tertiary dark:text-tertiary-dark" aria-hidden="true" />
          </ComboboxButton>
        </div>
        <TransitionRoot
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          @after-leave="query = ''"
        >
          <ComboboxOptions
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-input dark:bg-input-dark py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20"
          >
            <div
              v-if="filteredOptions.length === 0 && query !== ''"
              class="relative cursor-pointer select-none py-2 px-4"
            >
              Nothing found.
            </div>

            <ComboboxOption
              v-for="option, i in filteredOptions"
              as="template"
              :key="i"
              :value="option.value"
              v-slot="{ selected, active }"
            >
              <li
                class="relative cursor-pointer select-none py-2 pl-10 pr-4"
                :class="{
                  'bg-highlight dark:bg-highlight-dark': active,
                  '': !active,
                  'text-primary dark:text-primary-dark': true,
                }"
              >
                <span
                  class="block truncate"
                  :class="{ 'font-medium': selected, 'font-normal': !selected }"
                >
                  {{ option.label }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary dark:text-primary-dark"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </TransitionRoot>
      </div>
    </Combobox>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid'
import Badge from './Badge.vue'

const props = defineProps({
  options: {
    type: Array as PropType<any[]>,
    default: [
      { id: 1, name: 'Wade Cooper' },
      { id: 2, name: 'Arlene Mccoy' },
      { id: 3, name: 'Devon Webb' },
      { id: 4, name: 'Tom Cook' },
      { id: 5, name: 'Tanya Fox' },
      { id: 6, name: 'Hellen Schmidt' },
    ],
  },
  selected: {
    type: Array as PropType<any[]>,
    default: [],
  },
})

const emit = defineEmits(['update'])

const query = ref('')
const innerSelected = computed({
  get ():any[] {
    return props.selected
  },
  set (newSelected:any[]) {
    emit('update', newSelected)
  },
})

const filteredOptions = computed(() =>
  query.value === ''
    ? props.options
    : props.options.filter((option) =>
        (option as any).label
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.value.toLowerCase().replace(/\s+/g, ''))
      )
)

function remove (i:any) {
  innerSelected.value.splice(innerSelected.value.findIndex(opt => opt.value === i), 1)
}
</script>
