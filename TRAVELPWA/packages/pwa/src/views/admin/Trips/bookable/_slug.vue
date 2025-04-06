<template>
  <div class="bg-white rounded-xl p-6 h-max">
    <div
      @click="goBack"
      class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max"
    >
      <ArrowLeft class="h-8 w-8 text-gray-800" />
      <p class="p-2 text-xl">Back</p>
    </div>
    <div v-if="loading">
      <div class="animate-pulse mt-6">
        <div class="flex flex-col lg:flex-row gap-4 mt-4">
          <!-- Left Panel Skeleton -->
          <div class="bg-gray-100 p-4 rounded-md w-full lg:w-1/4">
            <div class="w-full h-200px bg-gray-300 rounded-md mt-2"></div>
            <div class="bg-white p-4 mt-4 rounded-md">
              <div class="h-5 w-1/3 bg-gray-300 rounded-md"></div>
              <div class="h-6 w-2/3 bg-gray-300 rounded-md mt-2"></div>
              <div class="h-5 w-1/2 bg-gray-300 rounded-md mt-4"></div>
              <div class="p-4 bg-gray-100 border-rd-md flex flex-col gap-2">
                <div class="flex items-center justify-between w-full">
                  <div class="h-5 w-1/4 bg-gray-300 rounded-md"></div>
                  <div class="h-5 w-20 bg-gray-300 rounded-md"></div>
                </div>
                <div class="flex items-center justify-between w-full">
                  <div class="h-5 w-1/4 bg-gray-300 rounded-md"></div>
                  <div class="h-5 w-20 bg-gray-300 rounded-md"></div>
                </div>
              </div>
              <div
                class="block w-full text-center mt-4 p-2 rounded-md bg-gray-300"
              ></div>
            </div>
          </div>

          <!-- Right Panel Skeleton -->
          <div class="flex flex-col bg-gray-100 w-full p-4 rounded-md">
            <div class="h-5 w-1/4 bg-gray-300 rounded-md mt-4"></div>
            <div
              class="bg-white rounded-md p-4 w-full mt-4 h-[calc(100vh-300px)] overflow-hidden overflow-y-scroll"
            >
              <div class="flex flex-col gap-4">
                <!-- Skeleton for each booking item -->
                <div class="group mb-2 bg-gray-100 rounded-md p-4">
                  <div
                    class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div>
                        <div class="h-4 w-20 bg-gray-300 rounded-md"></div>
                        <div class="h-4 w-36 bg-gray-300 rounded-md mt-2"></div>
                      </div>
                    </div>
                    <div
                      class="flex flex-col w-full lg:w-max sm:flex-row gap-2 sm:gap-10 my-2 mt-4 lg:mt-0 lg:my-0"
                    >
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-24 bg-gray-300 rounded-md"></div>
                      </div>
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-16 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Repeat skeleton items as needed -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div class="flex flex-col lg:flex-row gap-4 mt-4">
        <div
          class="bg-gray-100 p-4 rounded-md w-full lg:w-1/4 h-max lg:h-[calc(100vh-195px)]"
        >
          <div class="relative">
            <img
              :src="currentBookableTrip?.trip?.headerImageUrl"
              alt=""
              class="w-full h-200px border-rd-md mt-2 object-cover"
            />
            <div
              class="absolute bottom-2 right-2 bg-white p-2 border-1 border-gray-200 text-center w-max rounded-md"
            >
              {{ currentBookableTrip?.bookableSettings.price }} €
            </div>
          </div>
          <div class="bg-white p-4 mt-4 rounded-md">
            <h1 class="font-medium text-gray-500">Booking</h1>
            <h1 class="font-bold text-lg text-gray-700">
              {{ currentBookableTrip?.trip?.name }}
            </h1>

            <div class="p-4 bg-gray-100 border-rd-md flex flex-col gap-2 mt-4">
              <div class="flex flex-col items-start justify-between w-full">
                <p class="font-semibold">Start date:</p>
                <p class="bg-white p-2 rounded-md mt-2 w-30 text-center">
                  {{
                    currentBookableTrip?.startDate
                      ? formatDate(currentBookableTrip.startDate.toString())
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="flex flex-col items-start justify-between w-full">
                <p class="font-semibold">End date:</p>
                <p class="bg-white p-2 rounded-md mt-2 w-30 text-center">
                  {{
                    currentBookableTrip?.endDate
                      ? formatDate(currentBookableTrip.endDate.toString())
                      : 'N/A'
                  }}
                </p>
              </div>
            </div>
            <div
              :class="{
                'bg-green-200': currentBookableTrip?.status === 'OPEN',
                'bg-red-200': currentBookableTrip?.status === 'CLOSED',
                'bg-yellow-200': currentBookableTrip?.status === 'FULL',
                'bg-gray-200':
                  currentBookableTrip?.status === 'FINISHED' ||
                  currentBookableTrip?.status === 'CANCELLED',
              }"
              class="block w-full text-center mt-4 p-2 rounded-md text-white font-medium mb-2"
            >
              <p
                v-if="currentBookableTrip?.status === 'OPEN'"
                class="text-green-700"
              >
                Open
              </p>
              <p
                v-else-if="currentBookableTrip?.status === 'CLOSED'"
                class="text-red-700"
              >
                Closed
              </p>
              <p
                v-else-if="currentBookableTrip?.status === 'FULL'"
                class="text-amber-600"
              >
                Full
              </p>
              <p
                v-else-if="currentBookableTrip?.status === 'FINISHED'"
                class="text-gray-700"
              >
                Finished
              </p>
              <p
                v-else-if="currentBookableTrip?.status === 'CANCELLED'"
                class="text-gray-700"
              >
                Cancelled
              </p>
            </div>
            <div
              class="bg-gray-100 p-4 flex flex-col border-rd-md items-center text-center"
            >
              <img
                v-if="currentBookableTrip?.assignedGuide?.imageUrl"
                :src="currentBookableTrip?.assignedGuide?.imageUrl"
                alt="Guide Image"
                class="w-12 h-12 rounded-full object-cover aspect-ratio-square border-2 border-white"
              /><img
                v-else
                src="/lama.svg"
                alt="User Avatar"
                class="w-12 h-12 rounded-full object-fit border border-red aspect-ratio-square border-2 border-white"
              />
              <div class="text-gray-800">
                <p class="font-bold">
                  {{ currentBookableTrip?.assignedGuide?.username }}
                </p>
                <small>{{ currentBookableTrip?.assignedGuide?.email }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col bg-gray-100 w-full p-4 rounded-md">
          <div class="flex justify-between items-center w-full">
            <p class="text-lg font-semibold mt-4">Bookings</p>
            <button
              v-if="!isBookingDisabled"
              @click="openModal"
              class="bg-gradient-to-br from-amber-300 to-orange-400 p-x-4 p-y-2 border-rd-md text-white ml-auto hover:scale-105 transition-all duration-300"
              :disabled="isBookingDisabled"
            >
              Add Booking
            </button>
          </div>
          <div
            class="bg-white rounded-md p-4 w-full mt-4 h-[calc(100vh-290px)] overflow-hidden overflow-y-scroll"
          >
            <div v-if="currentBookableTrip?.bookings?.length">
              <div
                v-for="booking in currentBookableTrip?.bookings"
                :key="booking.id"
                class="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b border-gray-200 pb-4"
              >
                <!-- Booking Details -->
                <div
                  class="group inline-block p-4 w-full bg-gray-50 hover:shadow-md border rounded-md transition-all duration-300"
                >
                  <RouterLink
                    :to="`/admin/booking/${booking.id}`"
                    class="block"
                  >
                    <div
                      class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                    >
                      <!-- User Info -->
                      <div class="flex items-center gap-4">
                        <img
                          v-if="booking.user?.imageUrl"
                          :src="booking.user.imageUrl"
                          alt="User Image"
                          class="w-12 h-12 rounded-full object-cover"
                        />
                        <div
                          v-else
                          class="w-12 h-12 border-2 border-gray-200 rounded-full flex justify-center items-center bg-white"
                        >
                          <img
                            src="/lama.svg"
                            alt="Default Profile"
                            class="object-fit w-8 h-8"
                          />
                        </div>
                        <div>
                          <p class="font-semibold text-gray-700">
                            {{ booking.user?.username || 'User' }}
                          </p>
                          <p class="text-gray-500">
                            {{ booking.user?.email || 'No email available' }}
                          </p>
                        </div>
                      </div>

                      <!-- Booking Details -->
                      <div
                        class="flex flex-col w-full lg:w-max sm:flex-row gap-2 sm:gap-10 my-2 mt-4 lg:mt-0 lg:my-0"
                      >
                        <div
                          class="flex gap-2 justify-between w-full lg:w-max items-center"
                        >
                          <p class="font-semibold text-gray-700">Price Paid:</p>
                          <p
                            class="bg-white p-2 rounded-md px-4 font-medium text-gray-800"
                          >
                            ${{ booking.totalPrice }}
                          </p>
                        </div>
                        <div
                          class="flex gap-2 justify-between w-full lg:w-max items-center"
                        >
                          <p class="font-semibold text-gray-700">People:</p>
                          <p
                            class="bg-white p-2 rounded-md px-4 font-medium text-gray-800"
                          >
                            {{ booking.how_many }}
                          </p>
                        </div>
                      </div>

                      <!-- Icon -->
                      <div>
                        <ChevronRight
                          class="hidden lg:block h-8 w-8 text-gray-800 -translate-x-2 group-hover:translate-x-0 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </RouterLink>
                </div>

                <!-- Delete Button -->
                <button
                  @click="confirmDeleteBooking(booking.id)"
                  class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-300 hidden md:block"
                >
                  <Trash2Icon class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div
              v-else
              class="flex-grow h-full w-full flex flex-col gap-2 items-center justify-center text-gray-700 opacity-70 border-rd-md text-center"
            >
              <p>No Bookings for this trip yet</p>
              <HeartCrack />
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg mt-4">
        <div class="flex w-full justify-between items-center">
          <div>
            <h2 class="font-bold text-xl text-gray-700 mb-2 mt-4">Reports</h2>
            <p>
              If their have been any incidents or problems a assigned guide will
              post the reportings here.
            </p>
          </div>
          <button
            class="p-2 px-10 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-md hover:scale-105 hover:shadow-lg cursor-pointer duration-300 w-fit h-fit"
            @click="toggleReportForm()"
          >
            Add Report
          </button>
        </div>

        <div
          v-if="currentBookableTrip?.reports?.length === 0"
          class="bg-white p-4 rounded-md mt-4"
        >
          <p class="text-gray-500">No reports yet</p>
        </div>
        <div
          v-if="(currentBookableTrip?.reports?.length ?? 0) > 0"
          class="bg-white p-4 rounded-md mt-4"
        >
          <div
            v-for="report in currentBookableTrip?.reports"
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
                formatFullDate(report.date.toString()) || 'Date not provided'
              }}
            </p>

            <!-- Action Buttons -->
            <div class="flex justify-between w-full gap-2 mt-4">
              <div class="flex gap-2">
                <button
                  class="bg-yellow-500 text-white text-sm px-4 py-2 rounded-md hover:bg-yellow-600 transition-all z-2"
                  @click="toggleReportForm(report)"
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
        </div>
      </div>
    </div>
  </div>
  <!-- Modal -->
  <div
    v-if="isModalOpen && currentBookableTrip"
    class="fixed top-0 left-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center z-999"
  >
    <div class="bg-white p-6 rounded-lg w-1/1 md:w-1/2 overflow-hidden">
      <div
        class="flex items-center w-full justify-between text-gray-800 border-b pb-3 mb-4"
      >
        <div>
          <h2 class="text-2xl">
            Booking for {{ currentBookableTrip?.trip?.name }}
          </h2>
          <small
            >Date:
            {{ formatFullDate(currentBookableTrip.startDate || '') }}</small
          >
        </div>

        <button
          @click="closeModal"
          class="w-10 h-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110 block"
          aria-label="Close modal"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <form @submit.prevent="createBooking">
        <!-- Search input for users (name and email) -->

        <div class="bg-gray-200 border-rd-md p-4">
          <p class="mb-2 text-gray-800">New booking for User</p>

          <div class="mb-4">
            <SearchSelect
              v-model:searchTerm="searchQuery"
              :filteredItems="mappedFilteredUsers"
              placeholder="Search by email"
              listLabel="User List"
              @selectItem="handleUserChange"
            />
          </div>
        </div>

        <!-- Extra persons input -->
        <h2 class="text-gray-800 mt-4">Extra persons</h2>
        <small class="text-gray-800"
          >Only necessary if the client wants a companion with him.</small
        >
        <div class="h-30vh mt-4 flex-col p-2 overflow-y-scroll">
          <div
            class="mb-4 flex items-center bg-gray-100 border-rd-md h-fit"
            v-for="(person, index) in newBooking.extraPersons"
            :key="index"
          >
            <div class="w-full border border-gray-200 p-2 border-rd-md">
              <div class="flex justify-between w-full items-center mb-2">
                <label class="block">Companion {{ index + 1 }}</label>
                <button
                  @click="removeExtraPerson(index)"
                  class="w-12 h-12 object-fit border-2 border-gray-200 rounded-full flex justify-center items-center bg-white aspect-ratio-square"
                  title="Remove Extra Person"
                >
                  <Trash2Icon />
                </button>
              </div>

              <InputField
                v-model="person.name"
                type="text"
                class="border p-2 w-full mb-2 border-rd-md"
                placeholder="Name"
                required
              />
              <InputField
                v-model="person.email"
                type="email"
                class="border p-2 w-full mb-2 border-rd-md"
                placeholder="Email"
                required
              />
            </div>
          </div>
        </div>
        <button
          @click="addExtraPerson"
          class="bg-gray-500 p-x-4 p-y-2 text-white hover:scale-105 transition-all duration-300 text-white py-2 px-4 rounded mb-4 mt-2"
        >
          Add Extra Person
        </button>

        <!-- total price based on data.bookableSettings.price * person -->
        <p class="font-bold">Price: {{ endPrice || '0' }}</p>

        <div class="flex justify-end">
          <button
            class="bg-gradient-to-br from-green-400 to-green-600 p-x-4 p-y-2 text-white hover:scale-105 transition-all duration-300 text-white py-2 px-4 rounded mb-4 mt-2"
          >
            Create Booking
          </button>
        </div>
      </form>
    </div>
  </div>
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
    @confirm="handleConfirmDeleteDialog"
    @cancel="handleCancelDeleteDialog"
  />

  <ConfirmDialog
    v-if="showConfirmBooking"
    message="Are you sure you want to delete this booking?"
    @confirm="handleConfirmDeleteBooking"
    @cancel="handleCancelDeleteBooking"
  />

  <ReportsModal
    v-if="isReadingReport && selectedReport"
    @close="toggleReadReport"
    :report="selectedReport"
    :isVisible="isReadingReport"
  />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { GET_BOOKABLE_TRIP_BY_ID } from '@/graphql/trip/bookable.trip.admin.query'
