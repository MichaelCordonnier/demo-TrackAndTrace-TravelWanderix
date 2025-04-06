<template>
  <div>
    <label
      v-if="label"
      class="text-md block font-bold tracking-wider text-gray-700 mb-1"
      >{{ label }}</label
    >
    <input
      type="number"
      :value="modelValue"
      @input="updateValue"
      class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
      :placeholder="placeholder"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, useAttrs } from 'vue'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
  label?: string
}>()

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  if (target) {
    const value = target.value === '' ? null : Number(target.value) // Convert empty to null
    emit('update:modelValue', value)
  }
}
</script>
