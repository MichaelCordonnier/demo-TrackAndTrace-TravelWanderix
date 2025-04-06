<template>
  <div class="bg-white rounded-xl p-6">
    <h2 class="font-bold text-xl text-gray-700">Trips</h2>
    <p>Discover the Trips that are currently available.</p>

    <!-- Search and Filter Section -->
    <div class="flex justify-between items-center mb-4 mt-2 pr-3">
      <div class="relative">
        <input
          type="text"
          placeholder="Search"
          class="mb-2 mt-1 block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          v-model="searchQuery"
        />
        <Search class="absolute right-3 top-3 w-6 h-6 text-gray-400" />
      </div>
    </div>

    <div
      class="grid h-[calc(100vh-305px)] py-4 overflow-hidden overflow-y-scroll"
    >
      <div v-if="loading">
        <ul
          class="grid gap-2 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <li v-for="n in 12" :key="n" class="animate-pulse">
            <div class="border rounded-lg w-full h-45 bg-gray-200"></div>
            <div class="bg-gray-200 mt-2 h-5 w-3/4 rounded-md mb-2"></div>
          </li>
        </ul>
      </div>
      <div v-else-if="error" class="text-red font-semibold">
        Error: {{ error.message }}
      </div>
      <div v-else>
        <ul
          class="grid gap-3 transition-all ease-in-out duration-200 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <li
            v-for="trip in filteredTrips"
            :key="trip.id"
            class="relative w-full h-full flex flex-col"
          >
            <div class="flex-grow relative">
              <div class="w-full h-50 bg-gray-200 rounded-lg">
                <img
                  v-if="
                    trip.bannerImageUrl && trip.bannerImageUrl !== 'placeholder'
                  "
                  :src="getImageUrl(trip.bannerImageUrl || '')"
                  alt="Trip Image"
                  class="w-full h-50 object-cover rounded-lg"
                  loading="lazy"
                />
                <div
                  v-else
                  class="bg-gray-200 w-full h-50 grid place-items-center rounded-lg"
                >
                  <ImageOff class="h-8 w-8 text-gray-300" />
                </div>
              </div>
            </div>
            <h2 class="text-black py-2 overflow-hidden text-truncate">
              {{ trip.name }}
            </h2>
            <div
              class="flex gap-2 absolute left-2 bottom-12 align-items-center w-full text-gray-400"
            >
              <router-link
                class="group hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px block"
                :to="{ name: 'admin-trip', params: { slug: trip.id } }"
                ><BookCopy
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
              /></router-link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { GET_TRIPS_ADMIN } from '@/graphql/trip/trips.admin.query'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BookCopy, ImageOff, Pencil, Plus, Search } from 'lucide-vue-next'
import { getImageUrl } from '@/utils/img'
import type { Trip } from '@/interfaces/trip.interface'

const searchQuery = ref('')
const isEditingOrCreate = ref(false)
const selectedTrip = ref<Trip | undefined>(undefined)

const { loading, error, result } = useQuery(GET_TRIPS_ADMIN, null, {
  fetchPolicy: 'cache-and-network',
})

const trips = computed(() => result.value?.trips || [])

const filteredTrips = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return trips.value.filter((trip: Trip) =>
    (trip.name ?? '').toLowerCase().includes(query),
  )
})

const toggleSlide = () => {
  isEditingOrCreate.value = !isEditingOrCreate.value
  if (!isEditingOrCreate.value) {
    selectedTrip.value = undefined
  }
}
</script>
