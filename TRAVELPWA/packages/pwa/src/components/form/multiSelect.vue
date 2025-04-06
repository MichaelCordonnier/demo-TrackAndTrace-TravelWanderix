<template>
  <div>
    <label v-if="label" class="block mb-1 text-gray-700">{{ label }}</label>
    <div class="relative">
      <div
        @click="toggleDropdown"
        class="w-full border border-gray-500 p-2 rounded-md cursor-pointer"
      >
        <span v-if="selectedOptions.length === 0">{{ placeholder }}</span>
        <span v-else>
          {{ selectedOptions.map(option => option.label).join(', ') }}
        </span>
      </div>
      <div
        v-if="dropdownOpen"
        class="absolute z-10 w-full bg-white border border-gray-500 rounded-md mt-1"
      >
        <div
          v-for="option in options"
          :key="option.value"
          @click="toggleOption(option)"
          class="p-2 cursor-pointer hover:bg-gray-100"
        >
          <input type="checkbox" :checked="isSelected(option)" class="mr-2" />
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: Array<{ value: any; label: string }>
  options: Array<{ value: any; label: string }>
  placeholder?: string
  label?: string
}>()

const emit = defineEmits(['update:modelValue'])

const dropdownOpen = ref(false)
const selectedOptions = computed(() => props.modelValue || [])

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const toggleOption = (option: { value: any; label: string }) => {
  const index = selectedOptions.value.findIndex(
    selected => selected.value === option.value,
  )
  if (index === -1) {
    emit('update:modelValue', [...selectedOptions.value, option])
  } else {
    emit(
      'update:modelValue',
      selectedOptions.value.filter(selected => selected.value !== option.value),
    )
  }
}

const isSelected = (option: { value: any; label: string }) => {
  return selectedOptions.value.some(selected => selected.value === option.value)
}
</script>

<style scoped>
/* Add any additional styling here */
</style>
