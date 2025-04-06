<template>
  <div class="bg-white border rounded-lg p-4 shadow-md max-w-md">
    <div class="flex items-center space-x-4 mb-4">
      <img
        v-if="userImage"
        :src="userImage"
        alt="User image"
        class="w-12 h-12 rounded-full object-cover"
      />
      <div
        v-else
        class="w-12 h-12 object-fit border-2 border-gray-200 shadow-lg rounded-full flex justify-center items-center bg-white"
      >
        <img src="/lama.svg" alt="Profile Picture" class="object-fit w-8 h-8" />
      </div>
      <div>
        <p class="font-semibold text-lg">{{ name }}</p>
        <p class="text-xs text-gray-400">
          {{ getMonthAndYearString(createDate) }}
        </p>
      </div>
    </div>

    <div class="mt-2 flex items-center space-x-1">
      <!-- Star rating -->
      <template v-for="star in 5" :key="star">
        <Star
          v-if="star <= Math.floor(rating)"
          class="w-5 h-5 text-amber-500"
        />
        <StarHalf
          v-else-if="star === Math.ceil(rating)"
          class="w-5 h-5 text-amber-500"
        />
        <Star v-else class="w-5 h-5 text-gray-300" />
      </template>
      <span class="text-sm text-gray-500">{{ rating }} / 5</span>
    </div>

    <p class="mt-2 text-gray-700 text-sm leading-relaxed">{{ review }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { getMonthAndYearString } from '@/utils/converter'
import { Star, StarHalf } from 'lucide-vue-next'

const props = defineProps<{
  name: string
  rating: number
  review: string
  createDate: string
  userImage?: string
}>()
</script>
