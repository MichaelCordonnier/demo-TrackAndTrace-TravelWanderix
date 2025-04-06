<template>
  <li
    :id="'day-' + props.index"
    class="border border-gray-200 bg-gray-100 shadow-md bg-op-10 mb-5 rounded-lg"
  >
    <div class="flex flex-col gap-2">
      <div
        class="flex flex-row gap-2 items-center p-4 bg-gray-100 rounded-top-full"
      >
        <div
          class="p-1 w-12 h-12 grid place-items-center rounded-full border-2 border-white cursor-pointer hover:shadow-lg hover:scale-105 transition-transform"
          :style="{
            backgroundColor: props.markers[props.index]?.color || 'orange',
          }"
          @click="props.zoomToMarker(props.index)"
        >
          <p class="text-white font-bold">{{ props.dayGroup.label }}</p>
        </div>
        <p class="font-bold text-md">{{ props.dayGroup.location.name }}</p>
      </div>

      <div>
        <div v-for="(day, dayIndex) in props.dayGroup.dates" :key="dayIndex">
          <!-- Use the DayCard component here -->
          <DayCard
            :date="day.date"
            :location="props.dayGroup.location"
            :initiallyClosed="false"
          />
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Location } from '@/interfaces/location.interface'
import { defineProps } from 'vue'
import DayCard from '@/components/generic/DayCard.vue'

interface Marker {
  color: string
}

const props = defineProps<{
  dayGroup: {
    id: string
    label: string
    location: Location
    dates: Array<{
      label: string
      date: Date
      location_id: string
      bookidActivitys: any[]
    }>
  }
  index: number
  markers: Marker[]
  zoomToMarker: (index: number) => void
}>()
</script>
