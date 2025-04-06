<template>
  <div class="h-fit md:h-full flex flex-col">
    <!-- Header -->
    <div class="flex gap-2 items-center text-bold">
      <h1 class="">Packages:</h1>
      <p class="font-bold text-primary text-3xl">{{ allPackages.length }}</p>
      <PhPackage :size="32" class="text-primary" />
      <!-- add here a live count of how many packages their are  -->
    </div>

    <!-- Packages List -->
    <div v-if="loading" class="text-center py-10 text-lg text-gray-600">
      Loading...
    </div>
    <div v-else class="flex-1 gap-8 h-full flex gap-4">
      <!-- Packages List -->
      <div
        class="w-2/3 p-4 h-100% bg-gray-50 flex flex-col justify-between border-rd-2xl"
      >
        <div class="h-fit">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium mb-4 text-primary">Packages List</h2>
          </div>
          <div class="flex gap-2 mb-4">
            <button
              v-for="status in statusMapping"
              :key="status"
              @click="toggleStatusFilter(status)"
              :class="{
                'bg-primary text-white': selectedStatuses.includes(status),
                'bg-gray-200 text-primary': !selectedStatuses.includes(status),
              }"
              class="px-4 py-2 rounded-lg border-none h-fit hover:scale-105 transition-all duration-200 ease-in-out"
            >
              {{ status }}
            </button>
          </div>
          <ul class="w-full flex flex-col gap-4 pl-0">
            <li
              v-for="pkg in paginatedPackages"
              :key="pkg.id"
              class="relative flex justify-between rounded-lg bg-white w-full border-rd-md flex-col shadow-md relative hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
              @click="navigateToPackage(pkg.id)"
            >
              <!-- New Indicator -->
              <span
                v-if="pkg.isNew"
                class="absolute bottom-2 right-2 cursor-pointer"
              >
                <span class="relative flex h-3 w-3">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 z-2"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-3 w-3 bg-red-500"
                  ></span>
                </span>
              </span>

              <div
                class="flex justify-between w-full items-center border-solid border-primary p-2 border-rd-md text-primary text-bold"
              >
                <div class="flex flex-col gap-2">
                  <span> {{ pkg.id }}</span>
                </div>
                <div
                  class="bg-white text-primary border-rd-md p-2 w-24 text-center h-fit"
                >
                  <span> {{ pkg.status }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <!-- Pagination Controls -->
        <div class="flex justify-between items-center">
          <button
            :disabled="page <= 1"
            @click="changePage(page - 1)"
            class="px-4 py-2 rounded-lg disabled:opacity-50 text-primary hover:bg-blue-50 border-none hover:scale-105 hover:bg-primary hover:text-white transition-all duration-200 ease-in-out"
          >
            Previous
          </button>
          <span class="text-gray-600">Page {{ page }} of {{ totalPages }}</span>
          <button
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
            class="px-4 py-2 rounded-lg disabled:opacity-50 text-primary hover:bg-blue-50 border-none hover:scale-105 hover:bg-primary hover:text-white transition-all duration-200 ease-in-out"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Radar Chart and Line Chart -->
      <div class="w-1/3 rounded-lg p-6 flex flex-col pt-0">
        <h2 class="text-lg font-medium mb-4 text-primary mt-0">
          Package Status Overview
        </h2>
        <div class="flex flex-col w-full items-center">
          <RadarChart
            :chartData="chartData"
            :options="chartOptions"
            class="h-64 w-fit"
          />
          <div class="flex justify-between w-full">
            <div>
              <small class="">Pending:</small>
              <h2 class="mt-1">{{ chartData.datasets[0].data[0] }}</h2>
            </div>
            <div>
              <small>Pickup:</small>
              <h2 class="mt-1">{{ chartData.datasets[0].data[1] }}</h2>
            </div>

            <div>
              <small>Sorting:</small>
              <h2 class="mt-1">{{ chartData.datasets[0].data[2] }}</h2>
            </div>
            <div>
              <small>Sorted:</small>
              <h2 class="mt-1">{{ chartData.datasets[0].data[3] }}</h2>
            </div>

            <div>
              <small>InTransit:</small>
              <h2 class="mt-1">{{ chartData.datasets[0].data[4] }}</h2>
            </div>

            <div>
              <small>Delivered:</small>
              <h2 class="mt-1">{{ chartData.datasets[0].data[5] }}</h2>
            </div>
          </div>
        </div>

        <!-- Line Chart -->
        <h2 class="text-lg font-medium mb-4 text-primary">
          Package Count Over Time
        </h2>
        <LineChart
          :chartData="lineChartData"
          :options="lineChartOptions"
          class="h-64"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { PhPackage } from '@phosphor-icons/vue'
import { RadarChart, LineChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const router = useRouter()

const wsUrlBase = import.meta.env.VITE_WS_URL_BACKEND || 'ws://localhost:5001/ws'
console.log('WebSocket URL:', wsUrlBase)
const wsUrl = `${wsUrlBase}/package-updates`
const baseURL = import.meta.env.VITE_HTTP_URL_BACKEND || 'http://localhost:5001'
const apiEndpoint = `${baseURL}/api/packages`
console.log('API Endpoint:', apiEndpoint)
const statusMapping = [
  'Pending',
  'Pickup',
  'Sorting',
  'Sorted',
  'InTransit',
  'Delivered',
]

interface GeoLocation {
  latitude: number
  longitude: number
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
  originLocation: GeoLocation
  destinationLocation: GeoLocation
  currentLocation?: GeoLocation
  driverId: string
  isNew?: boolean
  trackingHistory?: Stage[]
  date: Date
}

const allPackages = ref<Package[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const limit = 7
const selectedStatuses = ref<string[]>([])

const fetchPackages = async () => {
  loading.value = true
  try {
    const response = await axios.get(apiEndpoint)
    if (Array.isArray(response.data)) {
      allPackages.value = response.data.map(pkg => ({
        ...pkg,
        status: statusMapping[Number(pkg.status)] || 'Unknown',
      }))

      totalPages.value = Math.ceil(allPackages.value.length / limit)
      calculatePackageStatus()
      calculatePackageCountOverTime()
    }
  } catch (error) {
    console.error('Failed to fetch packages:', error)
  } finally {
    loading.value = false
  }
}

const navigateToPackage = (slug: string) => {
  router.push({ name: 'package', params: { slug } })
}

const filteredPackages = computed(() => {
  if (selectedStatuses.value.length === 0) {
    return allPackages.value
  }
  return allPackages.value.filter(pkg =>
    selectedStatuses.value.includes(pkg.status),
  )
})

const paginatedPackages = computed(() => {
  const start = (page.value - 1) * limit
  return filteredPackages.value.slice(start, start + limit)
})

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
  }
}

// const dismissNew = (pkg: Package) => {
//   pkg.isNew = false
// }

const toggleStatusFilter = (status: string) => {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status)
  } else {
    selectedStatuses.value.push(status)
  }
}

