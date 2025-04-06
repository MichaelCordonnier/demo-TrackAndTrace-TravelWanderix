<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 overflow-hidden"
  >
    <div
      class="mx-2 sm:mx-10 md:mx-10 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl max-w-full sm:max-w-4xl w-full relative overflow-hidden"
    >
      <!-- Close Button -->

      <!-- Header Image -->
      <div
        class="relative w-full h-56 sm:h-72 lg:h-80 bg-gray-100 rounded-lg overflow-hidden mb-6"
      >
        <img
          :src="activity.activity.headerImageUrl"
          alt="Activity Header"
          class="w-full h-full object-cover rounded-lg"
        />

        <button
          @click="close"
          class="group absolute top-2 right-2 h-10 w-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
          aria-label="Close"
        >
          <X class="h-6 w-6" />
        </button>
        <div class="absolute bottom-2 left-2 flex gap-2 items-center">
          <div class="p-4 bg-white shadow-md rounded-lg">
            <p class="text-gray-700 text-lg font-bold">
              {{ activity.bookableSettings.price }} €
            </p>
          </div>
          <div
            v-if="activity.recommended"
            class="shadow-md rounded-lg bg-amber-200 p-4"
          >
            <p class="text-lg text-amber-700 font-bold">Recommended</p>
          </div>
        </div>
      </div>

      <!-- Activity Details -->
      <h2
        class="pl-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4"
      >
        {{ activity.name }}
      </h2>
      <p class="pl-2 text-gray-600 mb-2 text-base sm:text-lg lg:text-lg">
        {{ activity.description }}
      </p>
      <p class="pl-2 text-gray-700 text-sm sm:text-base mb-6">
        <strong>Age Group:</strong> {{ activity.activity.ageGroup }}
      </p>

      <!-- Details Grid -->
      <div class="mb-6">
        <div class="bg-gray-100 p-4 rounded-md">
          <div class="w-full bg-white p-4 rounded-md">
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Date:</strong> {{ formatFullDate(activity.startDate) }}
            </p>
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Time:</strong> {{ formatTime(activity.startDate) }}
            </p>
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Duration:</strong> {{ activity.activity.duration }} hours
            </p>
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Price:</strong> ${{ activity.bookableSettings.price }}
            </p>
          </div>
        </div>

        <!-- Equipment Provided -->
        <div
          v-if="activity.equipmentProvided && activity.equipmentProvided.length"
          class="pl-2 col-span-2 mt-4"
        >
          <p class="text-gray-700 mb-2 text-sm sm:text-base">
            <strong>Equipment Provided:</strong>
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in activity.equipmentProvided"
              :key="item"
              class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full shadow-sm"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <!-- Safety Measures -->
        <div
          v-if="activity.safetyMeasures && activity.safetyMeasures.length"
          class="pl-2 col-span-2 mt-4"
        >
          <p class="text-gray-700 mb-2 text-sm sm:text-base">
            <strong>Safety Measures:</strong>
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in activity.safetyMeasures"
              :key="item"
              class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full shadow-sm"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { formatTime, formatFullDate } from '@/utils/converter'

const props = defineProps<{
  show: boolean
  activity: any
}>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

onMounted(() => {
  if (props.show) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
