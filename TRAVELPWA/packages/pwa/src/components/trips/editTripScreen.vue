<template>
  <div
    class="edit-trip-screen p-4 bg-gray-100 rounded-md overflow-scroll h-100vh"
    v-if="customUser"
  >
    <div class="bg-white p-4 rounded-md">
      <div class="flex justify-between">
        <div class="flex items-center justify-start gap-2">
          <h2 class="p-2 border-2 text-start px-4 rounded-md">
            <p class="text-lg font-medium">
              {{ formatDay(editingDay.date?.toString() || '') }}
            </p>
            <p class="text-gray-500">
              {{ formatFullDate(editingDay.date?.toString() || '') }}
            </p>
          </h2>
        </div>
        <button
          @click="closeEdit"
          class="group h-10 w-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
          aria-label="Close"
        >
          <X class="h-6 w-6" />
        </button>
      </div>
      <div>
        <div
          class="bg-gray-100 border-rd-md p-4 mt-4"
          v-show="extraPersons.length > 0"
        >
          <button @click="toggleDropdown" class="flex items-center gap-2">
            <span class="font-semibold">{{ t('registered_companions') }}</span>
            <ChevronUp v-if="isDropdownOpen" class="h-6 w-6" />
            <ChevronDown v-else class="h-6 w-6" />
          </button>
          <div v-show="isDropdownOpen">
            <ul class="flex gap-4 flex-wrap justify-start mt-2">
              <li
                v-for="(extraPerson, index) in extraPersons"
                :key="index"
                class="border border-gray-200 p-4 bg-white shadow-md mb-2 rounded-lg relative"
              >
                <div class="flex gap-2 items-center">
                  <div
                    class="bg-white w-8 h-8 grid place-items-center rounded-full shadow-lg border-1 border-gray-200"
                  >
                    <p class="text-gray-500 font-bold">{{ index + 1 }}</p>
                  </div>
                  <div class="px-4">
                    <h3 class="font-bold">{{ extraPerson.name }}</h3>
                    <h3 class="">{{ extraPerson.email }}</h3>
                  </div>
                </div>
              </li>
            </ul>
            <small>{{ t('activity_includes_companions') }}</small>
          </div>
        </div>
      </div>
      <div class="selected-activities mb-4 bg-gray-100 p-4 rounded-md mt-4">
        <h3 class="font-bold mb-2 text-lg">{{ t('planned_activities') }}</h3>
        <ul>
          <div v-if="editingDay.activities?.length === 0 && !isEditing">
            <p>{{ t('no_activities') }}</p>
          </div>
          <div v-else>
            <div v-if="!isEditing">
              <!-- classic zicht bij het binnenkomen of verlaten van edit mode -->
              <li
                v-for="activity in editingDay?.activities"
                :key="activity.id"
                class="activity-item flex flex-col md:flex-row w-full gap-2"
              >
                <div
                  class="flex flex-col md:flex-row gap-2 w-full border-b-2 border-gray-200 pb-2"
                >
                  <div>
                    <div
                      class="group flex flex-col md:flex-row gap-2 cursor-pointer"
                      @click="
                        activity.bookableActivity &&
                          openActivityDetails(activity)
                      "
                    >
                      <div
                        class="group-hover:bg-gray-300 relative activity-item w-full flex justify-between border bg-gray-200 rounded-md p-4"
                      >
                        <div class="w-full">
                          <p class="font-semibold text-gray-700 text-lg">
                            {{ activity.activity?.name }}
                          </p>
                          <p class="mt-2 w-3/4">
                            {{ activity?.activity?.description }}
                          </p>
                          <p class="bg-white p-2 rounded-md w-max px-4 mt-2">
                            {{ getHourAndMinutes(activity.startDate) }} -
                            {{ getHourAndMinutes(activity.endDate) }}
                          </p>
                        </div>
                      </div>
                      <div
                        class="w-full md:w-1/2 relative rounded-lg flex items-stretch"
                      >
                        <img
                          v-if="activity.activity?.headerImageUrl"
                          :src="activity.activity.headerImageUrl"
                          alt="activity image"
                          class="object-cover w-full h-full rounded-lg"
                        />
                        <p
                          class="font-semibold absolute bottom-2 right-2 p-2 text-center bg-white rounded-md"
                        >
                          {{ activity.totalPrice }} €
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    class="flex justify-center items-center md:my-6 bg-gradient-to-br from-red-500 to-red-700 p-2 px-4 rounded-md hover:scale-102 transform duration-300 hover:shadow-lg"
                    @click="removeBooking(activity.id)"
                  >
                    <X class="h-10 w-10 font-bold text-white" />
                  </button>
                </div>
              </li>
            </div>
            <div v-else class="bg-amber-200 p-2 rounded-md">
              <!-- EDITING MENU -->

              <p class="bg-amber p-4 text-lg font-semibold rounded-md mb-2">
                {{ t('editing') }} -
                {{ formatFullDate(editingDay.date?.toString() || '') }}
              </p>
              <p class="text-gray-500"></p>
              <!-- DEZE ZIJN BOOKABLES DEZE GAAN WE BOOKEN, VISUEEL WILLEN WE GEEN VERSCHIL OF JUIST WEL??-->
              <li
                v-for="bookableActivity in localBookableActivity"
                :key="bookableActivity.id"
                class="activity-item flex justify-between items-center border rounded-md border-2 bg-white border-amber-500 bg-opacity-70 mb-2 p-4"
              >
                <div class="flex flex-row items-center">
                  <div class="h-full flex-col flex flex-col justify-between">
                    <p class="pb-1 border-b-1 border-amber-200">
                      {{
                        getHourAndMinutes(
                          bookableActivity.startDate?.toString() || '',
                        )
                      }}
                    </p>
                    <p class="pt-1 border-t-1 border-amber-200">
                      {{
                        getHourAndMinutes(
                          bookableActivity.endDate?.toString() || '',
                        )
                      }}
                    </p>
                  </div>
                </div>

                <p class="font-semibold text-amber-500">
                  {{ bookableActivity.name }}
                </p>
                <p
                  class="p-2 px-4 w-max bg-amber-100 rounded-md font-semibold border-2 border-amber-500 text-center text-amber-500 h-max"
                >
                  {{ t('new') }}
                </p>

                <button
                  class="bg-gradient-to-br from-red-500 to-red-700 hover:scale-102 hover:shadow-md duration-300 p-2 rounded-md"
                  @click="removeBookableActivityV2(bookableActivity)"
                >
                  <X class="h-6 w-6 font-bold text-white" />
                </button>
              </li>

              <!-- DIT ZIJN BOOKINGEN DEZE HEBBEN WE EFFECTIEF GEBOEKT -->
              <li
                v-for="booking in localBookingsActvity"
                :key="booking.id"
                class="activity-item flex justify-between rounded-md bg-white p-4"
              >
                <div class="flex flex-row items-center justify-between w-full">
                  <div class="h-full flex-col flex flex-col justify-between">
                    <p class="pb-1 border-b-1 border-gray-200">
                      {{
                        getHourAndMinutes(booking.startDate?.toString() || '')
                      }}
                    </p>
                    <p class="pt-1 border-t-1 border-gray-200">
                      {{ getHourAndMinutes(booking.endDate?.toString() || '') }}
                    </p>
                  </div>
                  <p class="font-semibold">{{ booking.activity?.name }}</p>
                  <p
                    class="p-2 px-4 w-max bg-white rounded-md font-semibold border-2 text-center"
                  >
                    {{ t('booked') }}
                  </p>
                </div>
              </li>

              <div
                class="bg-amber-300 p-4 rounded-md w-1/2 md:w-2/3 lg:w-1/3 mt-4"
              >
                <div
                  v-if="newPrice !== props.tripPrice"
                  class="w-full justify-between flex items-center gap-2 text-amber-700"
                >
                  <p>{{ t('old_price') }}:</p>
                  <p class="bg-white p-2 text-center rounded-md text-gray-700">
                    {{ props.tripPrice }} €
                  </p>
                </div>
                <div
                  v-if="newPrice !== props.tripPrice"
                  class="w-full justify-between mt-2 flex items-center gap-2 font-bold text-amber-700"
                >
                  <p>{{ t('new_price') }}:</p>
                  <p class="bg-white p-2 text-center rounded-md text-gray-700">
                    {{ newPrice }} €
                  </p>
                </div>
              </div>
              <div class="flex gap-2 w-full bg-amber rounded-md p-2 mt-4">
                <button
                  class="bg-gradient-to-br from-green-500 to-green-700 hover:scale-102 hover:shadow-md duration-300 p-2 rounded-md text-white font-semibold px-4"
                  @click="saveEditing"
                >
                  {{ t('save_edit') }}
                </button>
                <button
                  class="bg-gradient-to-br from-red-500 to-red-700 hover:scale-102 hover:shadow-md duration-300 p-2 rounded-md text-white font-semibold px-4"
                  @click="resetAll"
                >
                  {{ t('cancel') }}
                </button>
              </div>
            </div>
          </div>
        </ul>
      </div>
      <div class="bg-gray-100 p-4 rounded-md">
        <!-- den menukaart -->
        <h3 class="font-bold mb-2 text-lg">{{ t('available_activities') }}</h3>
        <ul>
          <li
            v-for="availableActivity in availableActivities"
            :key="availableActivity.id"
            class="activity-item flex w-full mb-10"
          >
            <div class="flex w-full bg-white p-4 rounded-md pb-2">
              <div class="w-full">
                <div
                  class="w-full relative h-48 cursor-pointer hover:scale-101 hover:shadow-md transform duration-300"
                  @click="openActivityDetails(availableActivity)"
                >
                  <img
                    v-if="availableActivity.headerImageUrl"
                    :src="availableActivity.headerImageUrl"
                    alt="activity image"
                    class="bg-gray-200 object-cover w-full h-48 rounded-md"
                  />
                  <p
                    class="absolute top-2 md:bottom-2 md:top-auto right-2 bg-white shadow-md rounded-md px-4 p-2 font-semibold"
                  >
                    {{ availableActivity?.bookingSettings?.price }} €
                  </p>
                  <div
                    class="absolute bottom-2 left-2 flex-col sm:flex-row items-start sm:items-center flex gap-2 overflow-hidden"
                  >
                    <p
                      class="bg-white p-2 rounded-md sm:px-4 sm:px-8 shadow-md sm:w-max font-semibold text-gray-700 text-sm sm:text-lg"
                    >
                      {{ availableActivity.name }}
                    </p>
                    <p
                      v-if="availableActivity.recommended"
                      class="bg-amber-200 text-amber-700 p-2 rounded-md"
                    >
                      Recommended
                    </p>
                  </div>
                </div>

                <h1 class="mt-2 font-bold">{{ t('available_timeslots') }}:</h1>
                <p v-if="availableActivity?.bookableActivities?.length === 0">
                  {{ t('no_available_timeslots') }}
                </p>
                <div
                  v-for="availableBookable in availableActivity.bookableActivities"
                  :key="availableBookable.id"
                  class="border-b-2 border-gray-200 pb-2 mt-2"
                >
                  <div
                    class="flex flex-col md:flex-row items-start md:items-center w-full h-full gap-2"
                  >
                    <div
                      class="group w-full flex-col md:flex-row flex flex-row items-start md:items-center gap-2"
                    >
                      <div
                        class="relative activity-item flex-col md:flex-row w-full flex justify-between border bg-gray-200 rounded-md p-4 items-start md:items-center"
                      >
                        <p
                          v-if="isAlreadyBooked(availableBookable.id ?? '')"
                          class="absolute top-2 right-2 bg-red-200 px-4 p-2 rounded-md text-red-700 mb-1"
                        >
                          ⚠️ Booked
                        </p>
                        <div
                          class="h-full flex-col flex flex-col justify-between"
                        >
                          <p class="pb-1 border-b-1 border-gray-300">
                            {{
                              getHourAndMinutes(
                                availableBookable.startDate?.toString() || '',
                              )
                            }}
                          </p>
                          <p class="pt-1 border-t-1 border-gray-300">
                            {{
                              getHourAndMinutes(
                                availableBookable.endDate?.toString() || '',
                              )
                            }}
                          </p>
                        </div>
                        <div class="w-full">
                          <div
                            class="ml-0 md:ml-4 flex flex-col md:flex-row gap-4 items-start md:items-center"
                          >
                            <div
                              :class="{
                                'bg-green-200 border-green-500':
                                  availableBookable.status === 'OPEN',
                                'bg-red-200 border-red-500':
                                  availableBookable.status === 'CLOSED',
                                'bg-yellow-200 border-amber-500':
                                  availableBookable.status === 'FULL',
                                'bg-gray-200 border-gray-500':
                                  availableBookable.status === 'FINISHED' ||
                                  availableBookable.status === 'CANCELLED',
                              }"
                              class="block w-max p-2 border-1 px-8 rounded-md my-2 text-white font-medium"
                            >
                              <p
                                v-if="availableBookable.status === 'OPEN'"
                                class="text-green-700"
                              >
                                OPEN
                              </p>
                              <p
                                v-else-if="
                                  availableBookable.status === 'CLOSED'
                                "
                                class="text-red-700"
                              >
                                CLOSED
                              </p>
                              <p
                                v-else-if="availableBookable.status === 'FULL'"
                                class="text-amber-600"
                              >
                                FULL
                              </p>
                              <p
                                v-else-if="
                                  availableBookable.status === 'FINISHED'
                                "
                                class="text-gray-700"
                              >
                                FINISHED
                              </p>
                              <p
                                v-else-if="
                                  availableBookable.status === 'CANCELLED'
                                "
                                class="text-gray-700"
                              >
                                CANCELLED
                              </p>
                            </div>
                            <div class="flex items-center gap-2">
                              <p>{{ t('available_places') }}:</p>
                              <p
                                class="bg-white rounded-md border-2 border-gray-300 text-center px-4 p-2"
                              >
                                {{ availableBookable.bookableSettings?.places }}
                              </p>
                            </div>
                          </div>
                          <p
                            v-if="
                              availableBookable.status === 'CLOSED' &&
                              customUser.role !== 'ADMIN'
                            "
                          >
                            Closed for booking, neem contact op met de Tour
                            Operator via de chat om toch nog last minute een
                            plaatse te bemachtigen!
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      class="transform duration-300 bg-gradient-to-br from-green-400 to-green-600 py-2 md:py-6 rounded-md px-4 disabled:bg-gray-400 disabled:bg-none disabled:bg-gray-200 disabled:opacity-50 flex items-center justify-center w-full md:w-max"
                      :disabled="
                        isAlreadyBookedOrAdded(availableBookable.id || '') ||
                        availableBookable.status === 'CANCELLED' ||
                        availableBookable.status === 'FINISHED' ||
                        availableBookable.status === 'FULL' ||
                        (availableBookable.status === 'CLOSED' &&
                          customUser.role === 'admin')
                      "
                      @click="addBookableActivityV2(availableBookable)"
                      :class="{
                        'hover:scale-105':
                          !isAlreadyBookedOrAdded(availableBookable.id || '') &&
                          availableBookable.status !== 'CANCELLED' &&
                          availableBookable.status !== 'FINISHED' &&
                          availableBookable.status !== 'FULL' &&
                          (availableBookable.status !== 'CLOSED' ||
                            customUser.role !== 'admin'),
                      }"
                    >
                      <Plus
                        :class="{
                          'text-white':
                            !isAlreadyBookedOrAdded(
                              availableBookable.id || '',
                            ) &&
                            availableBookable.status !== 'CANCELLED' &&
                            availableBookable.status !== 'FINISHED' &&
                            availableBookable.status !== 'FULL' &&
                            (availableBookable.status !== 'CLOSED' ||
                              customUser.role !== 'admin'),
                          'text-gray-500':
                            isAlreadyBookedOrAdded(
                              availableBookable.id || '',
                            ) ||
                            availableBookable.status === 'CANCELLED' ||
                            availableBookable.status === 'FINISHED' ||
                            availableBookable.status === 'FULL' ||
                            (availableBookable.status === 'CLOSED' &&
                              customUser.role === 'admin'),
                        }"
                        class="h-8 w-8 font-bold"
                      />
                    </button>
                  </div>

                  <p
                    v-if="errorStrings[availableBookable.id || '']"
                    class="text-red-700 p-4 rounded-md w-full my-2 bg-red-200"
                  >
                    ⚠️ {{ errorStrings[availableBookable.id || ''] }}
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <!-- Activity Details Modal -->
        <DetailsActivityForBooking
          v-if="showActivityDetails"
          :activity="showActivityDetails"
          :is-already-booked-or-added="isAlreadyBookedOrAdded"
          @close="closeActivityDetails"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  defineEmits,
  watch,
  onMounted,
  watchEffect,
  computed,
  onBeforeUnmount,
} from 'vue'
import type { Activity } from '@/interfaces/activity.interface'
import type { Day } from '@/interfaces/day.interface'
import { formatDateWithoutHours } from '@/utils/converter'
import { ACTIVITIES_BY_LOCATION_AND_DATE } from '@/graphql/activities/activities.admin.query'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { getHourAndMinutes, formatDate } from '@/utils/converter'
import type { BookableActivity } from '@/interfaces/bookableActivity.interface'
import type { ExtraPerson } from '@/interfaces/extraPerson.interface'
import {
  CREATE_BOOKING,
  DELETE_BOOKING,
} from '@/graphql/booking/booking.admin.query'
import type { CreateBookingInput } from '@/interfaces/booking.create.interface'
import type { Booking } from '@/interfaces/booking.interface'
import { Plus, X } from 'lucide-vue-next'
import { formatDay, formatFullDate } from '@/utils/converter'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'

