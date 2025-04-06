<template>
  <div class="flex justify-between mb-4">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-semibold">Available Booking Slots</h1>
    </div>

    <button
      class="w-12 h-12 font-bold text-white flex items-center justify-center hover:scale-105 hover:shadow-lg transform duration-300 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full"
      @click="toggleAddBookable(null)"
    >
      <Plus class="w-8 h-8" />
    </button>
  </div>

  <div class="flex pb-2 gap-6 relative">
    <div class="w-full h-80vh border bg-white p-4 border-rd-md flex flex-col">
      <div
        class="flex flex-row justify-between mr-3 border-gray-200 border-b-2 pt-1.8 pb-2"
      >
        <h2 class="text-xl font-semibold mb-2">{{ currentPeriodTitle }}</h2>
        <div v-if="!isFilterApplied" class="mr-10 lg:mr-0 z-10">
          <button @click="showPreviousMonth"><ChevronLeft /></button>
          <button @click="showNextMonth"><ChevronRight /></button>
        </div>
      </div>
      <div v-if="filteredItems.length" class="flex-grow overflow-y-scroll">
        <div v-for="(item, index) in filteredItems" :key="item.id">
          <div v-if="isNewDay(index)">
            <p class="text-lg font-semibold text-gray-700 mt-4">
              {{ formatDay(item.startDate.toString()) }}
            </p>
          </div>
          <div
            class="flex gap-4 flex-col lg:flex-row justify-between items-center sm:items-start lg:items-center bg-gray-100 border border-gray-200 p-4 rounded-md mt-2"
          >
            <div>
              <div
                class="flex gap-2 items-center sm:items-start lg:items-center flex-col lg:flex-row"
              >
                <div class="flex gap-2 flex-col sm:flex-row">
                  <div
                    :class="{
                      'bg-green-200': item.status === 'OPEN',
                      'bg-red-200': item.status === 'CLOSED',
                      'bg-yellow-200': item.status === 'FULL',
                      'bg-gray-200':
                        item.status === 'FINISHED' ||
                        item.status === 'CANCELLED',
                    }"
                    class="block w-max p-2 px-8 rounded-md text-white font-medium"
                  >
                    <p v-if="item.status === 'OPEN'" class="text-green-700">
                      Open
                    </p>
                    <p
                      v-else-if="item.status === 'CLOSED'"
                      class="text-red-700"
                    >
                      Closed
                    </p>
                    <p
                      v-else-if="item.status === 'FULL'"
                      class="text-amber-600"
                    >
                      Full
                    </p>
                    <p
                      v-else-if="item.status === 'FINISHED'"
                      class="text-gray-700"
                    >
                      Finished
                    </p>
                    <p
                      v-else-if="item.status === 'CANCELLED'"
                      class="text-gray-700"
                    >
                      Cancelled
                    </p>
                  </div>
                  <div
                    class="bg-white rounded-md p-2 flex gap-2 items-center px-4"
                  >
                    <p>
                      {{
                        (item.bookableSettings?.max_persons ?? 0) -
                        (item.bookableSettings?.places ?? 0)
                      }}
                      /
                      {{ item.bookableSettings?.max_persons }}
                    </p>
                    <Users class="w-4 h-4" />
                  </div>
                </div>
                <div
                  v-if="isBookableActivity(item)"
                  class="w-max sm:w-max lg:w-60 text-center bg-white p-2 rounded-md px-4"
                >
                  <p>
                    {{
                      formatDateRange(
                        item.startDate.toString(),
                        item.endDate.toString(),
                      )
                    }}
                  </p>
                </div>
                <div
                  v-else
                  class="w-max sm:w-max lg:w-60 text-center bg-white p-2 rounded-md px-4"
                >
                  <p>
                    {{ formatDate(item.startDate) }} -
                    {{ formatDate(item.endDate) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="flex gap-2 items-center justify-center text-gray-400">
              <router-link
                class="group hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px block"
                v-if="!isBookableActivity(item)"
                :to="{
                  name: 'admin-bookable-trip',
                  params: { slug: item.id },
                }"
                ><BookCopy
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
              /></router-link>
              <router-link
                class="group hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px block"
                v-else
                :to="{
                  name: 'admin-bookable-activity',
                  params: { slug: item.id },
                }"
                ><Eye
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
              /></router-link>
              <button
                class="group hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px block"
                @click="toggleAddBookable(item)"
              >
                <Pencil
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="flex-grow w-full flex flex-col gap-2 items-center justify-center text-gray-700 opacity-70 border-rd-md text-center"
      >
        <p>No Bookables for this Month/period</p>
        <HeartCrack />
      </div>
    </div>

    <div
      class="absolute right-4 top-4 rounded-md lg:sticky top-0 lg:w-1/2 z-999"
    >
      <button
        class="block sticky top-7.5 p-2 lg:hidden"
        @click="toggleMobileFilter"
      >
        <Filter />
      </button>

      <!-- puur mobile use only -->
      <transition name="slide">
        <div
          v-if="isMobileFilterOpen"
          class="fixed left-0 w-full h-[100vh] bg-white p-4 top-0"
        >
          <button
            @click="toggleMobileFilter"
            class="lg:hidden h-10 w-10 mb-10 mt-4 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
            aria-label="Close"
          >
            <X class="h-6 w-6" />
          </button>
          <FilterBookable @applyFilters="applyFilters" />
        </div>
      </transition>

      <div v-if="!isMobileFilterOpen" class="hidden lg:block">
        <div class="sticky top-4 bg-white p-4 rounded-md border">
          <FilterBookable @applyFilters="applyFilters" />
        </div>
      </div>
    </div>
  </div>

  <SideSlide
    v-if="isAddingBookable"
    @closeSlide="closeBookable"
    @saveSlide="saveBookableEditOrCreate"
  >
    <!-- Create/update Bookable -->
    <CreateUpdateBookable
      :bookable="currentBookable"
      :parentItem="parentItem"
      @createBookable="handleBookableCreated"
      @updateBookable="handleBookableUpdated"
      ref="createUpdateBookable"
    />
  </SideSlide>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, provide } from 'vue'
