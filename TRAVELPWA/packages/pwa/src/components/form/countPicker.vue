<template>
  <div>
    <label
      v-if="label"
      class="text-md block font-semibold tracking-wider text-gray-700 mb-1"
      >{{ label }}</label
    >
    <div class="flex items-center">
      <button
        @click="decrement"
        class="w-8 text-center text-lg font-bold bg-gradient-to-br from-amber-300 to-orange-400 mr-1 hover:scale-110 transition-all duration-300 text-white rounded-md p-2"
      >
        -
      </button>
      <input
        type="number"
        :value="modelValue"
        @input="handleInput"
        :disabled="disableInput"
        :class="[
          'w-16 text-center rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400',
          isInvalid ? 'border-red-500' : 'border-gray-500',
          disableInput ? 'bg-gray-200 cursor-not-allowed' : '',
        ]"
        :placeholder="placeholder"
        v-bind="$attrs"
      />
      <button
        @click="increment"
        class="w-8 text-center text-lg font-bold bg-gradient-to-br from-amber-300 to-orange-400 ml-1 hover:scale-110 transition-all duration-300 text-white rounded-md p-2"
      >
        +
      </button>
    </div>
    <p v-if="isInvalid" class="text-red-500 text-sm mt-1">
      Value must be between {{ props.min }} and {{ props.max }}.
    </p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, useAttrs } from 'vue'

// Define the component props
const props = defineProps<{
  modelValue: number
  placeholder?: string // Optional placeholder prop for the input
  label?: string // Optional label prop
  allowNegative?: boolean // Optional prop to allow negative values
  max?: number // Optional max value
  min?: number // Optional min value
  disableInput?: boolean // Optional prop to disable the input field
}>()

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

// Computed property to check if the value is invalid
const isInvalid = computed(() => {
  return (
    (props.max !== undefined && props.modelValue > props.max) ||
    (props.min !== undefined && props.modelValue < props.min)
  )
})

// Handle direct user input
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (target) {
    const inputValue = Number(target.value)
    if (isNaN(inputValue)) return // Ignore invalid input

    // Clamp the value within the defined range
    const clampedValue = clamp(inputValue, props.min, props.max)
    emit('update:modelValue', clampedValue)
  }
}

// Increment the value
const increment = () => {
  const newValue = clamp(props.modelValue + 1, props.min, props.max)
  emit('update:modelValue', newValue)
}

// Decrement the value
const decrement = () => {
  const newValue = clamp(props.modelValue - 1, props.min, props.max)
  emit('update:modelValue', newValue)
}

// Utility function to clamp a value within a range
const clamp = (value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) return min
  if (max !== undefined && value > max) return max
  return value
}
</script>
