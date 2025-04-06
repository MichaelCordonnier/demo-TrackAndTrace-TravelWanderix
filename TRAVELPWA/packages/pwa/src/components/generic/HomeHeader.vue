<template>
  <div
    class="relative flex items-center justify-center w-full h-auto max-h-50vh mb-24 sm:mb-20 lg:mb-12 xl:mb-0"
  >
    <div class="relative w-full">
      <!-- place div under image so if it isnt loaded you see already a gray background -->

      <img
        src="/header_image.jpg"
        alt="Header image"
        class="absolute w-full rounded-md lg:rounded-3xl h-auto max-h-50vh object-cover"
        loading="lazy"
      />
      <div
        class="w-full rounded-md lg:rounded-3xl h-50vh bg-gray-100 shadow-lg"
      ></div>
      <img
        src="/wanderix_logo.svg"
        alt="Logo"
        class="h-16 sm:h-24 md:h-32 absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 hidden xl:block"
      />
    </div>
    <div>
      <!-- For Large Screens (Horizontal Layout) -->
      <div
        class="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-2/3 hidden xl:flex flex-row items-center justify-around rounded-full p-8 w-full max-w-4xl bg-white"
      >
        <div class="flex flex-col items-start">
          <label
            for="location"
            class="block text-gray-700 font-semibold mb-1 text-sm ml-4"
            >{{ t('where') }}</label
          >
          <input
            id="location"
            v-model="location"
            type="text"
            :placeholder="t('Locations.search')"
            class="px-4 py-2 text-gray-700 bg-white rounded-md focus:outline-none focus-visible:ring-2 ring-amber-400"
          />
        </div>
        <div class="hidden sm:block border-r-1 border-gray-300 h-16 mx-4"></div>
        <div class="flex flex-col items-start">
          <label
            for="trip"
            class="block text-gray-700 font-semibold mb-1 text-sm ml-4"
            >{{ t('what') }}</label
          >
          <input
            id="trip"
            v-model="trip"
            type="text"
            :placeholder="t('CityTrip')"
            class="px-4 py-2 text-gray-700 bg-white rounded-md focus:outline-none focus-visible:ring-2 ring-amber-400"
          />
        </div>
        <div class="hidden sm:block border-r-1 border-gray-300 h-16 mx-4"></div>
        <div class="flex flex-col items-start">
          <label
            for="date"
            class="block text-gray-700 font-semibold mb-1 text-sm ml-4"
            >{{ t('when') }}</label
          >
          <input
            id="date"
            v-model="date"
            type="date"
            class="px-4 py-2 text-gray-700 bg-white rounded-md focus:outline-none focus-visible:ring-2 ring-amber-400"
          />
        </div>
        <div
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
          class="hover:shadow-lg cursor-pointer rounded-full h-12 w-12 sm:h-16 sm:w-16 bg-red ml-4 bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center transition-transform duration-300"
          :class="{ 'scale-110': isHovered }"
          @click="search"
        >
          <SearchIcon
            class="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-300"
            :class="{ 'scale-115': isHovered }"
          />
        </div>
      </div>

      <!-- For Small Screens (Vertical Layout) -->
      <div
        class="xl:hidden absolute transform w-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-2/3"
      >
        <div
          class="shadow-md flex flex-col items-start gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 mx-4"
        >
          <div class="flex flex-col w-full">
            <label
              for="location"
              class="block text-gray-700 font-semibold mb-1 text-sm"
              >{{ t('where') }}</label
            >
            <input
              id="location"
              v-model="location"
              type="text"
              :placeholder="t('Locations.search')"
              class="w-full px-4 py-2 border-2 border-gray-200 text-gray-700 bg-white rounded-md focus:outline-none focus-visible:ring-2 ring-amber-400"
            />
          </div>
          <div class="flex flex-col w-full">
            <label
              for="trip"
              class="block text-gray-700 font-semibold mb-1 text-sm"
              >{{ t('what') }}</label
            >
            <input
              id="trip"
              v-model="trip"
              type="text"
              :placeholder="t('CityTrip')"
              class="w-full px-4 py-2 border-2 border-gray-200 text-gray-700 bg-white rounded-md focus:outline-none focus-visible:ring-2 ring-amber-400"
            />
          </div>
          <div class="flex flex-col w-full">
            <label
              for="date"
              class="block text-gray-700 font-semibold mb-1 text-sm"
              >{{ t('when') }}</label
            >
            <input
              id="date"
              v-model="date"
              type="date"
              class="w-full px-4 py-2 border-2 border-gray-200 text-gray-700 bg-white rounded-md focus:outline-none focus-visible:ring-2 ring-amber-400"
            />
          </div>
          <button type="submit" class="text-white w-full" @click="search">
            <p
              class="p-2 bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 hover:shadow-lg duration-300 rounded"
            >
              {{ t('search') }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { SearchIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['search'])

const location = ref('')
const trip = ref('')
const date = ref('')
const isHovered = ref(false)

const search = () => {
  emit('search', {
    location: location.value,
    trip: trip.value,
    date: date.value,
  })
  // Reset input fields after searching
  location.value = ''
  trip.value = ''
  date.value = ''
}
</script>
