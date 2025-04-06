<template>
  <div class="flex gap-2 w-full cursor-pointer group" @click="$emit('click')">
    <div
      class="group-hover:shadow-md p-4 bg-gray-100 group-hover:bg-gray-200 w-2/3 my-2 rounded-md flex justify-between items-center"
    >
      <div>
        <p class="font-semibold">{{ activity.name }}</p>
        <p class="text-sm my-2">{{ activity.description }}</p>
        <div>
          <p class="text-gray-700 bg-white p-2 rounded-md px-4 w-max">
            {{ formatTime(new Date(activity.startDate).toISOString()) }} -
            {{ formatTime(new Date(activity.endDate).toISOString()) }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-if="activity.activity?.headerImageUrl"
      class="w-1/3 my-2 rounded-md relative"
    >
      <div
        class="absolute bottom-0 text-gray-700 text-end right-0 m-2 font-semibold bg-white p-2 rounded-md"
      >
        <p>{{ activity.bookableSettings?.price }} €</p>
      </div>
      <img
        :src="activity.activity?.headerImageUrl"
        alt="Activity Image"
        class="w-full h-full object-cover rounded-md group-hover:shadow-md"
        @error="imageError = true"
        v-if="!imageError"
      />
      <div
        v-else
        class="w-full h-full bg-gray-300 rounded-md border-1 border-gray-300 group-hover:shadow-md"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { formatTime } from '@/utils/converter'
import type { BookableActivity } from '@/interfaces/bookableActivity.interface'

const props = defineProps<{
  activity: BookableActivity & {
    startDate: string | Date
    endDate: string | Date
  }
}>()

const imageError = ref(false)

console.log('activity', props.activity)
</script>
