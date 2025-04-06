<template>
  <div class="container mx-auto px-4 sm:px-8 xl:px-10 2xl:px-40">
    <div class="min-w">
      <div
        @click="goBack"
        class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max my-4"
      >
        <ArrowLeft class="h-8 w-8 text-gray-800" />
        <p class="p-2 text-xl">{{ t('navigation.home') }}</p>
      </div>
    </div>

    <div
      v-if="loading"
      class="w-full flex rounded-xl items-center justify-center bg-white mb-12"
    >
      <div class="animate-pulse flex flex-col space-y-20 w-full px-4">
        <div class="rounded bg-gray-200 h-128 w-full mb-4"></div>
        <div class="w-full rounded bg-gray-200 h-50"></div>
        <div class="w-full rounded bg-gray-200 h-60"></div>
      </div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      Error: {{ error.message }}
    </div>
    <div v-else-if="data">
      <div class="relative h-128">
        <div
          class="absolute sm:w-2/3 md:w-1/2 inset-x-4 bottom-4 p-4 bg-white rounded-md flex justify-between"
        >
          <div class="w-full">
            <h1 class="text-gray-800 font-bold text-3xl">{{ data.name }}</h1>
            <p class="my-4 w-full sm:w-2/3 xl:w-2/3 2xl:w-2/3">
              {{ data.description }}
            </p>
            <p>
              <span class="font-bold">{{ t('Age.group') }}:</span>
              {{ data.ageGroup }}
            </p>
          </div>
          <div
            class="rounded-full hidden sm:flex bg-gray-100 items-center justify-center h-14 w-14"
          >
            <Plane class="h-8 w-8 color-gray-400" />
          </div>
        </div>
        <img
          v-if="data.bannerImageUrl"
          :src="data.bannerImageUrl"
          alt="Trip image"
          class="w-full h-128 rounded-xl my-4 object-cover object-center z-0"
        />
        <div
          v-else
          class="w-full h-128 bg-gray-100 flex items-center justify-center rounded-xl"
        >
          <ImageOff class="h-12 w-12 text-gray-300" />
        </div>
      </div>

      <!-- Locations of days -->
      <div class="my-4 mt-10">
        <h2 class="font-bold text-2xl text-gray-800 text-start mb-4">
          {{ t('Location.order') }}
        </h2>
        <ul class="flex gap-4 flex-wrap justify-start">
          <li
            v-for="(day, index) in combinedItinerary"
            :key="index"
            class="border border-gray-200 p-4 bg-white shadow-md mb-2 rounded-lg relative cursor-pointer hover:bg-gray-100"
            @click="day.location?.name && openGoogleMaps(day.location.name)"
          >
            <div class="flex gap-2 items-center">
              <div
                class="bg-white w-8 h-8 grid place-items-center rounded-full shadow-lg border-1 border-gray-200"
              >
                <p class="text-gray-500 font-bold">
                  {{ index + 1 }}
                </p>
              </div>
              <div>
                <h3 class="font-bold" v-if="day.location">
                  {{ day.location.name }}
                </h3>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-12"></div>

      <!-- Bookable Trips -->
      <div>
        <h2 class="font-bold text-2xl text-gray-800 text-start mb-4">
          {{ t('Bookable.trips') }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-if="bookableTrips && bookableTrips.length === 0"
            class="text-gray-500 my-12 flex gap-2 items-start"
          >
            <p>{{ t('Bookable.No.trips') }}</p>
            <Frown />
          </div>
          <div v-for="bookableTrip in bookableTrips" :key="bookableTrip.id">
            <BookableTripCard
              :trip="{
                ...bookableTrip,
                status: bookableTrip.status as StatusBookables,
              }"
            />
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-12"></div>

      <!-- Reviews Section -->
      <div class="mb-12">
        <div
          class="flex lg:items-center justify-between flex-col lg:flex-row mb-4"
        >
          <h2 class="font-bold text-2xl text-gray-800">{{ t('Reviews') }}</h2>
          <div class="flex items-center">
            <p class="text-lg font-semibold text-gray-600 mr-2">
              {{ t('Avg.rating') }}:
            </p>
            <div class="flex items-center">
              <template v-for="star in 5" :key="star">
                <Star
                  v-if="star <= Math.floor(Number(averageRating))"
                  class="w-5 h-5 text-amber-500"
                />
                <StarHalf
                  v-else-if="star === Math.ceil(Number(averageRating))"
                  class="w-5 h-5 text-amber-500"
                />
                <Star v-else class="w-5 h-5 text-gray-300" />
              </template>
              <span class="text-lg font-semibold text-gray-600 ml-2">{{
                averageRating
              }}</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="review in data.reviews" :key="review.id">
            <ReviewCard
              :name="review.userId"
              :location="'Unknown Location'"
              :rating="review.rating"
              :review="review.review"
              :createDate="review.createDate"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export enum StatusBookables {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FULL = 'FULL',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}
</script>

<script setup lang="ts">
import {
  ArrowLeft,
  ImageOff,
  Frown,
  Plane,
  Star,
  StarHalf,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_TRIP_BY_ID } from '@/graphql/trip/trip.query'
import type { Trip } from '@/interfaces/trip.interface'
import router from '@/router'
import ReviewCard from '@/components/reusable/reviewCard.vue'
import BookableTripCard from '@/components/reusable/BookableTripCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const tripToFind = route.params.slug as string

const { loading, error, result } = useQuery<{ trip: Trip }>(
  GET_TRIP_BY_ID,
  { id: tripToFind },
  { fetchPolicy: 'cache-and-network' },
)
const data = computed(() => result.value?.trip as Trip)

const bookableTrips = computed(() => {
  return (
    data.value?.bookableTrips?.filter(
      trip =>
        trip.status !== StatusBookables.FINISHED &&
        trip.status !== StatusBookables.CANCELLED,
    ) ?? []
  )
})

const averageRating = computed(() => {
  const ratings = (data.value?.reviews ?? []).map(review => review.rating)
  const totalRatings = ratings.length

  if (totalRatings === 0) return 0 // Prevent division by zero
  const sumRatings = ratings.reduce((acc, rating) => acc + rating, 0)
  return (sumRatings / totalRatings).toFixed(1) // Return average rounded to 1 decimal place
})

const openGoogleMaps = (locationName: string) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`
  window.open(url, '_blank')
}

//switch case for status

const combinedItinerary = computed(() => {
  if (!data.value?.itinerary) return []

  const combined = []
  let previousLocation = null

  for (const day of data.value.itinerary) {
    if (
      previousLocation &&
      previousLocation.location &&
      day.location &&
      previousLocation.location.name === day.location.name
    ) {
      previousLocation.duration += 1 // Increment duration if the same location
    } else {
      previousLocation = { ...day, duration: 1 } // Start a new entry
      combined.push(previousLocation)
    }
  }

  return combined
})

const goBack = () => {
  router.go(-1)
}
</script>