import { DELETE_BOOKING } from '@/graphql/booking/booking.admin.query'
import type { BookableTrip } from '@/interfaces/bookableTrip.interface'
import { ref, computed, watch } from 'vue'
import { formatDateWithoutHours, formatFullDate } from '@/utils/converter'
import router from '@/router'
import type { CreateBookingInput } from '@/interfaces/booking.create.interface'
import { GET_ALL_USERS } from '@/graphql/user/user.query'
import type { User } from '@/interfaces/user.interface'
import type { Booking, ExtraPerson } from '@/interfaces/booking.interface'
import type { Trip } from '@/interfaces/trip.interface'
// import { GET_TRIP_BY_ID } from '@/graphql/trip/trips.admin.query'
import { CREATE_BOOKING } from '@/graphql/booking/booking.admin.query'
import CreateReport from '@/components/reports/createReport.vue'
import ConfirmDialog from '@/components/reusable/ConfirmDialog.vue'
import { DELETE_REPORT_MUTATION } from '@/graphql/reports/report.query'
import type { Report } from '@/interfaces/report.interface'
import useCustomUser from '@/composables/useCustomUser'
import { formatDate } from '@/utils/converter'
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  HeartCrack,
  Pencil,
  Trash2Icon,
  X,
} from 'lucide-vue-next'
import SearchSelect from '@/components/form/SearchSelect.vue'
import InputField from '@/components/form/inputField.vue'
import ReportsModal from '@/components/reusable/reportsModal.vue'

