<template>
  <div class="flex gap-2 items-center">
    <PhFolderSimpleUser :size="32" />
    <h1>Shipment</h1>
  </div>
  <div class="fixed top-0 left-0 w-full h-full bg-pink">
    <div class="w-full h-full" ref="mapContainer"></div>

    <button
      class="absolute top-4 left-4 px-4 py-2 rounded-lg disabled:opacity-50 text-primary hover:bg-blue-50 border-none hover:scale-105 hover:bg-primary hover:text-white transition-all duration-200 ease-in-out"
      @click="goBack()"
    >
      Return
    </button>
    <div
      class="absolute top-0 right-0 w-1/4 h-full flex items-center justify-center p-4"
    >
      <div
        class="bg-white backdrop-blur-4 bg-opacity-30 w-full h-full border-rd-2xl flex items-center p-2"
      >
        <ul
          class="pl-0 flex flex-col w-full h-full overflow-y-scroll no-scrollbar gap-4"
        >
          <p class="w-full bg-primary p-4 border-rd-xl text-white text-center">
            {{ shipment?.id }}
          </p>
          <li
            v-for="(stage, index) in shipment?.routeHistory"
            :key="index"
            class="block bg-white border-rd-xl w-full p-2 h-fit shadow-xl cursor-pointer"
            @click="zoomToPoint(stage)"
          >
            <div>
              <p class="font-bold text-primary">Stage {{ index + 1 }}</p>
              <div class="flex flex-col">
                <div class="flex items-center">
                  <PhTimer :size="32" />
                  <p>{{ new Date(stage.date).toLocaleDateString() }}</p>
                </div>
                <div class="flex gap-2">
                  <small class="border-solid border-primary p-1 border-rd-md">{{
                    stage.latitude
                  }}</small>
                  <small class="border-solid border-primary p-1 border-rd-md">{{
                    stage.longitude
                  }}</small>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { PhTimer, PhFolderSimpleUser } from '@phosphor-icons/vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

const router = useRouter()
const route = useRoute()

const wsUrlBase = import.meta.env.VITE_WS_URL_BACKEND || 'ws://localhost:5001/ws'
const wsUrl = `${wsUrlBase}/shipment/${route.params.slug}`
console.log('WebSocket URL:', wsUrl)
const baseURL = import.meta.env.VITE_HTTP_URL_BACKEND || 'http://localhost:5001'
const apiEndpoint = `${baseURL}/api/shipment/${route.params.slug}`
console.log('API Endpoint:', apiEndpoint)

interface GeoLocation {
  latitude: number
  longitude: number
}

interface GeoLocationWithDate extends GeoLocation {
  date: Date
}

interface Driver {
  id: string
  name?: string
}

interface Stage {
  date: Date
  status?: string
  geoLocation?: GeoLocation
}

interface Package {
  id: string
  destinationStreet?: string
  destinationCountry?: string
  destinationNumber?: string
  destinationRegionCode?: string
  originAddress?: string
  status: string
  origin: GeoLocation
  destination: GeoLocation
  currentLocation?: GeoLocation
  driverId: string
  isNew?: boolean
  trackingHistory?: Stage[]
  date: Date
}

interface Shipment {
  id: string
  driverId?: string
  driver?: Driver
  status?: string
  type?: string
  date: Date
  routeHistory?: GeoLocationWithDate[]
  currentLocation?: GeoLocation
  packagesIds?: string[]
  packages?: Package[]
  isNew?: boolean
}

const shipment = ref<Shipment>()
const loading = ref(true)
const mapContainer = ref<HTMLDivElement>()
let map: mapboxgl.Map

const fetchShipment = async () => {
  try {
    const response = await axios.get(apiEndpoint)
    shipment.value = response.data
    loading.value = false
    initializeMap()
  } catch (error) {
    console.error('Error fetching shipment data:', error)
  }
}

const createCustomMarker = (color: string) => {
  const el = document.createElement('div')
  el.className = 'custom-marker'
  el.style.backgroundColor = color
  el.style.width = '32px'
  el.style.height = '32px'
  el.style.borderRadius = '50%'
  return el
}

const initializeMap = () => {
  if (!shipment.value?.routeHistory) return

  map = new mapboxgl.Map({
    container: mapContainer.value!,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [
      shipment.value.currentLocation?.longitude || 0,
      shipment.value.currentLocation?.latitude || 0,
    ],
    zoom: 8,
  })

  const coordinates: [number, number][] = shipment.value.routeHistory
    .map(
      stage =>
        [stage.longitude, stage.latitude] as [
          number,
          number,
        ],
    )

  coordinates.forEach(coord => {
    new mapboxgl.Marker(
      createCustomMarker(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--primary-color',
        ),
      ),
    )
      .setLngLat([coord[0], coord[1]])
      .addTo(map)
  })

  map.on('load', () => {
    if (coordinates.length > 1) {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          },
          properties: {},
        },
      })

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'rgba(238, 59, 82, 0.6)',
          'line-width': 4,
        },
      })
    }
  })

  removeMapboxLogo()
}

const zoomToPoint = (geoLocation: GeoLocation) => {
  if (!geoLocation) return
  map.flyTo({
    center: [geoLocation.longitude, geoLocation.latitude],
    zoom: 12,
  })
}

const setupWebSocket = () => {
  const socket = new WebSocket(wsUrl)
  socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log('WebSocket message:', data)
    if (data.topic === `shipment/${route.params.slug}`) {
      const updatedShipment = data.shipment as Shipment
      console.log('Updated shipment:', updatedShipment)
      console.log('Updated shipment routeHistory', updatedShipment.routeHistory)
      shipment.value = {
        ...shipment.value,
        ...updatedShipment,
        routeHistory:
          updatedShipment.routeHistory || shipment.value?.routeHistory,
      }
      updateMapWithNewData(updatedShipment)
    }
  }
}

const updateMapWithNewData = (updatedShipment: Shipment) => {
  if (!updatedShipment.routeHistory) return

  const coordinates: [number, number][] = updatedShipment.routeHistory
    .map(
      stage =>
        [stage.longitude, stage.latitude] as [
          number,
          number,
        ],
    )

  coordinates.forEach(coord => {
    new mapboxgl.Marker(
      createCustomMarker(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--primary-color',
        ),
      ),
    )
      .setLngLat([coord[0], coord[1]])
      .addTo(map)
  })

  if (coordinates.length > 1) {
    const routeSource = map.getSource('route')
    if (routeSource) {
      ;(routeSource as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {},
      })
    }
  }
}

const removeMapboxLogo = () => {
  const logo = document.querySelector('.mapboxgl-ctrl-logo')
  const bottomRight = document.querySelector('.mapboxgl-ctrl-bottom-right')

  if (logo) {
    logo.remove()
  }
  if (bottomRight) {
    bottomRight?.remove()
  }
}

onMounted(() => {
  fetchShipment()
  setupWebSocket()
})

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}

.custom-marker {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>