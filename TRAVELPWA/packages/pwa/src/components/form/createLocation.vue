<template>
  <div>
    <div class="bg-gray-100 p-4 rounded-md">
      <h3 class="text-md block font-bold tracking-wider text-gray-700 mb-1">
        Create New Location
      </h3>
    </div>
    <div class="p-4">
      <div class="mb-2">
        <label
          class="text-md block font-semibold tracking-wider text-gray-700 mb-1"
          >Name</label
        >
        <input
          v-model="newLocationName"
          type="text"
          class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          placeholder="Enter name"
        />
      </div>
      <div class="mb-2">
        <label
          class="text-md block font-semibold tracking-wider text-gray-700 mb-1"
          >Latitude</label
        >
        <input
          v-model.number="newLocationLat"
          type="number"
          class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          placeholder="Enter latitude"
        />
      </div>
      <div class="mb-2">
        <label
          class="text-md block font-semibold tracking-wider text-gray-700 mb-1"
          >Longitude</label
        >
        <input
          v-model.number="newLocationLng"
          type="number"
          class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          placeholder="Enter longitude"
        />
      </div>
      <div class="h-60 mt-4">
        <MapView
          ref="mapViewRef"
          :waypoint="props.selectedWaypoint"
          :clear-view="true"
          :noTouch="!isPopupVisible"
          :createMode="isPopupVisible"
          @location-selected="setNewLocationCoordinates"
        />
      </div>
      <button
        @click="addLocation"
        class="bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-102 transition-all duration-300 text-white w-full rounded-md mt-2 flex items-center justify-center p-2"
      >
        Add
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, getCurrentInstance } from 'vue'
import MapView from '../generic/MapView.vue'

const props = defineProps<{
  selectedWaypoint?: { lat: number; lng: number }
  isPopupVisible: boolean
}>()

const emit = defineEmits(['location-added', 'location-coordinates-set'])

const newLocationName = ref('')
const newLocationLat = ref<number | null>(null)
const newLocationLng = ref<number | null>(null)

interface MapViewInstance {
  getMapInstance: () => mapboxgl.Map | null
}

const instance = getCurrentInstance()
const mapViewRef = ref<MapViewInstance | null>(null)
const addLocation = () => {
  emit('location-added', {
    name: newLocationName.value,
    lat: newLocationLat.value,
    lng: newLocationLng.value,
  })

  // Reset fields after adding
  newLocationName.value = ''
  newLocationLat.value = null
  newLocationLng.value = null
}

const setNewLocationCoordinates = ({
  lng,
  lat,
}: {
  lng: number
  lat: number
}) => {
  newLocationLat.value = lat
  newLocationLng.value = lng
  emit('location-coordinates-set', { lng, lat })
}

watch([newLocationLat, newLocationLng], ([lat, lng]) => {
  if (lat !== null && lng !== null && mapViewRef.value?.getMapInstance()) {
    const mapInstance = mapViewRef.value.getMapInstance()
    if (mapInstance) {
      mapInstance.flyTo({
        center: [lng, lat],
        zoom: 15, // Zoom level
      })
    }
  }
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