const { customUser } = useCustomUser()

const isBookingDisabled = computed(() => {
  if (!currentBookableTrip.value) return true

  const {
    bookableSettings: { places },
    status,
  } = currentBookableTrip.value

  if (
    (status === 'CLOSED' && customUser.value?.role != 'ADMIN') ||
    status === 'CANCELLED' ||
    status === 'FINISHED'
  )
    return true

  return places <= 0
})

const route = useRoute()
const bookableToFind = route.params.slug as string

const searchQuery = ref('')
const filteredUsers = ref<User[]>([])
const selectedUser = ref<string | null>(null)
const isReadingReport = ref(false)

const { mutate: createBookingMutation } = useMutation(CREATE_BOOKING)

const currentBookableTrip = ref<BookableTrip | null>(null)

interface QueryResult {
  bookableTrip: BookableTrip
}

interface UsersQueryResult {
  allUsers: User[]
}

// interface TripQueryResult {
//   trip: Trip
// }

const {
  loading,
  error,
  result,
  refetch: refetchBookable,
} = useQuery<QueryResult>(
  GET_BOOKABLE_TRIP_BY_ID,
  {
    id: bookableToFind,
  },
  {
    fetchPolicy: 'cache-and-network',
  },
)

// Local state for bookings and available places anders krijg je een error dat je zogezegd je query niet mag aanpassen ofz daarom maken we een kopie
const bookings = ref<BookableTrip['bookings']>([])
const availablePlaces = ref(0)
const maxPersons = ref(0)
const { result: usersResult, loading: loadingUsers } =
  useQuery<UsersQueryResult>(GET_ALL_USERS, null, {
    fetchPolicy: 'cache-and-network',
  })

