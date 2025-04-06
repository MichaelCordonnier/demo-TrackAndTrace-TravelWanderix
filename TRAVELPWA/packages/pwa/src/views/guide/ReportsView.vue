<template>
  <div class="bg-white rounded-xl p-6 w-full">
    <h2 class="font-bold text-xl text-gray-700">Reports</h2>
    <p>View and manage reports for your assigned bookable trips.</p>
    <div
      class="w-full flex flex-col lg:flex-row gap-0 mb-2 lg:gap-4 lg:items-center"
    >
      <div class="relative w-max my-4">
        <input
          type="text"
          placeholder="Search"
          class="block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          v-model="searchQuery"
        />
        <Search class="absolute right-3 top-3.5 w-6 h-6 text-gray-400" />
      </div>
      <div class="flex gap-2 items-center">
        <input
          type="date"
          class="block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          v-model="startDate"
        />
        <button
          class="bg-gray-200 text-gray-600 px-4 p-2 border-3 border-gray-200 hover:border-gray-300 block rounded hover:bg-gray-300"
          @click="clearStartDate"
        >
          Clear Start Date
        </button>
      </div>
    </div>
    <div class="w-full rounded-md">
      <div
        v-if="loading"
        class="flex flex-col gap-4 h-[calc(100vh-300px)] w-full overflow-hidden"
      >
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <div
            class="rounded-t-lg p-6 bg-gray-100 border-2 w-full border-gray-100"
          >
            <div class="flex justify-between items-center">
              <div class="w-full sm:w-3/7 md:w-1/4 flex flex-col gap-4">
                <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                <div class="h-4 bg-gray-300 rounded w-full"></div>
                <div class="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div class="w-1/2 h-48 bg-gray-300 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error">Error: {{ error.message }}</div>
      <div v-else>
        <ul
          class="flex flex-col gap-4 h-[calc(100vh-300px)] w-full overflow-hidden overflow-y-scroll"
        >
          <li
            v-if="!filteredBookables.length"
            class="text-gray-500 w-full flex items-center justify-center h-full"
          >
            No bookable trips found.
          </li>
          <li v-for="bookable in filteredBookables" :key="bookable.id">
            <div
              class="rounded-t-lg p-6 bg-gray-100 border-2 w-full border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
            >
              <div
                @click="toggleBookableReports(bookable.id)"
                class="cursor-pointer flex justify-between items-center"
              >
                <div class="w-full sm:w-3/7 md:w-1/4 flex flex-col gap-4">
                  <h2 class="text-lg font-gray-700 font-bold">
                    {{ bookable.trip.name }}
                  </h2>
                  <h2>{{ bookable.trip.description }}</h2>
                  <p class="bg-white p-2 rounded-md w-max px-6">
                    {{ formatDate(bookable.startDate) }} -
                    {{ formatDate(bookable.endDate) }}
                  </p>
                </div>
                <img
                  v-if="bookable.trip.bannerImageUrl"
                  :src="getImageUrl(bookable.trip.bannerImageUrl)"
                  alt="Bookable Banner"
                  class="w-full h-48 object-cover my-2 rounded-md md:w-1/2"
                />
              </div>
            </div>
            <div
              v-if="expandedBookableId === bookable.id"
              class="bg-white border-2 p-6 rounded-b-md"
            >
              <div class="w-full flex justify-between items-center">
                <h3 class="font-bold text-xl text-gray-700 mb-4 mt-4">
                  Reports
                </h3>
                <button
                  class="mt-4 bg-gradient-to-br from-green-400 to-green-600 px-6 hover:scale-102 transition duration-300 hover:shadow-md text-white px-2 py-1 rounded relative"
                  @click="toggleSlide(bookable.assignedGuideId, bookable.id)"
                >
                  Add Report
                </button>
              </div>
              <ul>
                <div
                  v-for="report in bookable.reports"
                  :key="report.id"
                  class="bg-gray-50 border border-gray-200 rounded-md shadow p-4 my-4 transition-all hover:shadow-lg block w-full text-left relative"
                >
                  <button
                    @click="toggleReadReport(report)"
                    class="absolute top-0 left-0 w-full h-full"
                  ></button>
                  <p class="text-lg font-semibold text-gray-800 truncate mb-2">
                    {{ report.title || 'Untitled Report' }}
                  </p>

                  <!-- Report Description -->
                  <p class="text-sm text-gray-600 truncate mb-2">
                    {{ report.description || 'No description available.' }}
                  </p>

                  <!-- Report Date -->
                  <p class="text-xs text-gray-500">
                    {{
                      formatFullDate(report.date.toString()) ||
                      'Date not provided'
                    }}
                  </p>

                  <!-- Action Buttons -->
                  <div class="flex justify-between w-full gap-2 mt-4">
                    <div class="flex gap-2">
                      <button
                        class="bg-yellow-500 text-white text-sm px-4 py-2 rounded-md hover:bg-yellow-600 transition-all z-2"
                        @click="toggleEditForm(report)"
                      >
                        <Pencil class="w-5 h-5" />
                      </button>
                      <button
                        class="bg-red-500 text-white text-sm px-4 py-2 rounded-md hover:bg-red-600 transition-all z-2"
                        @click="confirmDeleteReport(report.id)"
                      >
                        <Trash2Icon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Report Form Modal -->
    <CreateReport
      v-if="isEditingOrCreateReport"
      @toggleSlide="toggleSlide"
      @reportCreated="addReport"
      @reportUpdated="updateReport"
      :updateReport="selectedReport"
      :guideId="currentGuideId || ''"
      :bookableTripId="currentBookableTripId || ''"
    />

    <ConfirmDialog
      v-if="showConfirmDialog"
      message="Are you sure you want to delete this report?"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />

    <ReportsModal
      v-if="isReadingReport && selectedReport"
      @close="toggleReadReport"
      :report="selectedReport"
      :isVisible="isReadingReport"
    />
  </div>
