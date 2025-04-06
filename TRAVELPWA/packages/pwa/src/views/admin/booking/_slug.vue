<template>
  <div class="bg-white rounded-xl p-6">
    <!-- Back Button with Icon -->
    <div class="min-w">
      <div
        @click="goBack"
        class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max my-4"
      >
        <ArrowLeft class="h-8 w-8 text-gray-800" />
        <p class="p-2 text-xl">Back</p>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div
      v-if="loading"
      class="w-full flex rounded-xl items-center justify-center bg-gray-white relative"
    >
      <div class="animate-pulse flex flex-col space-y-4 w-full px-4">
        <div class="rounded bg-gray-200 h-128 w-full mb-4"></div>
        <div class="rounded bg-gray-200 h-50 w-full"></div>
        <div class="flex space-x-4 mt-20">
          <div class="w-1/2 flex flex-col gap-4">
            <div class="rounded bg-gray-200 h-10"></div>
            <div class="rounded bg-gray-200 h-200"></div>
          </div>
          <div class="rounded bg-gray-200 h-200 w-1/2 mt-14"></div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      Error: {{ error.message }}
    </div>

    <!-- Main Content -->
    <div v-else-if="booking">
      <div class="relative h-128 mb-10">
        <div class="absolute inset-x-4 bottom-4">
          <div
            class="p-4 bg-white rounded-md flex flex-col xl:flex-row justify-between"
          >
            <div class="w-full">
              <h1 class="text-gray-400 font-bold text-xl">Booking</h1>
              <h1 class="text-gray-700 font-bold text-3xl mb-4">
                {{ booking.trip?.name }}
              </h1>
              <p class="text-xl">
                {{ formatDateWithoutHours(booking.startDate || '') }} -
                {{ formatDateWithoutHours(booking.endDate || '') }}
              </p>
              <p class="my-4 w-full sm:w-2/3 xl:w-1/2 2xl:w-1/2">
                {{ booking.trip?.description }}
              </p>
              <p>
                <span class="font-bold">Age group:</span>
                {{ booking.trip?.ageGroup }}
              </p>
              <p>
                <span class="font-bold">Booked by:</span>
                {{ booking.user?.email }}
              </p>
              <p>
                <span class="font-bold">Total Price Paid:</span> €{{
                  booking.totalPrice
                }}
              </p>
            </div>
            <div class="flex flex-col justify-between items-start xl:items-end">
              <div
                class="rounded-full hidden xl:flex bg-gray-100 items-center justify-center h-14 w-14"
              >
                <Plane class="h-8 w-8 color-gray-400" />
              </div>
            </div>
          </div>
        </div>
        <img
          v-if="booking.trip?.bannerImageUrl"
          :src="booking.trip?.bannerImageUrl"
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

      <!-- People that are going with you -->
      <div
        v-if="booking.extra_persons && booking.extra_persons.length > 0"
        class="my-4"
      >
        <h2 class="font-bold text-2xl text-gray-800 text-start mb-4">
          People that are going with you
        </h2>
        <ul class="flex gap-4 flex-wrap justify-start">
          <li
            v-for="(extraPerson, index) in booking.extra_persons"
            :key="index"
            class="border border-gray-200 p-4 bg-white shadow-md mb-2 rounded-lg relative"
          >
            <div class="flex gap-2 items-center">
              <div
                class="bg-white w-8 h-8 grid place-items-center rounded-full shadow-lg border-1 border-gray-200"
              >
                <p class="text-gray-500 font-bold">{{ index + 1 }}</p>
              </div>
              <div class="px-4">
                <h3 class="font-bold">{{ extraPerson.name }}</h3>
                <h3 class="">{{ extraPerson.email }}</h3>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-12"></div>
      <h2 class="text-2xl font-bold mb-6">Itinerary with your activites</h2>
      <div class="flex">
        <div class="transition-all duration-200 w-full xl:w-1/2">
          <!-- Itinerary Section -->
          <div>
            <ul class="space-y-4">
              <li
                v-for="(day, index) in booking.trip?.itinerary"
                :key="day.id"
                :id="'day-' + (index + 1)"
                class="border border-gray-200 shadow-md rounded-lg mb-5"
              >
                <div class="flex flex-col gap-2">
                  <!-- Header -->
                  <div class="flex items-center gap-2 bg-gray-100 p-4">
                    <div
                      class="p-1 w-12 h-12 grid place-items-center rounded-full border-2 border-white cursor-pointer hover:shadow-lg hover:scale-105 transition-transform"
                      :style="{
                        backgroundColor: markers[index]?.color || 'orange',
                      }"
                      @click="zoomToMarker(index)"
                    >
                      <p class="text-white font-bold">{{ index + 1 }}</p>
                    </div>
                    <div
                      class="flex flex-row w-full justify-between items-center"
                    >
                      <p class="font-bold text-md">{{ day.location?.name }}</p>
                      <div class="flex flex-col items-end">
                        <p class="text-lg font-medium">
                          {{ formatDay(day.date?.toString() || '') }}
                        </p>
                        <p class="text-gray-500">
                          {{ formatFullDate(day.date?.toString() || '') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Activities Controls -->
                  <div
                    class="px-4 flex justify-between items-center mt-2 w-full bg-white rounded-lg mb-2"
                  >
                    <button
                      class="p-2 text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
                      @click="toggleActivities(index)"
                    >
                      Activities ({{ day.activities?.length }})
                      <span v-if="visibleActivities[index]"
                        ><ChevronDown
                      /></span>
                      <span v-else><ChevronUp /></span>
                    </button>
                    <button
                      class="p-2 text-sm text-gray-500 hover:text-gray-800 transition-colors hover:bg-gray-100 rounded-full"
                      @click="editDay(day)"
                    >
                      <Pencil />
                    </button>
                  </div>

                  <!-- Activities List -->
                  <div
                    class="p-4 border overflow-hidden transition-all duration-300"
                    :class="visibleActivities[index] ? 'hidden' : 'relative'"
                  >
                    <div
                      v-if="day.activities?.length === 0"
                      class="text-gray-500"
                    >
                      No activities have been booked...
                    </div>
                    <div v-else>
                      <div
                        v-for="activity in day.activities"
                        :key="activity.id"
                      >
                        <ActivityCard
                          :activity="{
                            ...activity,
                            id: activity.bookableActivity?.id || '',
                            name: activity.activity?.name || 'error: no name',
                            description: activity.activity?.description || '',
                            startDate: new Date(
                              activity.startDate || new Date(),
                            ),
                            endDate: new Date(activity.endDate || new Date()),
                            activityId: activity.id || '',
                          }"
                          @click="openPopup(activity)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar Map/Editor -->
        <div
          class="fixed w-full bottom-0 px-4 xl:top-0 left-0 xl:relative transition-all duration-200 xl:max-h-unset"
          :class="{ 'xl:w-1/2': !isEditing, 'xl:w-full top-0 z-10': isEditing }"
        >
          <button
            class="xl:hidden absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-12 h-12 flex items-center justify-center rounded-lg border-1 border-gray-200 shadow-lg z-1"
            @click="toggleBigMap"
            v-if="isMapView"
          >
            <div v-if="bigMap">
              <ChevronDown class="h-8 w-8 text-gray-800" />
            </div>
            <div v-else>
              <ChevronUp class="h-8 w-8 text-gray-800" />
            </div>
          </button>

          <div
            class="xl:sticky top-0 h-100vh xl:max-h-unset rounded-xl transition-all duration-100"
            :class="{
              'max-h-50vh xl:max-h-unset': bigMap,
              'max-h-30vh xl:max-h-unset': !bigMap,
              'max-h-100vh': !isEditing,
            }"
          >
            <MapView
              v-if="isMapView"
              height="100%"
              :markers="markers"
              ref="mapViewRef"
              @marker-click="scrollToDay"
            />
            <div v-else>
              <EditTripScreen
                v-if="editingDay"
                :editingDay="editingDay"
                @closeEdit="closeEdit"
                @handleDelete="handleDeletedFunction($event)"
                :userUid="booking.user?.uid || ''"
                :extraPersons="booking.extra_persons || []"
                :bookingIdTrip="booking.id"
                :tripPrice="booking.totalPrice || 0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <DetailsActivityBooking
    v-if="selectedActivity"
    :show="showPopup"
    :booking="selectedActivity"
    @close="closePopup"
  />