const chartData = ref({
  labels: statusMapping,
  datasets: [
    {
      label: 'Package Status',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(238, 59, 82, 0.2)',
      borderColor: '#EE3B52',
      borderWidth: 2,
    },
  ],
})
const chartOptions = ref({ responsive: true, maintainAspectRatio: false })

const calculatePackageStatus = () => {
  const statusCount = Array(Object.values(statusMapping).length).fill(0)
  allPackages.value.forEach(pkg => {
    const index = statusMapping.indexOf(pkg.status)
    if (index >= 0) statusCount[index]++
  })
  chartData.value.datasets[0].data = statusCount
}

const lineChartData = ref<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
    borderColor: string
    borderWidth: number
  }[]
}>({
  labels: [], // Dates will be added dynamically
  datasets: [
    {
      label: 'Package Count',
      data: [],
      backgroundColor: 'rgba(238, 59, 82, 0.2)',
      borderColor: '#EE3B52',
      borderWidth: 2,
    },
  ],
})
const lineChartOptions = ref({ responsive: true, maintainAspectRatio: false })

const calculatePackageCountOverTime = () => {
  const dateCountMap: { [key: string]: number } = {}
  allPackages.value.forEach(pkg => {
    const date = new Date(
      pkg.trackingHistory?.[0]?.date || pkg.id,
    ).toLocaleDateString()
    if (dateCountMap[date]) {
      dateCountMap[date]++
    } else {
      dateCountMap[date] = 1
    }
  })

  const dates = Object.keys(dateCountMap)
  const counts = Object.values(dateCountMap)

  // Ensure only the last 10 days are shown
  if (dates.length > 10) {
    lineChartData.value.labels = dates.slice(-10)
    lineChartData.value.datasets[0].data = counts.slice(-10)
  } else {
    lineChartData.value.labels = dates
    lineChartData.value.datasets[0].data = counts
  }
}

const setupWebSocket = () => {
  const socket = new WebSocket(wsUrl)
  socket.onmessage = event => {
    const data = JSON.parse(event.data)
    if (data.topic === 'package-updates' && Array.isArray(data.message)) {
      const updates = data.message as Package[]
      updates.forEach(update => {
        const existingPackage = allPackages.value.find(p => p.id == update.id)
        if (!existingPackage) {
          const newPackage: Package = {
            ...update,
            status: statusMapping[Number(update.status)] || 'Unknown',
            isNew: true,
          }
          allPackages.value.push(newPackage)
        } else {
          existingPackage.status =
            statusMapping[Number(update.status)] || 'Unknown'
          existingPackage.currentLocation = update.currentLocation
          existingPackage.isNew = true
        }
      })
      totalPages.value = Math.ceil(allPackages.value.length / limit)
      calculatePackageStatus()
      calculatePackageCountOverTime()
    }
  }
}

onMounted(() => {
  fetchPackages()
  setupWebSocket()
})
</script>
