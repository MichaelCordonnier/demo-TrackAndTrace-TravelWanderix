<template>
  <div class="relative inline-block w-full">
    <select
      v-model="selectedOptionValue"
      class="mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

interface Option {
  value: any
  label: string
}

const props = defineProps<{
  options: Option[]
  modelValue: string
}>()

const emits = defineEmits(['update:modelValue'])

const selectedOptionValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    selectedOptionValue.value = newValue
  },
  { immediate: true },
)

watch(
  () => selectedOptionValue.value,
  newValue => {
    emits('update:modelValue', newValue)
  },
)
</script>
