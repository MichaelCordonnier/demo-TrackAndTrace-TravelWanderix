<template>
  <div class="bg-white rounded-lg border mt-2 p-5 aspect-square w-80%">
    <header class="flex items-center justify-between mb-4">
      <p class="font-semibold text-xl calendar-current-date">
        {{ currentDate }}
      </p>
      <div class="flex space-x-2 calendar-navigation">
        <button
          @click="prevMonth"
          class="material-icons cursor-pointer hover:bg-gray-200 rounded-full p-2"
        >
          <ChevronLeft />
        </button>
        <button
          @click="nextMonth"
          class="material-icons cursor-pointer hover:bg-gray-200 rounded-full p-2"
        >
          <ChevronRight />
        </button>
      </div>
    </header>
    <div class="calendar-body w-full aspect-square">
      <ul
        class="flex text-center text-gray-500 font-medium mb-4 calendar-weekdays"
      >
        <li class="flex-1" v-for="day in days" :key="day">{{ day }}</li>
      </ul>
      <ul class="grid grid-cols-7 grid-rows-6 w-full h-full calendar-dates">
        <li
          v-for="(date, index) in dates"
          :key="index"
          class="aspect-square flex items-center justify-center cursor-pointer"
          :class="[
            date.inactive ? 'text-gray-400' : 'text-gray-700',
            isSelectedDate(date)
              ? 'bg-gradient-to-br from-amber-300 to-orange-400 text-white rounded-md'
              : '',
          ]"
          @click="selectDate(date)"
        >
          {{ date.date }}
        </li>
      </ul>
    </div>
    <p
      v-if="errorMessage"
      class="text-red-600 mt-4 text-start rounded-md p-4 bg-red-100"
    >
      {{ errorMessage }}
    </p>
    <button
      @click="resetDates"
      class="mt-4 bg-gradient-to-br from-red-400 to-red-600 text-white p-2 rounded px-4 hover:scale-105 transform duration-300 hover:shadow-lg"
    >
      Reset Dates
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const date = ref(new Date())
const year = ref(date.value.getFullYear())
const month = ref(date.value.getMonth())
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const emit = defineEmits(['updatePeriod'])

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const currentDate = computed(() => `${months[month.value]} ${year.value}`)

const dates = computed(() => {
  const firstDayOfMonth = new Date(year.value, month.value, 1).getDay()
  const lastDateOfMonth = new Date(year.value, month.value + 1, 0).getDate()
  const lastDayOfMonth = new Date(
    year.value,
    month.value,
    lastDateOfMonth,
  ).getDay()
  const lastDateOfPrevMonth = new Date(year.value, month.value, 0).getDate()

  const calendarDays = []

  // Previous month dates
  for (let i = firstDayOfMonth; i > 0; i--) {
    calendarDays.push({
      date: lastDateOfPrevMonth - i + 1,
      inactive: true,
      fullDate: new Date(
        year.value,
        month.value - 1,
        lastDateOfPrevMonth - i + 1,
      ),
    })
  }

  // Current month dates
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const isToday =
      i === date.value.getDate() &&
      month.value === new Date().getMonth() &&
      year.value === new Date().getFullYear()
    calendarDays.push({
      date: i,
      inactive: false,
      active: isToday,
      fullDate: new Date(year.value, month.value, i),
    })
  }

  // Next month dates
  for (let i = lastDayOfMonth; i < 6; i++) {
    calendarDays.push({
      date: i - lastDayOfMonth + 1,
      inactive: true,
      fullDate: new Date(year.value, month.value + 1, i - lastDayOfMonth + 1),
    })
  }

  return calendarDays
})

const selectedDates = ref<Date[]>([])
const errorMessage = ref<string | null>(null)

// Function to go to the next month
const nextMonth = () => {
  if (month.value === 11) {
    month.value = 0
    year.value += 1
  } else {
    month.value += 1
  }
}

// Function to go to the previous month
const prevMonth = () => {
  if (month.value === 0) {
    month.value = 11
    year.value -= 1
  } else {
    month.value -= 1
  }
}

const selectDate = (dateObj: {
  date: number
  inactive: boolean
  fullDate: Date
}) => {
  if (dateObj.inactive) return

  const dateIndex = selectedDates.value.findIndex(
    d => d.getTime() === dateObj.fullDate.getTime(),
  )

  if (dateIndex === -1) {
    selectedDates.value.push(dateObj.fullDate)
  } else {
    selectedDates.value.splice(dateIndex, 1)
  }

  emit('updatePeriod', selectedDates.value)
}

// Function to check if a date is selected
const isSelectedDate = (dateObj: { fullDate: Date }) => {
  return selectedDates.value.some(
    d => d.getTime() === dateObj.fullDate.getTime(),
  )
}

// Function to reset selected dates
const resetDates = () => {
  selectedDates.value = []
  emit('updatePeriod', selectedDates.value)
}
</script>
