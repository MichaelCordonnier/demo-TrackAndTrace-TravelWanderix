<template>
  <div class="font-sans h-[calc(100vh-40px)] flex flex-col">
    <div class="flex items-center justify-between">
      <div class="flex gap-10">
        <div class="flex gap-2 items-center">
          <PhAirTrafficControl :size="32" />
          <h2 class="">Track & Trace Dashboard</h2>
        </div>
        <h1 class="bg-white font-bold text-primary p-2 border-rd-2xl shadow-sm">
          {{ currentTime }}
        </h1>
      </div>
      <div class="flex-wrap flex h-fit gap-2">
        <RouterLink
          to="/"
          class="p-2 border-rd-md decoration-none hover:bg-primary hover:text-white hover:scale-102 transition-all ease-in-out duration-200 text-font"
          :class="{ 'bg-primary text-white': route.path === '/' }"
          >Packages</RouterLink
        >
        <RouterLink
          to="/shipments"
          class="p-2 border-rd-md decoration-none hover:bg-primary hover:text-white hover:scale-102 transition-all ease-in-out duration-200 text-font"
          :class="{ 'bg-primary text-white': route.path === '/vehicles' }"
          >Shipments</RouterLink
        >

        <RouterLink
          to="/drivers"
          class="p-2 border-rd-md decoration-none hover:bg-primary hover:text-white hover:scale-102 transition-all ease-in-out duration-200 text-font"
          :class="{ 'bg-primary text-white': route.path === '/drivers' }"
          >Drivers</RouterLink
        >
      </div>
    </div>

    <!-- Added shadow class here -->
    <div class="flex-grow p-4 bg-white border-rd-2xl shadow-custom">
      <RouterView class="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { PhAirTrafficControl } from '@phosphor-icons/vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const currentTime = ref('')
let intervalId: number | null = null // To store interval ID

const baseURL = import.meta.env.VITE_HTTP_URL_BACKEND || 'http://localhost:5001'
const apiEndpoint = `${baseURL}/api/time`  
const wsUrlBase = import.meta.env.VITE_WS_URL_BACKEND || 'ws://localhost:5001/ws'
const wsUrl = `${wsUrlBase}/time-updates`

// Function to format the time string
const formatTime = (timeString: string): string => {
  if (!timeString) {
    throw new Error('Invalid input: timeString is undefined or null')
  }

  const [datePart, timePart] = timeString.split('T')
  if (!datePart || !timePart) {
    throw new Error('Invalid time string format')
  }

  // we dont need year thats why but we need it for sorting purpose
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [year, month, day] = datePart.split('-')
  const [time] = timePart.split('.')
  const [hours, minutes] = time.split(':')

  return `${hours}:${minutes} - ${day}/${month}`
}

// Function to fetch the time from API
const fetchTime = async () => {
  try {
    const { data } = await axios.get(apiEndpoint)
    currentTime.value = formatTime(data)
  } catch (error) {
    console.error('Error fetching time:', error)
  }
}

// Function to set up the WebSocket connection
const setupWebSocket = () => {
  const socket = new WebSocket(wsUrl)
  socket.onmessage = event => {
    try {
      const data = JSON.parse(event.data)
      if (data.topic === 'time-updates' && data.message) {
        currentTime.value = formatTime(data.message)
      } else {
        console.error('Invalid WebSocket message format', data)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  socket.onerror = error => {
    console.error('WebSocket error:', error)
  }

  socket.onclose = () => {
    console.warn('WebSocket connection closed')
  }
}

// Function to increment the time by 1 minute dynamically
const startClock = () => {
  intervalId = setInterval(() => {
    if (currentTime.value) {
      const [time, date] = currentTime.value.split(' - ')
      const [hours, minutes] = time.split(':').map(Number)

      // Increment time by 1 minute
      let newMinutes = minutes + 1
      let newHours = hours

      if (newMinutes === 60) {
        newMinutes = 0
        newHours = (newHours + 1) % 24 // Wrap around hours
      }

      const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
      currentTime.value = `${formattedTime} - ${date}`
    }
  }, 60000) // Update every 60 seconds
}

// Clean up interval when component is unmounted
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Initial setup on component mount
onMounted(() => {
  fetchTime()
  setupWebSocket()
  startClock() // Start dynamic time updates
})
</script>

<style>
@font-face {
  font-family: 'Roboto';
  src: url('@/assets/fonts/Roboto-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Roboto';
  src: url('@/assets/fonts/Roboto-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

body {
  background-color: #f8f9fb;
  margin: 0;
  padding: 10px;
  box-sizing: border-box;
  color: 030303;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

.shadow-custom {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
