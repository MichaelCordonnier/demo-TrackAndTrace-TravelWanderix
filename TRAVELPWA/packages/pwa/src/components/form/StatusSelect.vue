<template>
  <div>
    <label
      v-if="label"
      for=""
      class="text-md block font-semibold tracking-wider text-gray-700"
      >{{ label }}</label
    >
    <select
      :value="modelValue"
      @change="updateValue"
      class="mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400"
      v-bind="$attrs"
    >
      <option
        value="OPEN"
        :disabled="isTransitionRestricted('OPEN')"
        class="p-2 bg-green-200 text-green-700"
      >
        Open
      </option>
      <option
        v-if="!create"
        value="CLOSED"
        :disabled="isTransitionRestricted('CLOSED')"
        class="p-2 bg-red-200 text-red-700"
      >
        Closed
      </option>
      <option
        v-if="!create"
        value="FULL"
        :disabled="isTransitionRestricted('FULL')"
        class="p-2 bg-amber-200 text-amber-700"
      >
        Full
      </option>
      <option
        v-if="!create"
        value="CANCELLED"
        :disabled="isTransitionRestricted('CANCELLED')"
        class="p-2 bg-gray-200 text-gray-700"
      >
        Cancelled
      </option>
      <option
        v-if="!create"
        value="FINISHED"
        :disabled="isTransitionRestricted('FINISHED')"
        class="p-2 bg-gray-200 text-gray-700"
      >
        Finished
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, useAttrs } from 'vue'

const props = defineProps<{
  modelValue: string
  label?: string // Optional label
  create?: boolean // Create prop
}>()

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

// Function to determine if a state transition is restricted
const isTransitionRestricted = (state: string): boolean => {
  // Example logic: prevent transitions to OPEN and FULL when FULL or FINISHED
  if (['FULL'].includes(props.modelValue)) {
    return state === 'FINISHED' || state === 'FULL' || state === 'OPEN'
  }

  if (['FINISHED'].includes(props.modelValue)) {
    return (
      state === 'FINISHED' ||
      state === 'FULL' ||
      state === 'OPEN' ||
      state === 'CANCELLED' ||
      state === 'CLOSED'
    )
  }

  if (['CANCELLED'].includes(props.modelValue)) {
    return state === 'FINISHED' || state === 'FULL'
  }

  if (['CLOSED'].includes(props.modelValue)) {
    return state === 'FINISHED' || state === 'FULL' || state === 'CANCELLED'
  }

  // No restrictions otherwise
  return false
}

// Emit updated value
const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>
