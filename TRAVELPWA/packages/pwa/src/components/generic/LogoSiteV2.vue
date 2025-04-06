<template>
  <div
    class="flex py-2 px-4 w-full transition-all duration-300 ease-in-out"
    :class="[smallLogo ? 'items-center justify-center' : 'items-start']"
  >
    <img
      v-if="smallLogo"
      src="/favicon.png"
      alt="Logo"
      class="h-12 object-contain"
    />
    <img
      v-else
      src="/wanderix_logo_text.png"
      alt="Logo"
      class="h-12 object-contain"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  smallLogo: {
    type: Boolean,
    default: false,
  },
})
</script>
