<!-- ToggleSwitch.vue -->
<template>
  <p class="text-md block font-semibold tracking-wider text-gray-700">
    {{ props.label }}
  </p>
  <label class="flex items-center cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="toggle"
      class="hidden"
    />
    <div
      :class="[
        'w-10 h-6 rounded-full p-1 transition-colors',
        modelValue
          ? 'bg-gradient-to-br from-amber-300 to-orange-400'
          : 'bg-gray-300',
      ]"
    >
      <div
        :class="[
          'w-4 h-4 bg-white rounded-full transition-transform',
          modelValue ? 'translate-x-4' : 'translate-x-0',
        ]"
      ></div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  label: string
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
