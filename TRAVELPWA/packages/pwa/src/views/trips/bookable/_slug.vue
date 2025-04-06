<script setup lang="ts">
import { ImageOff } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_BOOKABLE_TRIP_BY_ID } from '@/graphql/trip/trip.query'
import { GET_ALL_BOOKABLE_IDS_BY_USER } from '@/graphql/user/user.query'
import router from '@/router'
import MapView from '@/components/generic/MapView.vue'
import GroupCard from '@/components/generic/GroupCard.vue'
import type { BookableTrip } from '@/interfaces/bookableTrip.interface'
import { formatDate } from '@/utils/converter'
import useFirebase from '@/composables/useFirebase'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import type { Booking } from '@/interfaces/booking.interface'
import { BookText } from 'lucide-vue-next'
import ProgressBar from '@/components/reusable/ProgressBar.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { firebaseUser } = useFirebase()

//if there is a firebase user check bookings with bookableids and compare for user

// Check if there's a firebase user, then fetch bookings by user
const { result: bookingsResult } = useQuery(GET_ALL_BOOKABLE_IDS_BY_USER, {
  uid: firebaseUser?.value?.uid,
})

const userBookings = computed(
  () =>
    bookingsResult.value?.userByFirebaseUid?.bookings.map(
      (booking: Booking) => booking.bookableTripId,
    ) || [],
)

const hasBooked = computed(() =>
  userBookings.value.includes(bookableTripToFind),
)

const route = useRoute()
const bookableTripToFind = route.params.slug as string

const { loading, error, result } = useQuery<{ bookableTrip: BookableTrip }>(
  GET_BOOKABLE_TRIP_BY_ID,
  { id: bookableTripToFind },
  { fetchPolicy: 'cache-and-network' },
)

console.log('result', result)

const data = computed(() => result.value?.bookableTrip as BookableTrip)

//filter also here

const itineraryWithDates = computed(() => {
  if (!data.value?.trip?.itinerary || !data.value.startDate) return []

  const startDate = new Date(data.value.startDate)
  const itinerary = data.value.trip.itinerary

  const groupedItinerary = []
  let groupStartIndex = 0

  for (let i = 1; i <= itinerary.length; i++) {
    const isLastDay = i === itinerary.length
    const currentLocation = itinerary[i]?.location?.name
    const previousLocation = itinerary[i - 1]?.location?.name

    // Check if the next day has a different location or if it's the last day
    if (isLastDay || currentLocation !== previousLocation) {
      const dayStart = new Date(startDate)
      dayStart.setDate(startDate.getDate() + groupStartIndex)

      // Create an array to hold days with the same location
      const dayGroup: {
        id: string
        location: any
        label: string
        dates: {
          label: string
          date: Date
          location_id: string
          bookidActivitys: string[]
        }[]
      } = {
        id: `day-${groupStartIndex + 1}`,
        location: itinerary[groupStartIndex].location,
        dates: [],
        label: '',
      }

      //make label for days (if only 1 date just show number)
      if (groupStartIndex === i - 1) dayGroup.label = `${groupStartIndex + 1}`
      else dayGroup.label = `${groupStartIndex + 1}-${i}`

      for (let j = groupStartIndex; j < i; j++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + j)
        dayGroup.dates.push({
          label: `${j + 1}`,
          date: day,
          location_id: itinerary[j].location?.id || '',
          bookidActivitys: itinerary[j].bookidActivitys || [],
        })
      }

      groupedItinerary.push(dayGroup)
      groupStartIndex = i // Update group start to current day
    }
  }

  return groupedItinerary
})

