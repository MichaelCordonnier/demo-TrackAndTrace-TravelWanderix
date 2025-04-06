<template>
  <div class="h-fit md:h-full flex flex-col">
    <!-- Header -->
    <div class="flex gap-2 items-center text-bold">
      <h1 class="">Drivers:</h1>
      <p class="font-bold text-primary text-3xl">{{ allDrivers.length }}</p>
      <PhLegoSmiley :size="32" class="text-primary" />
    </div>

    <!-- Drivers List, Radar Chart, and Line Chart -->
    <div v-if="loading" class="text-center py-10 text-lg text-gray-600">
      Loading...
    </div>
    <div v-else class="flex-1 gap-8 h-full flex gap-4">
      <!-- Drivers List -->
      <div
        class="w-2/3 p-4 h-100% bg-gray-50 flex flex-col justify-between border-rd-2xl"
      >
        <div class="flex-1">
          <h2 class="text-lg font-medium mb-4 text-primary">Drivers List</h2>
          <ul class="w-full flex flex-col gap-4 pl-0">
            <li
              v-for="driver in paginatedDrivers"
              :key="driver.id"
              class="relative flex justify-between rounded-lg bg-white w-full border-rd-md flex-col shadow-md relative"
              @click="dismissNew(driver)"
            >
              <!-- New Indicator -->
              <span
                v-if="driver.isNew"
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
                class="flex justify-between w-full items-center mb-4 p-2 border-rd-md text-primary border-solid border-primary"
              >
                <div class="flex flex-col gap-2">
                  <span> {{ driver.name }} - {{ driver.id }}</span>
                </div>

                <div
                  class="bg-white text-primary border-rd-md p-2 w-24 text-center h-fit"
                >
                  {{ driver.status }}
                </div>
              </div>
              <div class="text-left flex gap-4 p-x-4">
                <div class="p-2">
                  <button
                    class="px-4 py-2 rounded-lg disabled:opacity-50 text-primary hover:bg-blue-50 border-none hover:scale-105 hover:bg-primary hover:text-white transition-all duration-200 ease-in-out z-999 block w-40"
                  >
                    <small>Planned Delivery's</small>
                    <h2>{{ driver.shipmentsIds?.length || 0 }}</h2>
                  </button>
                </div>
                <div class="p-2">
                  <button
                    class="px-4 py-2 rounded-lg disabled:opacity-50 text-primary hover:bg-blue-50 border-none hover:scale-105 hover:bg-primary hover:text-white transition-all duration-200 ease-in-out z-999 w-40"
                  >
                    <small>Planned Pickups</small>
                    <h2>{{ driver.pickupsIds?.length || 0 }}</h2>
                  </button>
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
          Driver Status Overview
        </h2>
        <RadarChart
          :chartData="chartData"
          :options="chartOptions"
          class="h-64"
        />
        <div class="flex justify-between w-full mt-4">
          <div>
            <small>Driving:</small>
            <h2 class="mt-1">{{ chartData.datasets[0].data[0] }}</h2>
          </div>
          <div>
            <small>Resting:</small>
            <h2 class="mt-1">{{ chartData.datasets[0].data[1] }}</h2>
          </div>
          <div>
            <small>Offduty:</small>
            <h2 class="mt-1">{{ chartData.datasets[0].data[2] }}</h2>
          </div>
        </div>

        <!-- Line Chart -->
        <!-- <h2 class="text-lg font-medium mb-4 text-primary mt-0">
          Driver Activity Over Time
        </h2>
        <LineChart
          :chartData="lineChartData"
          :options="lineChartOptions"
          class="h-64"
        /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { PhLegoSmiley } from '@phosphor-icons/vue'
import { RadarChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const wsUrlBase = import.meta.env.VITE_WS_URL_BACKEND || 'ws://localhost:5001/ws'
const wsUrl = `${wsUrlBase}/driver-updates`
const baseURL = import.meta.env.VITE_HTTP_URL_BACKEND || 'http://localhost:5001'
const apiEndpoint = `${baseURL}/api/drivers`
const statusMapping = ['Driving', 'Resting', 'Offduty']

interface Driver {
  id: string
  name: string
  status: string
  phoneNumber: string
  email: string
  isNew?: boolean
  shipmentsIds?: string[]
  pickupsIds?: string[]
  date?: Date
}

const allDrivers = ref<Driver[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const limit = 3

const fetchDrivers = async () => {
  loading.value = true
  try {
    const response = await axios.get(apiEndpoint)
    if (Array.isArray(response.data)) {
      allDrivers.value = response.data.map(driver => ({
        ...driver,
        status: statusMapping[Number(driver.status)] || 'Unknown',
      }))
      totalPages.value = Math.ceil(allDrivers.value.length / limit)
      calculateDriverStatus()
      calculateDriverActivityOverTime()
    }
  } catch (error) {
    console.error('Failed to fetch drivers:', error)
  } finally {
    loading.value = false
  }
}

const paginatedDrivers = computed(() => {
  const start = (page.value - 1) * limit
  return allDrivers.value.slice(start, start + limit)
})

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
  }
}

const dismissNew = (driver: Driver) => {
  driver.isNew = false
}

const chartData = ref({
  labels: statusMapping,
  datasets: [
    {
      label: 'Driver Status',
      data: [0, 0, 0],
      backgroundColor: 'rgba(238, 59, 82, 0.2)',
      borderColor: '#EE3B52',
      borderWidth: 2,
    },
  ],
})
const chartOptions = ref({ responsive: true, maintainAspectRatio: false })

const calculateDriverStatus = () => {
  const statusCount = [0, 0, 0]
  allDrivers.value.forEach(driver => {
    const index = statusMapping.indexOf(driver.status)
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
  labels: [],
  datasets: [
    {
      label: 'Driver Count',
      data: [],
      backgroundColor: 'rgba(238, 59, 82, 0.2)',
      borderColor: '#EE3B52',
      borderWidth: 2,
    },
  ],
})
// const lineChartOptions = ref({ responsive: true, maintainAspectRatio: false })

const calculateDriverActivityOverTime = () => {
  const dateCountMap: { [key: string]: number } = {}
  allDrivers.value.forEach(driver => {
    const date = new Date(driver.date || new Date()).toLocaleDateString()
    if (dateCountMap[date]) {
      dateCountMap[date]++
    } else {
      dateCountMap[date] = 1
    }
  })

  const dates = Object.keys(dateCountMap)
  const counts = Object.values(dateCountMap)

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
    if (data.topic === 'driver-updates' && Array.isArray(data.message)) {
      const updates = data.message as Driver[]
      updates.forEach(update => {
        const existingDriver = allDrivers.value.find(d => d.id == update.id)
        if (!existingDriver) {
          const newDriver: Driver = {
            id: update.id,
            name: update.name,
            status: statusMapping[Number(update.status)] || 'Unknown',
            phoneNumber: update.phoneNumber,
            email: update.email,
            pickupsIds: update.pickupsIds,
            shipmentsIds: update.shipmentsIds,
            date: update.date,
            isNew: true,
          }
          allDrivers.value.push(newDriver)
        } else {
          existingDriver.status =
            statusMapping[Number(update.status)] || 'Unknown'
          existingDriver.pickupsIds = update.pickupsIds
          existingDriver.shipmentsIds = update.shipmentsIds
          existingDriver.isNew = true
        }
      })
      totalPages.value = Math.ceil(allDrivers.value.length / limit)
      calculateDriverStatus()
      calculateDriverActivityOverTime()
    }
  }
}

onMounted(() => {
  fetchDrivers()
  setupWebSocket()
})
</script>
