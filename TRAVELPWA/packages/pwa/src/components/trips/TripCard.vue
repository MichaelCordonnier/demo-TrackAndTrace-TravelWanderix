<template>
  <RouterLink
    :to="{ name: 'tripbyname', params: { slug: myTrip.id } }"
    class="w-full h-full"
  >
    <div class="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
      <div
        v-if="bookableTripsCount > 0"
        class="bg-white p-2 shadow-lg rounded-full absolute m-4 px-6"
      >
        <p class="text-base font-inter font-medium text-black-500 text-sm">
          {{ bookableTripsCount }} {{ t('bookable_trips') }}
        </p>
      </div>
      <img
        v-if="myTrip.headerImageUrl"
        :src="myTrip.headerImageUrl"
        alt="Trip image"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gray-100 flex items-center justify-center"
      >
        <ImageOff class="h-12 w-12 text-gray-300" />
      </div>
    </div>

    <div class="flex justify-between items-start pt-2">
      <p class="text-2xl">{{ myTrip.name }}</p>
      <div class="flex items-start">
        <p class="text-base ml-1 font-semibold">{{ averageRating }}</p>
        <StarIcon class="h-5.8 w-5 text-black pl-1" />
      </div>
    </div>
    <p class="text-base font-inter font-semibold">
      € {{ myTrip.bookingSettings?.price ?? 'N/A' }}
    </p>
    <p class="text-gray-500">{{ t('age_group') }}: {{ myTrip.ageGroup }}</p>
  </RouterLink>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { ImageOff, StarIcon } from 'lucide-vue-next' // Importing the StarIcon
import type { Trip } from '@/interfaces/trip.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Define props with types
const props = defineProps<{
  myTrip: Trip
}>()

//(props.myTrip.headerImageUrl)
// Compute the average rating
const averageRating = computed(() => {
  const ratings = (props.myTrip.reviews ?? []).map(review => review.rating)
  const totalRatings = ratings.length

  if (totalRatings === 0) return 0 // Prevent division by zero
  const sumRatings = ratings.reduce((acc, rating) => acc + rating, 0)
  return (sumRatings / totalRatings).toFixed(1) // Return average rounded to 1 decimal place
})

// Compute the count of bookable trips
const bookableTripsCount = computed(() => {
  return (
    props.myTrip.bookableTrips?.filter(
      trip => trip.status !== 'CANCELLED' && trip.status !== 'FINISHED',
    ).length ?? 0
  )
})
</script>