</template>

<script setup lang="ts">
import {
  GET_BOOKABLES_BY_GUIDE_ID,
  DELETE_REPORT_MUTATION,
} from '@/graphql/reports/report.query'
import type { Report } from '@/interfaces/report.interface'
import type { BookableTrip } from '@/interfaces/bookableTrip.interface'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { computed, ref } from 'vue'
import { getImageUrl } from '@/utils/img'
import CreateReport from '@/components/reports/createReport.vue'
import useFirebase from '@/composables/useFirebase'
import { formatDate, formatFullDate } from '@/utils/converter'
import ConfirmDialog from '@/components/reusable/ConfirmDialog.vue'
import ReportsModal from '@/components/reusable/reportsModal.vue'
import { Search } from 'lucide-vue-next'
import { Pencil, Trash2 as Trash2Icon } from 'lucide-vue-next'

const searchQuery = ref('')
const expandedBookableId = ref<string | null>(null)
const isEditingOrCreateReport = ref(false)
const selectedReport = ref<Report | undefined>(undefined)
const currentGuideId = ref<string | null>(null)
const currentBookableTripId = ref<string | null>(null)
const showConfirmDialog = ref(false)
const reportToDelete = ref<string | null>(null)
const isReadingReport = ref(false)

//get uid from firebase
const { firebaseUser } = useFirebase()
const uid = firebaseUser.value?.uid
console.log(uid)

//get all reports from the user
const {
  loading,
  error,
  result,
  refetch: refetchBookables,
} = useQuery(
  GET_BOOKABLES_BY_GUIDE_ID,
  { uid: uid },
  { fetchPolicy: 'cache-and-network' },
)

const { mutate: deleteReportMutation } = useMutation(DELETE_REPORT_MUTATION)

const bookables = computed(
  () => result.value?.userByFirebaseUid?.assignedBookableTrips || [],
)

