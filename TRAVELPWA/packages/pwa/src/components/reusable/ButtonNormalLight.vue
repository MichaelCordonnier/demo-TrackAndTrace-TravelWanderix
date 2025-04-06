<template>
  <button
    @click="onClick"
    :class="[
      'p-y-1 p-x-2 border-rd-2xl border-2  hover:scale-105 transition-all duration-300 ease-in-out',
      isActive
        ? 'bg-amber-400 border-amber-500 text-white hover:bg-amber-300'
        : 'border-gray-200 text-gray-800 hover:bg-gray-100',
    ]"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
  onClick: (event: MouseEvent) => void
  isActive: boolean
  label: string
}>()
</script>
