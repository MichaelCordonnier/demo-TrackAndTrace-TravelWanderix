<template>
  <div class="relative">
    <div class="flex gap-2 items-center">
      <input
        v-model="localSearchTerm"
        @input="onInput"
        @focus="showList = true"
        @blur="onBlur"
        :placeholder="placeholder"
        class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
        :aria-label="placeholder"
      />
    </div>
    <ul
      v-if="showList && localSearchTerm && filteredItems.length > 0"
      class="absolute bg-white rounded-md border border-gray-300 shadow-lg w-full z-10 max-h-60 overflow-y-auto mt-2"
      role="listbox"
      :aria-label="listLabel"
    >
      <li
        v-for="item in filteredItems"
        :key="item.id"
        @click="selectItem(item)"
        @keydown.enter="selectItem(item)"
        class="p-2 hover:bg-gray-200 cursor-pointer"
        tabindex="0"
        role="option"
      >
        <p class="text-sm block font-medium tracking-wider text-gray-700">
          {{ item.name }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { ref, watch } from 'vue'

const props = defineProps<{
  searchTerm: string
  filteredItems: Array<{ id: string; name: string }>
  placeholder: string
  listLabel: string
}>()

const emit = defineEmits(['update:searchTerm', 'selectItem'])

const localSearchTerm = ref(props.searchTerm)
const showList = ref(false)

watch(
  () => props.searchTerm,
  newVal => {
    localSearchTerm.value = newVal
  },
)

const onInput = (event: Event) => {
  localSearchTerm.value = (event.target as HTMLInputElement).value
  emit('update:searchTerm', localSearchTerm.value)
  showList.value = true
}

const selectItem = (item: { id: string; name: string }) => {
  emit('selectItem', item)
  localSearchTerm.value = item.name
  showList.value = false
}

const onBlur = () => {
  setTimeout(() => {
    // Wait for the click event to be handled before closing the list
    showList.value = false
  }, 150)
}
</script>