import SideSlide from './sideSlide.vue'
import type { BookableActivity } from '@/interfaces/bookableActivity.interface'
import type { BookableTrip } from '@/interfaces/bookableTrip.interface'
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  HeartCrack,
  Plus,
  Pencil,
  BookCopy,
  Eye,
  Users,
  X,
} from 'lucide-vue-next'
import FilterBookable from '../admin/FilterBookable.vue'
import { formatDate } from '@/utils/converter'
import type { Activity } from '@/interfaces/activity.interface'
import type { Trip } from '@/interfaces/trip.interface'
import CreateUpdateBookable from '../form/CreateUpdateBookable.vue'

const isAddingBookable = ref(false)
const currentBookable = ref<BookableActivity | BookableTrip | null>(null)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const statusFilters = ref<string[]>([])

const isFilterApplied = ref(false)

const isMobileFilterOpen = ref(false)

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const createUpdateBookable = ref<InstanceType<
  typeof CreateUpdateBookable
> | null>(null)

const props = defineProps<{
  bookableItems?: (BookableActivity | BookableTrip)[]
  parentItem?: Activity | Trip
}>()

const bookableItems = ref<(BookableActivity | BookableTrip)[]>([
  ...(props.bookableItems || []),
])

const handleBookableCreated = (
  bookables: BookableActivity[] | BookableTrip[],
) => {
  console.log('Bookables created', bookables)
  bookableItems.value = [...bookableItems.value, ...bookables].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )
  closeBookable()
}

const handleBookableUpdated = (bookable: BookableActivity | BookableTrip) => {
  console.log('Bookable updated', bookable)
  const index = bookableItems.value.findIndex(item => item.id === bookable.id)
  if (index !== -1) {
    bookableItems.value = [
      ...bookableItems.value.slice(0, index),
      bookable,
      ...bookableItems.value.slice(index + 1),
    ]
  }
  closeBookable()
}

const saveBookableEditOrCreate = () => {
  console.log('#bookableViewer trying to save bookable')

  if (createUpdateBookable.value) {
    console.log('calling saveBookable')
    createUpdateBookable.value.saveBookable()
  }
}

