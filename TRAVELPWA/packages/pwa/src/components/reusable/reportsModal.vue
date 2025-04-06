<template>
  <div
    v-if="isVisible && report"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full h-full z-999"
  >
    <div
      class="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-w-2xl"
    >
      <header class="flex justify-between items-center border-b pb-3 mb-4">
        <h2 class="text-2xl font-bold text-gray-800">{{ report.title }}</h2>
        <button
          @click="closeModal"
          class="w-10 h-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
          aria-label="Close modal"
        >
          <X class="h-6 w-6" />
        </button>
      </header>
      <section>
        <div class="mb-4 bg-gray-200 rounded-md p-4">
          <h3 class="text-lg font-semibold text-gray-700">Report Details</h3>
          <p class="text-gray-600">
            <span class="font-bold">Date:</span>
            {{ formatFullDate(report.date.toString()) }}
          </p>
          <div class="text-gray-600">
            <p class="font-bold mt-2">Description:</p>
            <div class="bg-white p-2 rounded-md mt-1">
              {{ report.description }}
            </div>
          </div>
        </div>
        <div class="mb-4 bg-gray-200 border-rd-md p-4">
          <h3 class="text-lg font-semibold text-gray-700">Guide Information</h3>
          <p class="text-gray-600">
            <strong>Name:</strong> {{ report.guide.username }}
          </p>
          <p class="text-gray-600">
            <strong>Email:</strong> {{ report.guide.email }}
          </p>
        </div>
        <div class="mb-4 bg-gray-200 border-rd-md p-4">
          <h3 class="text-lg font-semibold text-gray-700">Bookable Trip</h3>
          <p class="text-gray-600">
            <strong>Trip Name:</strong> {{ report.bookableTrip.trip.name }}
          </p>
          <p class="text-gray-600">
            <strong>Trip Date:</strong>
            {{
              formatFullDate(report.bookableTrip.startDate?.toString() || '')
            }}
            -
            {{ formatFullDate(report.bookableTrip.endDate?.toString() || '') }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
import { X } from 'lucide-vue-next'

import type { Report } from '@/interfaces/report.interface'
import { formatFullDate } from '@/utils/converter'
const props = defineProps<{
  report: Report | null
  isVisible: boolean
}>()

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>
