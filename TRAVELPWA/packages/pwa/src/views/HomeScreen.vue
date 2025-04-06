<template>
  <div>
    <div class="mx-4 sm:mx-8 md:mx-16 lg:mx-32 my-8 z-0">
      <HomeHeader @search="handleSearch" />
    </div>
    <div class="font-futura mx-4 sm:mx-8 md:mx-16 lg:mx-32">
      <h1
        class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide mb-6 text-gray-400 flex w-full items-center justify-center mt-12"
      >
        {{ t('trips') }}
      </h1>
      <div
        v-if="loading"
        class="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="bg-gray-200 h-64 rounded-lg mb-12"
        ></div>
      </div>
      <div v-else class="mb-32">
        <div v-if="error" class="flex-1 text-center my-16">
          Error: {{ error.message }}
        </div>
        <div v-else-if="filteredTrips.length">
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            <TripCard
              v-for="trip in filteredTrips"
              :key="trip.id"
              :myTrip="trip"
              class="hover:transform hover:scale-102 transition-transform duration-300"
            />
          </div>
        </div>
        <div v-else class="text-center my-32">{{ t('trips.notfound') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { GET_SIMPLE_TRIPS } from '@/graphql/trip/trip.query'
import TripCard from '@/components/trips/TripCard.vue'
import HomeHeader from '@/components/generic/HomeHeader.vue'
import type { Trip } from '@/interfaces/trip.interface'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { result, loading, error } = useQuery(GET_SIMPLE_TRIPS, null, {
  fetchPolicy: 'cache-and-network',
})

const filters = ref({ location: '', trip: '', date: '' })

interface SearchCriteria {
  location: string
  trip: string
  date: string
}

const handleSearch = (searchCriteria: SearchCriteria) => {
  filters.value = searchCriteria
}

const filteredTrips = computed(() => {
  if (!result.value?.trips) return []
  if (!filters.value.location && !filters.value.trip && !filters.value.date) {
    return result.value.trips
  }
  return result.value.trips.filter((trip: Trip) => {
    const matchesLocation = filters.value.location
      ? (trip.name
          ?.toLowerCase()
          .includes(filters.value.location.toLowerCase()) ?? false)
      : true
    const matchesTrip = filters.value.trip
      ? (trip.name?.toLowerCase().includes(filters.value.trip.toLowerCase()) ??
        false)
      : true
    const matchesDate = filters.value.date
      ? (trip.bookableTrips?.some(bookableTrip => {
          const startDate = new Date(bookableTrip.startDate)
          const endDate = new Date(bookableTrip.endDate)
          const filterDate = new Date(filters.value.date)
          return filterDate >= startDate && filterDate <= endDate
        }) ?? false)
      : true
    return matchesLocation && matchesTrip && matchesDate
  })
})
</script>
