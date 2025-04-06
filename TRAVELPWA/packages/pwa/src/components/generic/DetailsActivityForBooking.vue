<template>
  <div
    v-if="activity"
    class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 overflow-hidden"
  >
    <div
      class="mx-2 sm:mx-10 md:mx-10 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl max-w-full sm:max-w-4xl w-full relative overflow-hidden"
    >
      <!-- Header Image -->
      <div
        class="relative w-full h-56 sm:h-72 lg:h-80 bg-gray-100 rounded-lg overflow-hidden mb-6"
      >
        <div
          v-if="!imageLoaded"
          class="absolute inset-0 bg-gray-300 animate-pulse"
        ></div>
        <img
          v-if="activity.activity?.headerImageUrl || activity.headerImageUrl"
          :src="activity.activity?.headerImageUrl || activity.headerImageUrl"
          alt="activity image"
          class="w-full h-full object-cover rounded-lg"
          @load="imageLoaded = true"
        />
        <!-- Close Button -->
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
              {{
                activity.bookingSettings?.price ||
                activity.bookableSettings?.price ||
                activity.bookableActivity.bookableSettings?.price
              }}
              €
            </p>
          </div>
          <div
            v-if="activity.recommended || activity.activity.recommended"
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
        {{ activity.name || activity.activity.name }}
      </h2>
      <p class="pl-2 text-gray-600 mb-2 text-base sm:text-lg lg:text-lg">
        {{
          activity.description ||
          activity.activity.description ||
          'No additional description provided.'
        }}
      </p>
      <p class="pl-2 text-gray-700 text-sm sm:text-base mb-6">
        <strong>Age Group:</strong>
        {{ activity.ageGroup || activity.activity.ageGroup }}
      </p>
      <!-- Details Grid -->
      <div class="mb-6">
        <div class="bg-gray-100 p-4 rounded-md">
          <div class="w-full bg-white p-4 rounded-md">
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Date:</strong> {{ getStartDate() }}
            </p>
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Time:</strong>
              {{ getStartTime() }}
              -
              {{ getEndTime() }}
            </p>
            <p class="text-gray-700 text-sm sm:text-base">
              <strong>Duration:</strong>
              {{ activity.duration || activity.activity.duration }} hours
            </p>
          </div>
        </div>
        <!-- Equipment Provided -->
        <div
          v-if="getEquipmentProvided() && getEquipmentProvided().length > 0"
          class="pl-2 col-span-2 mt-4"
        >
          <p class="text-gray-700 mb-2 text-sm sm:text-base">
            <strong>Equipment Provided:</strong>
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in getEquipmentProvided()"
              :key="item"
              class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full shadow-sm"
            >
              {{ item }}
            </span>
          </div>
        </div>
        <!-- Safety Measures -->
        <div
          v-if="
            (activity.safetyMeasures && activity.safetyMeasures.length) ||
            (activity.activity.safetyMeasures &&
              activity.activity.safetyMeasures.length)
          "
          class="pl-2 col-span-2 mt-4"
        >
          <p class="text-gray-700 mb-2 text-sm sm:text-base">
            <strong>Safety Measures:</strong>
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in activity.safetyMeasures ||
              activity.activity.safetyMeasures"
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
import { defineProps, ref, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import {
  formatTime,
  formatFullDate,
  getHourAndMinutes,
} from '@/utils/converter'
import { get } from '@vueuse/core'

// liefst martijn en christophe
// vergeef ons
// 1 Johannes 2, 22-28: Blijf verbonden met Jezus
const props = defineProps<{
  activity: any
}>()

const imageLoaded = ref(false)

const getEndTime = () => {
  let stringResult
  if (props.activity.endDate) {
    stringResult = getHourAndMinutes(props.activity.endDate.toString())
  } else {
    stringResult = getHourAndMinutes(
      props.activity.bookableActivities[0].endDate.toString(),
    )
  }

  return stringResult
}

const getStartTime = () => {
  let stringResult
  if (props.activity.startDate) {
    stringResult = getHourAndMinutes(props.activity.startDate.toString())
  } else {
    stringResult = getHourAndMinutes(
      props.activity.bookableActivities[0].startDate.toString(),
    )
  }

  return stringResult
}

const getStartDate = () => {
  let stringResult
  if (props.activity.startDate) {
    stringResult = formatFullDate(props.activity.startDate.toString())
  } else {
    stringResult = formatFullDate(
      props.activity.bookableActivities[0].startDate.toString(),
    )
  }

  return stringResult
}

const getEquipmentProvided = () => {
  if (props.activity.equipmentProvided) {
    return props.activity.equipmentProvided
  } else if (props.activity.activity.equipmentProvided) {
    return props.activity.activity.equipmentProvided
  } else if (props.activity.bookableActivities[0].activity.equipmentProvided) {
    return props.activity.bookableActivities[0].activity.equipmentProvided
  } else {
    return []
  }
}

const emit = defineEmits(['close', 'add-booking', 'delete-booking'])

const close = () => {
  emit('close')
}

onMounted(() => {
  console.log('actvity mounted:' + props.activity)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
