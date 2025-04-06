<template>
  <div class="bg-gray-100 p-4 rounded-md">
    <div class="relative">
      <h3 class="text-md block font-semibold tracking-wider text-gray-700 mb-1">
        Location: {{ selectedLocation || '' }}
      </h3>
      <div class="flex gap-2 align-center flex items-center">
        <input
          v-model="searchTerm"
          @input="filterLocations"
          placeholder="Search for a location"
          class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          aria-label="Search for a location"
        />
        <Button
          @click="togglePopup"
          class="bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 transition-all duration-300 text-white rounded-full w-10 h-9 flex items-center justify-center"
        >
          <Plus
        /></Button>
      </div>
      <ul
        v-if="searchTerm && filteredLocations.length > 0"
        class="absolute bg-white rounded-md border border-gray-300 rounded shadow-lg w-full z-10 max-h-60 overflow-y-auto"
        role="listbox"
        aria-label="Location List"
      >
        <li
          v-for="location in filteredLocations"
          :key="location.id"
          @click="selectLocation(location)"
          @keydown.enter="selectLocation(location)"
          class="p-2 hover:bg-gray-200 cursor-pointer"
          tabindex="0"
          role="option"
          :aria-selected="isSelected(location)"
        >
          <p class="text-sm block font-medium tracking-wider text-gray-700">
            {{ location.name }}
          </p>
        </li>
      </ul>
      <div
        v-if="isPopupVisible"
        class="absolute top-20 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20"
      >
        <CreateLocation
          :selectedWaypoint="selectedWaypoint"
          :isPopupVisible="isPopupVisible"
          @location-added="handleLocationAdded"
          @location-coordinates-set="setNewLocationCoordinates"
        />
      </div>
    </div>

    <div class="h-40 mt-2">
      <MapView
        :waypoint="selectedWaypoint"
        :clear-view="true"
        :noTouch="!isPopupVisible"
        :createMode="isPopupVisible"
        @location-selected="setNewLocationCoordinates"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'
import {
  ALL_LOCATIONS_QUERY,
  CREATE_LOCATION_MUTATION,
} from '@/graphql/location/location.admin.query'
import type {
  CreateLocationInput,
  Location,
} from '@/interfaces/location.interface'
import { Plus } from 'lucide-vue-next'
import MapView from '../generic/MapView.vue'
import CreateLocation from './createLocation.vue'

const isPopupVisible = ref(false)
const newLocationName = ref('')
const newLocationLat = ref<number | null>(null)
const newLocationLng = ref<number | null>(null)

const props = defineProps<{
  modelValue: string | undefined
}>()

const emit = defineEmits(['update:modelValue'])

const searchTerm = ref('')
const filteredLocations = ref<Location[]>([])
const allLocations = ref<Location[]>([])

const selectedLocation = computed(() => {
  const location = allLocations.value.find(
    location => location.id === props.modelValue,
  )
  return location?.name
})

const selectedWaypoint = ref<{ lat: number; lng: number } | undefined>(
  undefined,
)

interface QueryResultAllLocations {
  allLocations: Location[]
}

const { loading, error, result } = useQuery<QueryResultAllLocations>(
  ALL_LOCATIONS_QUERY,
  null,
  {
    fetchPolicy: 'cache-and-network',
  },
)

if (loading.value) {
  console.log('Loading...')
}

if (error.value) {
  console.error('Error fetching locations:', error.value)
}

watch(result, newResult => {
  console.log('newResult', newResult)
  if (newResult?.allLocations) {
    console.log('jeeps')
    allLocations.value = newResult.allLocations
  }
})

const filterLocations = () => {
  console.log('filterLocations', searchTerm.value)
  console.log('allLocations', allLocations.value)
  if (allLocations.value.length === 0) {
    console.log('No locations available for filtering.')
    return
  }
  filteredLocations.value = allLocations.value.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
}

const selectLocation = (location: Location) => {
  emit('update:modelValue', location.id)
  setWayPoint(location.id)
  searchTerm.value = location.name || ''
  filteredLocations.value = []
}

const isSelected = (location: Location) => {
  return location.id === props.modelValue
}

const setWayPoint = (locationId: string) => {
  console.log('setWayPoint', locationId)
  const selectedLocation = allLocations.value.find(
    location => location.id === locationId,
  )

  console.log('selectedLocation', selectedLocation)
  if (selectedLocation) {
    selectedWaypoint.value = {
      lat: selectedLocation.geolocation?.coordinates[1] || 0,
      lng: selectedLocation.geolocation?.coordinates[0] || 0,
    }
  } else {
    selectedWaypoint.value = undefined // Use undefined instead of null
  }
}

// Watch for changes in result so that we can set our waypoint when all the locations are loaded in
watch(
  () => result.value,
  newValue => {
    if (props.modelValue) {
      setWayPoint(props.modelValue)
      const location = allLocations.value.find(
        location => location.id === props.modelValue,
      )
      searchTerm.value = location?.name || ''
    }
  },
  { immediate: true },
)

const togglePopup = () => {
  isPopupVisible.value = !isPopupVisible.value
}

const { mutate: createLocation } = useMutation<QueryResultCreateLocation>(
  CREATE_LOCATION_MUTATION,
)

interface QueryResultCreateLocation {
  createLocation: Location
}

const handleLocationAdded = async (newLocation: {
  name: string
  lat: number
  lng: number
}) => {
  console.log('New Location:', newLocation)

  try {
    const data = await createLocation({
      createLocationInput: {
        name: newLocation.name,
        geolocation: {
          type: 'Point',
          coordinates: [newLocation.lng, newLocation.lat],
        },
      } as CreateLocationInput,
    })

    console.log('data', data)

    if (data && data.data?.createLocation) {
      allLocations.value = [...allLocations.value, data.data.createLocation]
      filterLocations()
    }
  } catch (error) {
    console.error('Error creating location:', error)
  }

  isPopupVisible.value = false
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
}
</script>