const markers = computed(() => {
  if (!data.value?.trip?.itinerary) return []

  const itinerary = data.value.trip.itinerary
  const groupedMarkers = []
  let groupStartIndex = 0

  // Define a base hue for the color row
  const baseHue = 35 // Example: orange
  const saturation = 100 // Keep saturation constant
  const lightnessStart = 50 // Starting lightness
  const lightnessEnd = 70 // Ending lightness

  for (let i = 1; i <= itinerary.length; i++) {
    const isLastDay = i === itinerary.length
    const currentLocation = itinerary[i]?.location?.name
    const previousLocation = itinerary[i - 1]?.location?.name

    // Check if the next day has a different location or if it's the last day
    if (isLastDay || currentLocation !== previousLocation) {
      const location = itinerary[groupStartIndex].location
      if (location && location.geolocation?.coordinates) {
        // Calculate lightness based on group start index
        const lightness =
          lightnessStart +
          ((lightnessEnd - lightnessStart) * groupStartIndex) / itinerary.length

        if (groupStartIndex === i - 1)
          groupedMarkers.push({
            lat: location.geolocation.coordinates[1],
            lng: location.geolocation.coordinates[0],
            label: location.name || '',
            number: `${groupStartIndex + 1}`,
            color: `hsl(${baseHue}, ${saturation}%, ${lightness}%)`,
          })
        else
          groupedMarkers.push({
            lat: location.geolocation.coordinates[1],
            lng: location.geolocation.coordinates[0],
            label: location.name || '',
            number: `${groupStartIndex + 1}-${i}`,
            color: `hsl(${baseHue}, ${saturation}%, ${lightness}%)`,
          })
      }

      groupStartIndex = i // Update group start to current day
    }
  }

  return groupedMarkers
})

const mapViewRef = ref()