import useCustomUser from '@/composables/useCustomUser'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { customUser } = useCustomUser()

const isDropdownOpen = ref(true)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// PROPS
const props = defineProps({
  editingDay: {
    type: Object as () => Day,
    required: true,
  },
  userUid: {
    type: String,
    required: true,
  },
  extraPersons: {
    type: Array as () => ExtraPerson[],
    required: true,
  },
  bookingIdTrip: {
    type: String,
    required: true,
  },
  tripPrice: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['closeEdit', 'handleDelete'])
// ook wel de menukaart van de activiteiten
const availableActivities = ref<Activity[] | null>(null)

const newPrice = ref<number>(props.tripPrice)

// we switchen hierover naar bookables/ dit is gemmakelijk om straks de create/deletes mee te doen

// display purposes
const localBookableActivity = ref<BookableActivity[] | null>([])

const localBookingsActvity = ref<Booking[] | null>([])

const showActivityDetails = ref<BookableActivity | Booking | Activity | null>(
  null,
)

// Open the modal with activity details
const openActivityDetails = (
  activity: BookableActivity | Booking | Activity,
) => {
  console.log('Opening activity details', activity)

  const activityCopy = { ...activity }

  if ('equipmentProvided' in activityCopy && !activityCopy.equipmentProvided) {
    console.log('Trying to resolve equipment provided')
    activityCopy.equipmentProvided = []

    if (
      'activity' in activityCopy &&
      activityCopy.activity?.equipmentProvided
    ) {
      activityCopy.equipmentProvided = activityCopy.activity.equipmentProvided
    }
  }

  if ('safetyMeasures' in activityCopy && !activityCopy.safetyMeasures) {
    console.log('Trying to resolve safety measures')
    activityCopy.safetyMeasures = []

    if ('activity' in activityCopy && activityCopy.activity?.safetyMeasures) {
      activityCopy.safetyMeasures = activityCopy.activity.safetyMeasures
    }
  }

  showActivityDetails.value = activityCopy
}
// Close the modal
const closeActivityDetails = () => {
  showActivityDetails.value = null
}

const handleClosingDetailsModal = (activity: BookableActivity) => {
  addBookableActivityV2(activity)
  closeActivityDetails()
}

// DATA HOLDERS
// display purposes

// backend purposes
// ORIGINELE REFERENTIES
const copyBookableOriginal = ref<string[]>([])
const copyBookingOriginal = ref<string[]>([])

// BEWERKTE REFERENTIES
const compareBooking = ref<string[]>([])
const compareBookable = ref<string[]>([])

const isEditing = ref(false)

const errorStrings = ref<Record<string, string>>({})

// basic reusable functions
const resetAll = () => {
  newPrice.value = props.tripPrice
  isEditing.value = false
  localBookableActivity.value = []
  localBookingsActvity.value = []
  copyBookableOriginal.value = []
  copyBookingOriginal.value = []
  compareBooking.value = []
  compareBookable.value = []
  errorStrings.value = {}
  initializelocalBookableActivityV2()
}

const closeEdit = () => {
  resetAll()
  emit('closeEdit')
}

// for displaying purpose mobile
const hideBodyOverflow = () => {
  if (window.innerWidth <= 768) {
    document.body.classList.add('overflow-hidden')
  }
}

const showBodyOverflow = () => {
  document.body.classList.remove('overflow-hidden')
}

onMounted(() => {
  hideBodyOverflow()
})

onBeforeUnmount(() => {
  showBodyOverflow()
})

const initializelocalBookableActivityV2 = () => {
  // first get all current bookings and store them in the localBookingsActvity
  console.log('init...')
  console.log('localBookingsActvity', localBookingsActvity.value)
  // first reset the localBookingsActvity
  if (localBookingsActvity.value) {
    localBookingsActvity.value = []
  }

  if (props.editingDay.activities) {
    console.log(props.editingDay.activities)
    for (const activity of props.editingDay.activities) {
      if (localBookingsActvity.value) {
        localBookingsActvity.value.push(activity)
      }
    }
  }

  // we gone store each bookingid in the originalBookable array && compareBookable array
  if (localBookingsActvity.value) {
    for (const booking of localBookingsActvity.value) {
      copyBookingOriginal.value.push(booking.id)
      compareBooking.value.push(booking.id)
    }
  }

  console.log('localBookingsActvity', localBookingsActvity.value)
}

const startDate = computed(() => {
  const date = props.editingDay?.date
    ? new Date(props.editingDay.date)
    : new Date()
  date.setHours(0, 0, 0, 0)
  return date
})

const endDate = computed(() => {
  const date = props.editingDay?.date
    ? new Date(props.editingDay.date)
    : new Date()
  date.setHours(23, 59, 59, 999)
  return date
})

// HIER NEMEN WE DE ACTIVITEITEN DIE BESCHIKBAAR ZIJN OP DE LOCATIE VAN DE TRIP
const { result, refetch } = useQuery(
  ACTIVITIES_BY_LOCATION_AND_DATE,
  () => ({
    location: {
      latitude: props.editingDay?.location?.geolocation?.coordinates[1] || 0,
      longitude: props.editingDay?.location?.geolocation?.coordinates[0] || 0,
    },
    startDate: startDate.value,
    endDate: endDate.value,
  }),
  { fetchPolicy: 'cache-and-network' },
)

watch(result, value => {
  console.log('result has been changed in editTripScreen', result)
  console.log('start date', startDate.value)
  console.log('end date', endDate.value)
  if (value) {
    availableActivities.value = value.activitiesByLocationAndDate
  } else {
    availableActivities.value = []
  }
})

watch(result, value => {
  console.log('result', value)
  // console.log('result has been changed in editTripScreen', value)
  if (value && value.activitiesByLocationAndDate) {
    availableActivities.value = value.activitiesByLocationAndDate
  } else {
    availableActivities.value = []
  }
})

// watch when theirs a new day selected :)
watch(
  () => props.editingDay,
  async () => {
    resetAll()
    // await refetch()
    // initializelocalBookableActivityV2()
  },
  { immediate: true },
)

// CHECK IF ACTIVITY IS BOOKED
const isAlreadyBooked = (activityId: string): boolean => {
  if (props.editingDay.activities) {
    return props.editingDay.activities.some(
      activity => activity.bookableActivityId === activityId,
    )
  }
  return false
}

const isAlreadyBookedOrAdded = (bookableId: string): boolean => {
  const isBooked = isAlreadyBooked(bookableId)

  const isAdded =
    localBookableActivity.value?.some(activity => activity.id === bookableId) ??
    false

  return isBooked || isAdded
}

const saveEditing = async () => {
  // first check if the compareBookable is the same as the copyBookableOriginal
  // if so we dont need to do anythingg

  const removedActivities = copyBookableOriginal.value.filter(
    bookableId => !compareBookable.value.includes(bookableId),
  )
  const removedBookings = copyBookingOriginal.value.filter(
    bookingId => !compareBooking.value.includes(bookingId),
  )

  if (removedActivities || removedBookings) {
    console.log('Removed activities:', removedActivities)
    if (removedActivities.length > 0) {
      deleteBooking(removedActivities)
    }

    console.log('Removed bookings:', removedBookings)
    if (removedBookings.length > 0) {
      await deleteBooking(removedBookings)
      emit('handleDelete', removedBookings)
    }
  }

  const addedActivities = compareBookable.value.filter(
    bookableId => !copyBookableOriginal.value.includes(bookableId),
  )
  console.log('Added activities:', addedActivities)
  if (addedActivities.length > 0) {
    addBooking(addedActivities)
  }

  emit('closeEdit')

  resetAll()
}

// overlapCheckV2
const overlapCheckV2 = (bookable?: BookableActivity) => {
  // in theorie kunnen we geen booking toevoegen, je kan enkel een bookable toevoegen
  if (bookable) {
    console.log(bookable)
    const newStartDate = new Date(bookable.startDate.toString())
    const newEndDate = new Date(bookable.endDate.toString())

    // first check if their are no bookings on those times
    if (props.editingDay.activities) {
      for (const activity of props.editingDay.activities) {
        const bookableStartDate = new Date(activity.startDate)
        const bookableEndDate = new Date(activity.endDate)

        if (
          newStartDate.getTime() >= bookableStartDate.getTime() &&
          newStartDate.getTime() <= bookableEndDate.getTime()
        ) {
          return true
        }
        if (
          newEndDate.getTime() >= bookableStartDate.getTime() &&
          newEndDate.getTime() <= bookableEndDate.getTime()
        ) {
          return true
        }
      }
    }

    // now also still check if the new activity overlaps with the localBookableActivity
    if (localBookableActivity.value) {
      for (const activity of localBookableActivity.value) {
        const bookableStartDate = new Date(activity.startDate.toString())
        const bookableEndDate = new Date(activity.endDate.toString())

        if (
          newStartDate.getTime() >= bookableStartDate.getTime() &&
          newStartDate.getTime() <= bookableEndDate.getTime()
        ) {
          return true
        }
        if (
          newEndDate.getTime() >= bookableStartDate.getTime() &&
          newEndDate.getTime() <= bookableEndDate.getTime()
        ) {
          return true
        }
      }
    }
  }
}

const addBookableActivityV2 = (bookable: BookableActivity) => {
  console.log('Debug purpose', localBookableActivity.value)

  // if the props.editingDay.activities is not empty but the localBookableActivity is empty
  // we need to initialize the localBookableActivity
  if (
    (props.editingDay.activities && localBookableActivity.value?.length) ||
    -1 < 0
  ) {
    console.log('extra init...')
    initializelocalBookableActivityV2()
  }

  // first do a check if it doesnt overlap
  if (overlapCheckV2(bookable)) {
    console.log('Activity overlaps with another activity')
    errorStrings.value[bookable.id || ''] =
      'Activity overlaps with another activity'
    setTimeout(() => {
      delete errorStrings.value[bookable.id || '']
    }, 5000)
    return
  }

  if (!isEditing.value) {
    isEditing.value = true
  }

  // push nieuwe bookable in de localBookableActivity voor display purposes
  if (localBookableActivity.value) {
    localBookableActivity.value.push(bookable)
  }

  // PRICE
  newPrice.value +=
    (bookable.bookableSettings?.price || 0) * (props.extraPersons.length + 1)

  // push de bookableId in de compareBookable array
  if (!compareBookable.value.includes(bookable.id || '')) {
    compareBookable.value.push(bookable.id || '')
  }
}
// er is geen nood aan een functie speciaal voor een booking toe te voegen, deze is al sws toegevoegd

const removeBooking = (bookingId: string) => {
  console.log('Removing booking with id:', bookingId)
  if (!isEditing.value) {
    isEditing.value = true
  }

  console.log('localBookingsActvity', localBookingsActvity.value)

  // remove it from the display array localBookingsActvity
  if (localBookingsActvity.value) {
    localBookingsActvity.value = localBookingsActvity.value.filter(
      booking => booking.id !== bookingId,
    )
  }

  console.log('compareBookableBefore', compareBooking.value)
  compareBooking.value = compareBooking.value.filter(id => id !== bookingId)
  console.log('compareBookable', compareBooking.value)
}

const removeBookableActivityV2 = (bookable: BookableActivity) => {
  // filter it first out of the localBookableActivity array for display purposes
  if (localBookableActivity.value) {
    localBookableActivity.value = localBookableActivity.value.filter(
      activity => activity.id !== bookable.id,
    )
  }

  // remove the price
  newPrice.value -=
    (bookable.bookableSettings?.price || 0) * (props.extraPersons.length + 1)

  // remove it from the compareBookable array
  compareBookable.value = compareBookable.value.filter(id => id !== bookable.id)
}

// MUTATIONS
const { mutate: deleteBookingMutation } = useMutation(DELETE_BOOKING)

const deleteBooking = async (ids: string[]) => {
  console.warn('DELETING FOLLOWING IDS: ', ids)
  let deletedBooking
  for (const id of ids) {
    try {
      deletedBooking = await deleteBookingMutation({
        id: id,
      })
    } catch (error) {
      console.error('Error deleting booking:', error)
    }
  }
  console.log('Deleted booking:', deletedBooking)
}

const { mutate: addBookingMutation } = useMutation(CREATE_BOOKING)

const addBooking = async (ids: string[]) => {
  let newTrip
  for (const id of ids) {
    const extraPersons = props.extraPersons.map(
      ({ __typename, ...rest }: ExtraPerson & { __typename?: string }) => rest,
    )

    const createBookingInput: CreateBookingInput = {
      type: 'activity',
      fireAuthId: props.userUid,
      booking_trip_id: props.bookingIdTrip,
      extraPersons: extraPersons,
      bookable_activity_id: id,
    }

    try {
      newTrip = await addBookingMutation({
        createBookingInput,
      })

      // console.log('New trip:', newTrip)
    } catch (error) {
      console.error('Error adding booking:', error)
    }
  }
}

// EMIT CLOSE EVENT
import DetailsActivityForBooking from '@/components/generic/DetailsActivityForBooking.vue'
</script>
