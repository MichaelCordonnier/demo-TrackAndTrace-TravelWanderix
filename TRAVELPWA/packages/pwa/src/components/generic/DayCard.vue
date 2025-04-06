<template>
  <div class="p-4">
    <div class="flex flex-col cursor-pointer mb-2 ml-2">
      <h1 class="text-lg text-gray-700 font-semibold">{{ formattedDate }}</h1>
      <div class="flex items-center" @click="toggleActivities">
        <p class="text-sm text-gray-500 hover:text-gray-800">
          {{ t('activities') }}
          {{ loadingDayData ? '' : '(' + allActivitiesInArray.length + ')' }}
        </p>
        <ChevronDown
          :class="{ 'transform rotate-180': showActivities }"
          class="text-gray-500 ml-2 duration-300"
        />
      </div>
    </div>
    <div v-if="loadingDayData"></div>
    <div v-else-if="errorDayData && error?.message">
      <p class="text-red-500">Error: {{ error.message }}</p>
    </div>
    <div v-else>
      <div v-if="showActivities" class="flex flex-col space-y-4 w-full">
        <ul v-if="availableActivities.length > 0">
          <li
            v-for="bookableActivity in allActivitiesInArray"
            :key="bookableActivity?.id"
          >
            <BookableActivityCard
              v-if="bookableActivity"
              :key="bookableActivity.id"
              :activity="{
                ...bookableActivity,
                startDate: new Date(
                  bookableActivity.startDate as string | number | Date,
                ),
                endDate: new Date(
                  bookableActivity.endDate as string | number | Date,
                ),
              }"
              @click="openPopup(bookableActivity)"
            />
          </li>
        </ul>
        <p v-else class="text-gray-500 text-sm">
          No recommended activities this day
        </p>
      </div>
    </div>
    <DetailsActivity
      v-if="selectedActivity"
      :show="showPopup"
      :activity="selectedActivity"
      @close="closePopup"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { ApolloError } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

import type { Activity } from '@/interfaces/activity.interface'
import type { Location } from '@/interfaces/location.interface'
import { getDayMonthAndDay } from '@/utils/converter'
import { ACTIVITIES_BY_LOCATION_AND_DATE } from '@/graphql/activities/activities.query'
import DetailsActivity from './DetailsActivity.vue'
import type { BookableActivity } from '@/interfaces/bookableActivity.interface'
import BookableActivityCard from './BookableActivityCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  date: Date
  location: Location
  initiallyClosed: boolean
}>()

// State variables for activities
const error = ref<ApolloError>()
const formattedDate = computed(() =>
  getDayMonthAndDay(props.date.toISOString()),
)

// Fetch activities for each date
interface QueryResult {
  activitiesByLocationAndDate: Activity[]
}

const queryVariables = () => {
  const coordinates = props.location?.geolocation?.coordinates ?? [0, 0]
  const [longitude, latitude] = coordinates
  console.log('coordinates', coordinates)

  const startDate = new Date(props.date)
  startDate.setHours(0, 0, 0, 0)
  console.log('startDate', startDate.toISOString())

  const endDate = new Date(props.date)
  endDate.setHours(23, 59, 59, 999)
  console.log('endDate', endDate.toISOString())

  if (latitude == null || longitude == null) {
    return null
  }

  return {
    location: {
      latitude: latitude,
      longitude: longitude,
    },
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }
}

const {
  loading: loadingDayData,
  error: errorDayData,
  result: activitiesDayData,
  onError, // function to handle errors -> cleaner than watch function?
} = useQuery<QueryResult>(
  ACTIVITIES_BY_LOCATION_AND_DATE,
  () => queryVariables(),
  { fetchPolicy: 'no-cache' },
)

// Handle loading and error states
onError(queryError => {
  console.error('Error fetching available activities:', queryError)
  error.value = queryError
})

console.log('activitiesDayData', activitiesDayData)
// COMPUTE result to update availableActivities for the specific date
const availableActivities = computed(
  () =>
    activitiesDayData.value?.activitiesByLocationAndDate.filter(
      activity => activity.recommended === true,
    ) ?? [],
)

const allActivitiesInArray = computed(() =>
  availableActivities.value
    .flatMap(activity => activity.bookableActivities)
    .sort(
      (a, b) =>
        new Date(a?.startDate ?? 0).getTime() -
        new Date(b?.startDate ?? 0).getTime(),
    ),
)

const showPopup = ref(false)
const selectedActivity = ref<BookableActivity | null>(null)

const openPopup = (activity: BookableActivity) => {
  selectedActivity.value = activity
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedActivity.value = null
}

const showActivities = ref(false)

watch(availableActivities, newVal => {
  if (newVal.length === 1) {
    showActivities.value = true
  }
})

const toggleActivities = () => {
  showActivities.value = !showActivities.value
}

// UseQuery will always start to fetch when data is changed or when mounted
</script>