const toggleEditForm = (report: Report | undefined = undefined) => {
  isEditingOrCreateReport.value = !isEditingOrCreateReport.value
  selectedReport.value = report
}
const filteredBookables = computed(() => {
  return bookables.value.filter((bookable: BookableTrip) => {
    const matchesSearchQuery = bookable.trip?.name
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    const matchesStartDate =
      !startDate.value ||
      new Date(bookable.startDate) >= new Date(startDate.value)

    return matchesSearchQuery && matchesStartDate
  })
})

const startDate = ref<string>('')

const clearStartDate = () => {
  startDate.value = ''
}

const toggleBookableReports = (id: string) => {
  expandedBookableId.value = expandedBookableId.value === id ? null : id
}

const toggleReportForm = (report: Report | undefined = undefined) => {
  isEditingOrCreateReport.value = !isEditingOrCreateReport.value
  selectedReport.value = report
}

const toggleSlide = (guideId: string | null, bookableTripId: string | null) => {
  if (selectedReport.value) {
    selectedReport.value = undefined
  }
  isEditingOrCreateReport.value = !isEditingOrCreateReport.value
  console.log(
    'toggling slide and guideId: ',
    guideId,
    'bookableTripId: ',
    bookableTripId,
  )
  if (isEditingOrCreateReport.value) {
    currentGuideId.value = guideId
    currentBookableTripId.value = bookableTripId
  } else {
    selectedReport.value = undefined
    currentGuideId.value = null
    currentBookableTripId.value = null
  }
}

const toggleReadReport = (report: Report | undefined = undefined) => {
  isReadingReport.value = !isReadingReport.value
  if (report) {
    selectedReport.value = report
  }
}

const addReport = async (newReport: Report) => {
  const updatedBookables = bookables.value.map((bookable: BookableTrip) => {
    if (bookable.id === newReport.bookableTripId) {
      return {
        ...bookable,
        reports: [...bookable.reports, newReport],
      }
    }
    return bookable
  })
  result.value = {
    ...result.value,
    userByFirebaseUid: {
      ...result.value.userByFirebaseUid,
      assignedBookableTrips: updatedBookables,
    },
  }
  await refetchBookables()
}

const deleteReport = async (id: string) => {
  try {
    await deleteReportMutation({ id })
    console.log('Report deleted')

    // remove report from bookable.reports
    const updatedBookables = bookables.value.map((bookable: BookableTrip) => {
      return {
        ...bookable,
        reports: bookable.reports.filter((report: Report) => report.id !== id),
      }
    })
    result.value = {
      ...result.value,
      userByFirebaseUid: {
        ...result.value.userByFirebaseUid,
        assignedBookableTrips: updatedBookables,
      },
    }
  } catch (error) {
    console.error('Error deleting report:', error)
  }
}

const confirmDeleteReport = (id: string) => {
  reportToDelete.value = id
  showConfirmDialog.value = true
}

const handleConfirmDelete = () => {
  if (reportToDelete.value) {
    deleteReport(reportToDelete.value)
    reportToDelete.value = null
    showConfirmDialog.value = false
  }
}

const handleCancelDelete = () => {
  reportToDelete.value = null
  showConfirmDialog.value = false
}

const updateReport = (updatedReport: Report) => {
  const updatedBookables = bookables.value.map((bookable: BookableTrip) => {
    if (bookable.id === updatedReport.bookableTripId) {
      const index = bookable.reports.findIndex(
        (report: Report) => report.id === updatedReport.id,
      )
      if (index !== -1) {
        return {
          ...bookable,
          reports: [
            ...bookable.reports.slice(0, index),
            updatedReport,
            ...bookable.reports.slice(index + 1),
          ],
        }
      }
    }
    return bookable
  })
  result.value = {
    ...result.value,
    userByFirebaseUid: {
      ...result.value.userByFirebaseUid,
      assignedBookableTrips: updatedBookables,
    },
  }
}
</script>
