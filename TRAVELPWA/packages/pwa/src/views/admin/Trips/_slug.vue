<template>
  <div class="bg-white rounded-xl p-6">
    <div
      @click="goBack"
      class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max"
    >
      <ArrowLeft class="h-8 w-8 text-gray-800" />
      <p class="p-2 text-xl">Back</p>
    </div>
    <div v-if="loading">
      <div class="animate-pulse mt-6">
        <!-- Skeleton for the main header -->
        <div class="flex flex-col lg:flex-row gap-6 bg-gray-100 p-4 rounded-lg">
          <!-- Skeleton for text content -->
          <div class="lg:w-2/3 bg-white p-4 rounded-lg">
            <div class="h-8 w-2/3 bg-gray-300 rounded-md mb-4"></div>
            <div class="h-6 w-1/4 bg-gray-300 rounded-md mb-4"></div>
            <div class="h-4 w-full bg-gray-200 rounded-md mb-2"></div>
            <div class="h-4 w-3/4 bg-gray-200 rounded-md mb-2"></div>
            <div class="h-4 w-1/2 bg-gray-200 rounded-md"></div>
          </div>
          <!-- Skeleton for image -->
          <div class="lg:w-1/3 bg-gray-200 rounded-lg h80 relative"></div>
        </div>
        <!-- Skeleton for booking slots -->
        <div class="bg-gray-100 p-4 mt-6">
          <div class="flex justify-between mt-4">
            <div class="h-12 w-1/4 bg-gray-200 rounded-md mb-4"></div>
            <div class="h-12 w-12 bg-gray-200 rounded-full mb-4 mr-4"></div>
          </div>
          <div class="flex flex-col lg:flex-row">
            <div class="mt-2 bg-gray-200 p-4 rounded-lg w-full lg:w-5/7">
              <div class="h-6 w-1/4 bg-gray-300 rounded-md mb-4"></div>
              <div class="space-y-2">
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
                <div class="h-12 bg-gray-300 rounded-md"></div>
              </div>
            </div>
            <div
              class="ml-2 h-140 bg-gray-100 rounded-md hidden lg:block lg:w-1/3 p-4 pt-2"
            >
              <div class="space-y-2">
                <div class="h-12 bg-gray-200 rounded-md"></div>
                <div class="h-12 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="data">
      <div
        class="flex flex-col lg:flex-row gap-6 mt-4 bg-gray-100 p-4 rounded-lg"
      >
        <div class="lg:w-2/3 bg-white p-4 rounded-lg">
          <div
            class="flex items-start lg:items-center flex-col lg:flex-row justify-between border-b border-gray-300 pb-4"
          >
            <h1 class="font-bold text-2xl text-gray-700">{{ data.name }}</h1>
            <div
              class="flex gap-2 items-start mt-2 xl:mt-0 lg:items-end flex-col xl:flex-row"
            >
              <div class="p-2 bg-white border rounded-lg">
                <p class="text-gray-700 text-lg px-4 font-bold">
                  {{ data.bookingSettings?.price }} €
                </p>
              </div>
            </div>
          </div>
          <p class="mt-4 text-gray-600 text-base sm:text-lg lg:text-lg">
            {{ data.description }}
          </p>
          <p class="mt-2 text-gray-700 text-sm sm:text-base">
            <strong>Age Group:</strong> {{ data.ageGroup }}
          </p>
        </div>
        <div
          class="lg:w-1/3 relative max-h bg-gray-100 rounded-lg overflow-hidden"
        >
          <img
            v-if="data.headerImageUrl && data.headerImageUrl !== 'placeholder'"
            :src="data.headerImageUrl"
            alt="Trip Header"
            class="w-full h-full bg-gray-200 object-cover rounded-lg"
            loading="lazy"
          />
          <div
            v-else
            class="bg-gray-200 w-full h-full grid place-items-center rounded-lg"
          >
            <ImageOff class="h-8 w-8 text-gray-300" />
          </div>
        </div>
      </div>
      <div class="mt-4 bg-gray-100 p-4 rounded-lg">
        <BookableViewer
          :bookableItems="data.bookableTrips"
          :parentItem="data"
        />
      </div>
      <div class="bg-gray-100 rounded-md p-4 mt-4">
        <h2 class="font-bold text-2xl text-gray-800">Reviews</h2>
        <div
          class="flex lg:items-center justify-between flex-col lg:flex-row mb-4"
        >
          <div class="flex items-center">
            <p class="text-lg font-semibold text-gray-600 mr-2">
              Average Rating:
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
      <div class="mt-4 bg-gray-100 p-4 rounded-lg">
        <h2 class="font-bold text-2xl text-gray-800 mb-4">Map Itinerary</h2>
        <div class="h-600px">
          <MapView ref="mapElement" :markers="markers" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_TRIP_BY_ID } from '@/graphql/trip/trips.admin.query'
import type { Trip } from '@/interfaces/trip.interface'
import router from '@/router'
import MapView from '@/components/generic/MapView.vue'
import BookableViewer from '@/components/layout/bookableViewer.vue'
import { ArrowLeft, Star, StarHalf, ImageOff } from 'lucide-vue-next'
import ReviewCard from '@/components/reusable/reviewCard.vue'

interface QueryResult {
  trip: Trip
}

const route = useRoute()
const tripToFind = route.params.slug as string

if (!tripToFind) {
  throw new Error('Trip ID is required')
}

const { loading, error, result } = useQuery<QueryResult>(
  GET_TRIP_BY_ID,
  {
    id: tripToFind,
  },
  {
    fetchPolicy: 'cache-and-network',
  },
)

const data = computed(() => result.value?.trip as Trip)
const isEditing = ref(false)

const markers = computed(() => {
  return data.value?.itinerary
    ?.map((day, index) => {
      if (
        !day.location ||
        !day.location.geolocation?.coordinates ||
        !day.location.name
      )
        return null
      const baseHue = 35
      const saturation = 100
      const lightnessStart = 50
      const lightnessEnd = 70
      const lightness =
        lightnessStart +
        ((lightnessEnd - lightnessStart) * index) /
          (data.value?.itinerary?.length || 1)
      return {
        lat: day.location.geolocation.coordinates[1],
        lng: day.location.geolocation.coordinates[0],
        label: day.location.name,
        number: (index + 1).toString(),
        color: `hsl(${baseHue}, ${saturation}%, ${lightness}%)`,
      }
    })
    .filter(marker => marker !== null) as {
    lat: number
    lng: number
    label: string
    number: string
    color: string
  }[]
})

const averageRating = computed(() => {
  const ratings = (data.value?.reviews ?? []).map(review => review.rating)
  const totalRatings = ratings.length
  if (totalRatings === 0) return 0
  const sumRatings = ratings.reduce((acc, rating) => acc + rating, 0)
  return (sumRatings / totalRatings).toFixed(1)
})

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  // Component mounted
})

watch(data, newVal => {
  // Watch for data changes
})
</script>
