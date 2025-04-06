<template>
  <div class="flex items-center space-x-2 bg-white p-2 rounded-md">
    <!-- Progress Bar Container -->
    <div
      class="relative flex items-center w-54 sm:w-64 h-6 bg-gray-200 rounded-md overflow-hidden"
    >
      <!-- Filled Progress -->
      <div
        class="h-full bg-gradient-to-br from-amber-300 to-orange-400 bg-stripes"
        :style="{ width: `${(places / maxPersons) * 100}%` }"
      >
        <div
          v-for="i in maxPersons"
          :key="i"
          class="absolute h-full border-r border-1.1 border-white"
          :style="{ left: `${(i / maxPersons) * 100}%` }"
        ></div>
      </div>
      <!-- Unfilled Progress -->
      <div
        class="absolute inset-0 flex justify-end"
        :style="{ width: `${((maxPersons - places) / maxPersons) * 100}%` }"
      >
        <div class="h-full bg-gray-300"></div>
      </div>
    </div>

    <!-- Label and Icon -->
    <div class="flex items-center space-x-1">
      <p class="text-gray-700 font-semibold">{{ places }}/{{ maxPersons }}</p>
      <Users class="color-gray-700 w-5 h-5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Users } from 'lucide-vue-next'

const props = defineProps<{
  places: number
  maxPersons: number
}>()
</script>