const trip = ref<Trip | null>(null)

const mappedFilteredUsers = computed(() =>
  filteredUsers.value
    .filter(user =>
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    .map(user => ({
      id: user.uid,
      name: user.email,
    })),
)

// // // the result
// watch(usersResult, usersResult => {
//   //('Result:', usersResult)
// })

// Watch the result for changes and update local state
watch(
  result,
  newResult => {
    const bookableTrip = newResult?.bookableTrip as BookableTrip

    if (bookableTrip) {
      currentBookableTrip.value = bookableTrip
    }
  },
  { immediate: true },
)

watch(
  usersResult,
  usersResult => {
    //('Users:', usersResult?.allUsers)
    if (usersResult?.allUsers) {
      //('Users are loaded')
      filteredUsers.value = usersResult.allUsers
    }
  },
  { immediate: true },
)

const goBack = () => {
  router.go(-1)
}

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Computed property for data
// const data = computed(() => ({
//   id: bookableToFind,
//   startDate: result.value?.bookableTrip.startDate,
//   endDate: result.value?.bookableTrip.endDate,
//   bookableSettings: {
//     places: availablePlaces.value,
//     max_persons: maxPersons.value,
//   },
//   status: result.value?.bookableTrip.status,
//   bookings: bookings.value,
// }))

const statusClass = computed(() => {
  switch (currentBookableTrip.value?.status) {
    case 'open':
      return 'bg-green-500'
    case 'closed':
      return 'bg-red-500'
    case 'canceled':
      return 'bg-yellow-500'
    default:
      return ''
  }
})

const newBooking = ref<CreateBookingInput>({
  type: 'trip',
  fireAuthId: '',
  bookable_trip_id: bookableToFind,
  extraPersons: [],
  booking_trip_id: null,
  bookable_activity_id: null,
})

const endPrice = computed(() => {
  const pricePerPerson = result.value?.bookableTrip.bookableSettings.price || 0

  const extraPersonsCount = newBooking.value.extraPersons?.length || 0

  const totalPersons = selectedUser.value
    ? extraPersonsCount + 1
    : extraPersonsCount

  return pricePerPerson * totalPersons
})

const removeExtraPerson = (index: number) => {
  if (newBooking.value.extraPersons) {
    newBooking.value.extraPersons.splice(index, 1)
  }
}

const toggleReadReport = (report: Report | undefined = undefined) => {
  isReadingReport.value = !isReadingReport.value

  if (report) {
    selectedReport.value = report
  }
}

const filterUsers = () => {
  const query = searchQuery.value.toLowerCase()

  // Check if usersResult and users are loaded
  if (!usersResult.value || !usersResult.value.allUsers) {
    console.warn('Users data is not available yet.')
    filteredUsers.value = [] // Set an empty array to avoid further errors
    return
  }

  // Proceed with filtering only if users are defined
  filteredUsers.value = usersResult.value.allUsers.filter((user: User) => {
    return user.email.toLowerCase().includes(query)
  })
}

const handleUserChange = (item: { id: string; name: string }) => {
  const user = filteredUsers.value.find(user => user.uid === item.id)
  if (user) {
    newBooking.value.fireAuthId = user.uid
    selectedUser.value = user.uid
  }
}

const addExtraPerson = () => {
  if (!newBooking.value.extraPersons) {
    newBooking.value.extraPersons = []
  }
  newBooking.value.extraPersons.push({ name: '', email: '' } as ExtraPerson)
}

const isModalOpen = ref(false)

const createBooking = async () => {
  if (!selectedUser.value) {
    alert('Please select a user before creating a booking.')
    return
  }
  try {
    const response = await createBookingMutation({
      createBookingInput: newBooking.value as CreateBookingInput,
    })

    const newBookingData = response?.data.createBooking as Booking

    if (!newBookingData) {
      alert('Failed to create booking. Please try again.')
      return
    }

    const user = filteredUsers.value.find(
      user => user.uid === selectedUser.value,
    )

    if (currentBookableTrip.value && user) {
      currentBookableTrip.value = {
        ...currentBookableTrip.value,
        bookings: [
          ...currentBookableTrip.value.bookings,
          {
            ...newBookingData,
          },
        ],
        bookableSettings: {
          ...currentBookableTrip.value.bookableSettings,
          places:
            currentBookableTrip.value.bookableSettings.places -
            newBookingData.how_many,
        },
      }
    }

    closeModal()
    newBooking.value.extraPersons = []
    selectedUser.value = null
    searchQuery.value = ''
  } catch (err) {
    console.error('Error creating booking:', err)
    alert('Failed to create booking. Please try again.')
  }
}

// Mutation for deleting booking
const { mutate: deleteBookingMutation } = useMutation(DELETE_BOOKING)

const deleteBooking = async (bookingId: string) => {
  try {
    await deleteBookingMutation({ id: bookingId })

    // Remove the booking from the currentBookableTrip's bookings
    if (currentBookableTrip.value) {
      currentBookableTrip.value = {
        ...currentBookableTrip.value,
        bookings: currentBookableTrip.value.bookings.filter(
          booking => booking.id !== bookingId,
        ),
      }
    }
  } catch (err) {
    console.error('Error deleting booking:', err)
  }
}

//reports

const isEditingOrCreateReport = ref(false)
const selectedReport = ref<Report | undefined>(undefined)
const currentGuideId = ref<string | null>(null)
const currentBookableTripId = ref<string | null>(null)
const showConfirmDialog = ref(false)
const reportToDelete = ref<string | null>(null)

const { mutate: deleteReportMutation } = useMutation(DELETE_REPORT_MUTATION)

const toggleReportForm = (report: Report | undefined = undefined) => {
  isEditingOrCreateReport.value = !isEditingOrCreateReport.value
  selectedReport.value = report
  if (!report) {
    currentGuideId.value = currentBookableTrip.value?.assignedGuide.id || null
    currentBookableTripId.value = currentBookableTrip.value?.id || null
  }
}

const toggleSlide = (guideId: string | null, bookableTripId: string | null) => {
  isEditingOrCreateReport.value = !isEditingOrCreateReport.value
  if (isEditingOrCreateReport.value) {
    currentGuideId.value = guideId
    currentBookableTripId.value = bookableTripId
  } else {
    selectedReport.value = undefined
    currentGuideId.value = null
    currentBookableTripId.value = null
  }
}

watch(isModalOpen, value => {
  console.log('Is editing trying to disable scroll...')
  if (value) {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    document.body.style.overflow = ''
  }
})

const addReport = async (newReport: Report) => {
  if (currentBookableTrip.value) {
    currentBookableTrip.value = {
      ...currentBookableTrip.value,
      reports: [
        ...currentBookableTrip.value.reports,
        { ...newReport, id: newReport.id },
      ],
    }
  }
  await refetchBookable()
}

const updateReport = (updatedReport: Report) => {
  if (currentBookableTrip.value) {
    currentBookableTrip.value = {
      ...currentBookableTrip.value,
      reports: currentBookableTrip.value.reports.map((report: Report) =>
        report.id === updatedReport.id ? updatedReport : report,
      ),
    }
  }
}

const deleteReport = async (id: string) => {
  try {
    await deleteReportMutation({ id })
    if (currentBookableTrip.value) {
      currentBookableTrip.value = {
        ...currentBookableTrip.value,
        reports: currentBookableTrip.value.reports.filter(
          (report: Report) => report.id !== id,
        ),
      }
    }
  } catch (error) {
    console.error('Error deleting report:', error)
  }
}

const confirmDeleteReport = (id: string) => {
  reportToDelete.value = id
  showConfirmDialog.value = true
}

const handleConfirmDeleteDialog = () => {
  if (reportToDelete.value) {
    deleteReport(reportToDelete.value)
    reportToDelete.value = null
    showConfirmDialog.value = false
  }
}

const handleCancelDeleteDialog = () => {
  reportToDelete.value = null
  showConfirmDialog.value = false
}

const showConfirmBooking = ref(false)
const bookingToDelete = ref<string | null>(null)

const confirmDeleteBooking = (id: string) => {
  bookingToDelete.value = id
  showConfirmBooking.value = true
  console.log('show')
}

const handleConfirmDeleteBooking = async () => {
  if (bookingToDelete.value) {
    await deleteBooking(bookingToDelete.value)
    bookingToDelete.value = null
    showConfirmBooking.value = false
  }
}

const handleCancelDeleteBooking = () => {
  bookingToDelete.value = null
  showConfirmBooking.value = false
}
</script>
