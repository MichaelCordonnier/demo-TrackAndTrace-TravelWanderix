<template>
  <div>
    <label
      v-if="label"
      class="text-md block font-semibold tracking-wider text-gray-700"
      >{{ label }}</label
    >
    <textarea
      :value="modelValue"
      @input="updateValue"
      class="mb-2 mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
      :placeholder="placeholder"
      v-bind="$attrs"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, useAttrs } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  label?: string
}>()

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>