const scrollToDay = (dayIndex: number) => {
  const element = document.getElementById(`day-${dayIndex}`)
  console.log('dayIndex', dayIndex)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const zoomToMarker = (index: number) => {
  if (mapViewRef.value) {
    mapViewRef.value.zoomToMarker(index)
  }
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-8 xl:px-10 2xl:px-40 mb-12">
    <div class="min-w">
      <div
        @click="goBack"
        class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max my-4"
      >
        <ArrowLeft class="h-8 w-8 text-gray-800" />
        <p class="p-2 text-xl">{{ t('back') }}</p>
      </div>
    </div>

    <div
      v-if="loading"
      class="w-full flex rounded-xl items-center justify-center bg-gray-white relative mb-12"
    >
      <div class="animate-pulse flex flex-col space-y-4 w-full px-4">
        <div class="rounded bg-gray-200 h-128 w-full mb-4"></div>
        <div class="flex space-x-4 mt-10">
          <div class="w-1/2 flex flex-col gap-4">
            <div class="rounded bg-gray-200 h-10"></div>
            <div class="rounded bg-gray-200 h-200"></div>
          </div>
          <div class="rounded bg-gray-200 h-200 w-1/2 mt-14"></div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ t('error') }} {{ error.message }}
    </div>
    <div v-else-if="data">
      <div class="relative h-128">
        <div class="absolute inset-x-4 bottom-4">
          <div
            class="flex justify-between md:items-center flex-col md:flex-row"
          >
            <div
              :class="{
                'bg-green-200': data.status === 'OPEN',
                'bg-red-200': data.status === 'CLOSED',
                'bg-yellow-200': data.status === 'FULL',
                'bg-gray-200':
                  data.status === 'FINISHED' || data.status === 'CANCELLED',
              }"
              class="block w-max p-2 px-8 rounded-md my-2 text-white font-medium shadow-md"
            >
              <p v-if="data.status === 'OPEN'" class="text-green-700">
                {{ t('booking_open') }}
              </p>
              <p v-else-if="data.status === 'CLOSED'" class="text-red-700">
                {{ t('booking_closed') }}
              </p>
              <p v-else-if="data.status === 'FULL'" class="text-amber-600">
                {{ t('booking_full') }}
              </p>
              <p v-else-if="data.status === 'FINISHED'" class="text-gray-700">
                {{ t('booking_finished') }}
              </p>
              <p v-else-if="data.status === 'CANCELLED'" class="text-gray-700">
                {{ t('booking_cancelled') }}
              </p>
            </div>
            <div class="mb-2 md:mb-0 w-max">
              <ProgressBar
                :places="data.bookableSettings.places"
                :maxPersons="data.bookableSettings.max_persons"
              />
            </div>
          </div>
          <div
            class="p-4 bg-white rounded-md flex flex-col md:flex-row justify-between"
          >
            <div class="w-full">
              <h2 class="text-gray-500 text-lg font-semibold">
                {{ t('trip_name') }}
              </h2>
              <h1 class="text-gray-800 font-bold text-3xl">
                {{ data.trip.name }}
              </h1>
              <p class="text-xl">
                {{ formatDate(data.startDate) }} -
                {{ formatDate(data.endDate) }}
              </p>
              <p class="my-4 w-full sm:w-2/3 xl:w-1/2 2xl:w-1/2">
                {{ data.trip.description }}
              </p>
              <p>
                <span class="font-bold">{{ t('age_group') }}:</span>
                {{ data.trip.ageGroup }}
              </p>
              <p>
                <span class="font-bold">{{ t('price') }}:</span> ${{
                  data.bookableSettings.price
                }}
              </p>
            </div>
            <div class="flex flex-col justify-between items-start md:items-end">
              <div
                class="rounded-full hidden md:flex bg-gray-100 items-center justify-center h-14 w-14"
              >
                <BookText class="h-8 w-8 color-gray-400" />
              </div>
              <div class="w-max">
                <div v-if="firebaseUser" class="flex gap-4">
                  <div v-if="hasBooked">
                    <div
                      class="bg-gray-200 text-gray-500 w-max mt-2 inline-block rounded ml-0 md:ml-4 p-2 px-8"
                    >
                      {{ t('already_booked') }}
                    </div>
                  </div>
                  <div v-else>
                    <RouterLink
                      v-if="data.status === 'OPEN'"
                      :to="'/booking/trip/' + data.id"
                    >
                      <p
                        class="hover:scale-105 hover:shadow-lg duration-300 text-white p-2 bg-gradient-to-br from-amber-300 to-orange-400 w-max mt-2 inline-block rounded-md ml-0 md:ml-4 px-8"
                      >
                        {{ t('book_trip') }}
                      </p>
                    </RouterLink>
                    <div v-else>
                      <p
                        class="bg-gray-200 text-gray-500 w-max mt-2 inline-block rounded ml-4 p-2 px-8"
                      >
                        {{ t('booking_closed') }}
                      </p>
                    </div>
                  </div>
                </div>
                <RouterLink v-else to="/login">
                  <p
                    class="hover:scale-105 hover:shadow-lg duration-300 text-white p-2 bg-gradient-to-br from-amber-300 to-orange-400 w-max mt-2 inline-block rounded ml-4 px-8"
                  >
                    {{ t('login_to_book') }}
                  </p>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
        <img
          v-if="data.trip.bannerImageUrl"
          :src="data.trip.bannerImageUrl"
          alt="{{ t('trip_image') }}"
          class="w-full h-128 rounded-xl my-4 object-cover object-center z-0"
        />
        <div
          v-else
          class="w-full h-128 bg-gray-100 flex items-center justify-center rounded-xl"
        >
          <ImageOff class="h-12 w-12 text-gray-300" />
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-12"></div>

      <h2 class="font-bold text-2xl text-gray-800 text-start mb-4">
        {{ t('day_itinerary_with_recommended_activities') }}
      </h2>
      <!-- Two-column layout for itinerary and map -->
      <div class="flex gap-6 mt-6 flex-col md:flex-row">
        <!-- Itinerary on the right side -->
        <div class="w-full md:w-1/2">
          <ul>
            <li
              class="border border-gray-200 p-4 bg-gray-100 shadow-md bg-op-10 mb-5 rounded-lg"
            >
              <div class="flex gap-2 items-center">
                <div>
                  <h3 class="font-bold text-md">
                    {{ t('departure_meeting') }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ t('info_provided_by_leader') }}
                  </p>
                </div>
              </div>
            </li>
            <GroupCard
              v-for="(dayGroup, index) in itineraryWithDates"
              :key="dayGroup.id"
              :dayGroup="dayGroup"
              :index="index"
              :markers="markers"
              :zoomToMarker="zoomToMarker"
            />
            <li
              class="border border-gray-200 p-4 bg-gray-100 shadow-md bg-op-10 mb-5 rounded-lg"
            >
              <div class="flex gap-2 items-center">
                <div>
                  <h3 class="font-bold">{{ t('trip_end') }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ t('return_home') }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Map on the left side -->
        <div class="w-full md:w-1/2">
          <div class="sticky top-5">
            <div class="h-80vh">
              <MapView
                :markers="markers"
                @marker-click="scrollToDay"
                height="80vh"
                ref="mapViewRef"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