</template>

<script setup lang="ts">
import type { Booking } from '@/interfaces/booking.interface'
import router from '@/router'
import { useQuery } from '@vue/apollo-composable'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  formatDateWithoutHours,
  formatDay,
  formatFullDate,
  formatTime,
} from '@/utils/converter'
import MapView from '@/components/generic/MapView.vue'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plane,
  ImageOff,
} from 'lucide-vue-next'
import { dragscroll } from 'vue-dragscroll'
import type { Day } from '@/interfaces/day.interface'
import { GET_BOOKING_BY_ID } from '@/graphql/booking/booking.admin.query'
import type { Activity } from '@/interfaces/activity.interface'
import EditTripScreen from '@/components/trips/editTripScreen.vue'
import type { BookableActivity } from '@/interfaces/bookableActivity.interface'
import DetailsActivityBooking from '@/components/generic/DetailsActivityBooking.vue'
import ActivityCard from '@/components/generic/ActivityCard.vue'

const route = useRoute()
const bookingToFind = route.params.slug as string

const booking = ref<Booking | null>(null)
const isMapView = ref(true)
const isEditing = ref(false)
const bigMap = ref(false)
const editingDay = ref<Day | null>(null)

const toggleBigMap = () => {
  bigMap.value = !bigMap.value
  // reload the map to make sure it fits the new size
  if (isMapView.value) {
    isMapView.value = false
    setTimeout(() => {
      isMapView.value = true
    }, 100)
  }
}