const isBookableActivity = (
  item: BookableActivity | BookableTrip,
): item is BookableActivity => {
  return 'activityId' in item
}

const toggleMobileFilter = () => {
  isMobileFilterOpen.value = !isMobileFilterOpen.value
}

// Watch for changes in isMobileFilterOpen to add/remove overflow-hidden class on body
watch(isMobileFilterOpen, newVal => {
  if (newVal) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})

// Helper to format the month
const formatMonth = (date: String) => {
  const newDate = new Date(date.toString())
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' }
  return newDate.toLocaleDateString(undefined, options)
}

// Helper to format the day
const formatDay = (date: String) => {
  const newDate = new Date(date.toString())
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }
  return newDate.toLocaleDateString(undefined, options)
}

// Helper to format the date range
const formatDateRange = (startDate: String, endDate: String) => {
  const newStartDate = new Date(startDate.toString())
  const newEndDate = new Date(endDate.toString())

  const start = newStartDate.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const end = newEndDate.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${start} - ${end}`
}

const currentPeriodTitle = computed(() => {
  if (startDate.value && endDate.value) {
    return `Filtered Period: ${formatMonth(startDate.value.toString())} - ${formatMonth(endDate.value.toString())}`
  } else {
    const currentMonthName = new Date(
      currentYear.value,
      currentMonth.value,
    ).toLocaleString(undefined, { month: 'long' })
    return `${currentMonthName} ${currentYear.value}`
  }
})

const filteredItems = computed(() => {
  if (!isFilterApplied.value) {
    return bookableItems.value
      .filter(item => {
        const itemDate = new Date(item.startDate)
        return (
          itemDate.getMonth() === currentMonth.value &&
          itemDate.getFullYear() === currentYear.value
        )
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
  }

  return bookableItems.value
    .filter(item => {
      const itemDate = new Date(item.startDate)
      const isInRange =
        (!startDate.value || itemDate >= startDate.value) &&
        (!endDate.value || itemDate <= endDate.value)
      const hasStatus =
        !statusFilters.value.length ||
        (item.status && statusFilters.value.includes(item.status))
      return isInRange && hasStatus
    })
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
})

const showPreviousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

const showNextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

const toggleAddBookable = (
  bookable: BookableActivity | BookableTrip | null,
) => {
  currentBookable.value = bookable
  isAddingBookable.value = !isAddingBookable.value
}

const closeBookable = () => {
  isAddingBookable.value = false
}

const emit = defineEmits(['toggleSlide', 'saveBookable'])

// Helper function to check if a new day has started
const isNewDay = (index: number) => {
  if (index === 0) return true
  const currentItemDate = new Date(filteredItems.value[index].startDate)
  const previousItemDate = new Date(filteredItems.value[index - 1].startDate)
  return currentItemDate.getDate() !== previousItemDate.getDate()
}

// Helper function to check if a new month has started
const isNewMonth = (index: number) => {
  if (index === 0) return true
  const currentItemDate = new Date(filteredItems.value[index].startDate)
  const previousItemDate = new Date(filteredItems.value[index - 1].startDate)
  return (
    currentItemDate.getMonth() !== previousItemDate.getMonth() ||
    currentItemDate.getFullYear() !== previousItemDate.getFullYear()
  )
}

interface Filters {
  range: {
    start: Date | null
    end: Date | null
  }
  status: string[]
}

const applyFilters = (filters: Filters) => {
  console.log('Applying filters...')
  console.log('Filters:', filters)

  // lets do some checks for anti bugs
  if (filters.range.start && filters.range.end) {
    if (filters.range.start > filters.range.end) {
      console.error('Start date is after end date')
      return
    }
  }

  // if enddate == startdate return
  if (
    filters.range.start &&
    filters.range.end &&
    filters.range.start.getTime() === filters.range.end.getTime()
  ) {
    console.error('Start date is the same as end date')
    return
  }

  startDate.value = filters.range.start
  endDate.value = filters.range.end

  statusFilters.value = filters.status

  isFilterApplied.value =
    !!filters.range.start || !!filters.range.end || filters.status.length > 0
}

const handleResize = () => {
  if (window.innerWidth >= 768) {
    isMobileFilterOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>
