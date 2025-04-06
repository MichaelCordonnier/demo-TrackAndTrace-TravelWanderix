<template>
  <div>
    <label
      v-if="label"
      for=""
      class="text-md block font-semibold tracking-wider text-gray-700 mb-1"
      >{{ label }}</label
    >
    <select
      :value="modelValue"
      @change="updateValue"
      class="block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
      v-bind="$attrs"
    >
      <option v-for="guide in guides" :key="guide.id" :value="guide.id">
        <div class="flex items-center">
          <img
            :src="guide.imageUrl"
            alt="Guide image"
            class="w-6 h-6 rounded-full mr-2"
          />
          {{ guide.username }}
        </div>
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/interfaces/user.interface'

import { defineProps, defineEmits, useAttrs, ref, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string // ID of selected guide
  label?: string // Optional label
  guides: User[]
}>()

onMounted(() => {
  if (!props.guides.length) {
    throw new Error('No guides provided')
  } else {
    console.log('Guides provided')
  }
})

const emit = defineEmits(['update:modelValue'])

/**
 * Emits the selected guide ID on change.
 */
const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>
