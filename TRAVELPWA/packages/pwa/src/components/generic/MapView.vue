<template>
  <!-- stef ik heb dit zogemaakt zodat je map responsive reusable is je kan het met een parent div nu beter bepalen wat de hoogte is van je map  -->
  <div
    class="relative h-full"
    :class="createMode ? 'border-2px rounded-2xl' : 'border-0px'"
  >
    <div
      class="map-container"
      :style="{ minHeight: height ? height : '100%' }"
      ref="mapElement"
    ></div>

    <!-- Lucide button for zooming back to the markers -->
    <button v-if="!clearView" @click="zoomToMarkers" class="zoom-btn">
      <LocateFixed name="zoom-in" />
    </button>
    <div
      v-if="noTouch"
      class="absolute w-full h-full border border-gray-300 rounded-xl top-0 left-0"
    >
      <!-- dit verhindert dat mensen aan de map zitten indien het niet in createmode zit -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineProps, watch, getCurrentInstance } from 'vue'
import type { PropType } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { LocateFixed } from 'lucide-vue-next' // Import Lucide icons

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const mapElement = ref<HTMLElement | null>(null)
const mapInstance = ref<mapboxgl.Map | null>(null) // Store the map instance
let markerBounds: mapboxgl.LngLatBounds | null = null // To store the bounds of the markers

let waypointMarker: mapboxgl.Marker | null = null // To store the waypoint marker

const props = defineProps({
  markers: {
    type: Array as PropType<
      {
        lat: number
        lng: number
        label: string
        number: string
        color: string
      }[]
    >,
    required: false,
  },
  height: {
    type: String,
    required: false,
  },
  waypoint: {
    type: Object as PropType<{ lat: number; lng: number }>,
    required: false,
  },
  clearView: {
    type: Boolean,
    required: false,
    default: false,
  },
  noTouch: {
    type: Boolean,
    required: false,
    default: false,
  },
  createMode: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['marker-click', 'marker-zoom', 'location-selected'])

const showMarkers = (map: mapboxgl.Map) => {
  if (!props.markers || props.markers.length <= 0) return

  const bounds = new mapboxgl.LngLatBounds()

  props.markers.forEach((marker, index) => {
    if (!marker.lat || !marker.lng) return // Some markers are invalid

    const el = document.createElement('div')
    el.className = 'marker'
    el.style.backgroundColor = marker.color
    el.style.width = '40px'
    el.style.height = '40px'
    el.style.borderRadius = '50%'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.color = 'white'
    el.style.border = '2px solid white' // Add white border
    el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)' // Add shadow
    el.style.fontWeight = 'bold' // Make numbers bold
    el.innerText = marker.number.toString()
    el.addEventListener('click', () => {
      emit('marker-click', index)
    })

    new mapboxgl.Marker(el)
      .setLngLat([marker.lng, marker.lat])
      .setPopup(
        new mapboxgl.Popup({
          closeButton: false,
          className: 'custom-popup',
          anchor: 'left', // Anchor the popup to the left, so it appears to the right of the marker
          offset: [28, 7],
        }).setHTML(`
        <div>
          <strong>${marker.number}</strong>: ${marker.label}
        </div>
      `),
      )
      .addTo(map)

    bounds.extend([marker.lng, marker.lat])
  })

  markerBounds = bounds // Store the bounds for later use

  map.addControl(new mapboxgl.NavigationControl())
  // If you want more padding
  map.fitBounds(bounds, { padding: 50 })
}

const zoomToMarkers = () => {
  if (mapInstance.value && markerBounds) {
    mapInstance.value.fitBounds(markerBounds, { padding: 50 })
  }
}

const removeMapboxLogo = () => {
  const logo = document.querySelector('.mapboxgl-ctrl-logo')

  // //('LOGOOOOOOOOO')
  // //(logo)

  if (logo) {
    logo.remove()
  }
}

onMounted(() => {
  if (mapElement.value) {
    const map = new mapboxgl.Map({
      container: mapElement.value, // Type assertion
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10, 50], // Center around Europe
      zoom: 4,
      attributionControl: false, // Remove watermark in the bottom-right
      // dragPan: !props.noTouch,
    })

    mapInstance.value = map // Save the map instance

    const instance = getCurrentInstance()
    if (instance) {
      instance.exposed = {
        getMapInstance: () => mapInstance.value,
      }
    }

    map.on('load', () => {
      showMarkers(map)
      removeMapboxLogo()
    })

    if (props.createMode) {
      map.on('click', e => {
        const { lng, lat } = e.lngLat
        emit('location-selected', { lng, lat })
      })
    }
  }
})

const instance = getCurrentInstance()
if (instance) {
  instance.exposed = {
    getMapInstance: () => mapInstance.value,
    zoomToMarker: (index: number) => {
      if (mapInstance.value && props.markers && props.markers[index]) {
        const marker = props.markers[index]
        mapInstance.value.flyTo({ center: [marker.lng, marker.lat], zoom: 15 })
      }
    },
  }
}

watch(
  () => props.waypoint,
  newWaypoint => {
    if (mapInstance.value && newWaypoint) {
      // if (waypointMarker) {
      //   waypointMarker.remove()
      // }
      // waypointMarker = new mapboxgl.Marker({
      //   color: '#f87171',
      // })
      //   .setLngLat([newWaypoint.lng, newWaypoint.lat])
      //   .addTo(mapInstance.value)

      if (props.createMode) {
        console.log('create mode')
        return
      }

      mapInstance.value.flyTo({
        center: [newWaypoint.lng, newWaypoint.lat],
        zoom: 15,
      })
    }
  },
  { immediate: true },
)

watch(
  () => props.createMode,
  newCreateMode => {
    if (mapInstance.value) {
      if (newCreateMode) {
        mapInstance.value.on('click', e => {
          const { lng, lat } = e.lngLat
          emit('location-selected', { lng, lat })
        })
      } else {
        // mapInstance.value.off('click')
      }
    }
  },
)
</script>

<style scoped>
.map-container {
  border-radius: 15px; /* Add rounded corners */
  overflow: hidden; /* Ensure content respects the border radius */
}

.relative {
  position: relative;
}

.zoom-btn {
  position: absolute;
  top: 100px;
  right: 0px;
  margin: 10px;
  background: white; /* Make the button white */
  color: black; /* Change text color to black for contrast */
  border-width: 0px;
  border-style: solid;
  border-color: #e5e7eb;
  border-radius: 10%; /* Make the button round */
  width: 29px; /* Increase size for better visibility */
  height: 29px; /* Increase size for better visibility */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.1s ease; /* Add transition */
}

.zoom-btn:hover {
  background: #f2f2f2;
}
</style>

<style>
.mapboxgl-popup {
  padding: 0 !important;
  background: none !important;
  box-shadow: none !important;
}

.mapboxgl-popup-content {
  padding: 15px !important; /* Adjust padding as needed */
  margin-bottom: 15px;
  background-color: white !important; /* Set popup background color */
  border-radius: 5px !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2) !important;
}

.mapboxgl-popup-tip {
  display: none !important;
}

.custom-popup strong {
  font-size: 1.2em;
  color: #333;
}

.custom-popup::before {
  content: '';
  position: absolute;
  left: -10px; /* Adjust as needed */
  transform: translateY(80%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #fff; /* Same color as the popup background */
}

.waypoint-marker {
  background-color: #f87171;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  font-weight: bold;
}
</style>