const deepCopy = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

const handleDeletedFunction = (ids: string[]) => {
  console.log('ids', ids)
  if (booking.value?.trip?.itinerary) {
    const bookingCopy: Booking = deepCopy(booking.value)
    if (bookingCopy?.trip?.itinerary) {
      bookingCopy.trip.itinerary.forEach(day => {
        // console.log('day', day)
        if (day.activities) {
          day.activities = day.activities.filter(
            activity => !ids.includes(activity.id),
          )
        }
      })
    }
    booking.value = bookingCopy
  }
}

const mapViewRef = ref()
const zoomToMarker = (index: number) => {
  // make sure its IsmapView to true
  isEditing.value = false
  isMapView.value = true
  if (mapViewRef.value) {
    // Call the exposed method from the MapView component
    mapViewRef.value.zoomToMarker(index)
  }
}

const editDay = (day: Day) => {
  editingDay.value = day
  isEditing.value = true
  isMapView.value = false
}

interface QueryResultBooking {
  booking: Booking
}

const { loading, error, result, refetch } = useQuery<QueryResultBooking>(
  GET_BOOKING_BY_ID,
  {
    id: bookingToFind,
  },
  {
    fetchPolicy: 'cache-and-network',
  },
)

watch(result, value => {
  if (value) {
    console.log('hier??')
    // console.log(booking.value)
    // console.log(value.booking)
    booking.value = value.booking
    if (value.booking.trip?.itinerary) {
      visibleActivities.value = value.booking.trip.itinerary.map(
        day => (day.activities?.length ?? 0) === 0,
      )
    }
  }
})

watch(error, value => {
  if (value) {
    console.error('Error fetching booking:', value)
  }
})

const closeEdit = () => {
  isEditing.value = false
  isMapView.value = true
  scrollToDay(1)
}

const markers = computed(() => {
  if (!booking.value?.trip?.itinerary) return []

  const itinerary = booking.value.trip.itinerary
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

const visibleActivities = ref<boolean[]>([])

const toggleActivities = (index: number) => {
  visibleActivities.value[index] = !visibleActivities.value[index]
}

const scrollToDay = (dayIndex: number) => {
  const element = document.getElementById(`day-${dayIndex + 1}`)
  element?.scrollIntoView({ behavior: 'smooth' })
}

const goBack = () => {
  router.go(-1)
}

const showPopup = ref(false)
const selectedActivity = ref<any | undefined>(null)

const openPopup = (activity: any) => {
  selectedActivity.value = activity
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedActivity.value = null
}
</script>
