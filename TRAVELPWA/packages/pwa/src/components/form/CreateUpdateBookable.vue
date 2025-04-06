<template>
  <div
    class="w-full flex flex-col justify-between mt-4 bg-gray-100 p-4 rounded-t-md"
  >
    <h1 class="text-md block font-semibold tracking-wider text-gray-700">
      {{
        isCreate
          ? 'Creating Booking slots for'
          : `Updating ${props.parentItem?.name}`
      }}
    </h1>
  </div>
  <div
    v-if="isCreate"
    class="flex gap-4 items-center bg-white border-2 border-gray-100 p-4 rounded-b-md"
  >
    <h1>
      {{
        isCreate ? props.parentItem?.name : `Updating ${props.parentItem?.name}`
      }}
    </h1>
  </div>
  <div
    v-if="!isCreate"
    class="flex gap-4 items-center bg-white border-2 border-gray-100 p-4 rounded-b-md"
  >
    <h1 class="border-2 border-gray-200 rounded-md p-2 px-4">
      {{
        isCreate
          ? ''
          : ` ${getHourAndMinutes(props.bookable?.endDate.toString() ?? '')}`
      }}
    </h1>
    <h1>
      {{
        isCreate
          ? ''
          : `${formatFullDate(props.bookable?.startDate.toString() ?? '')}`
      }}
    </h1>
  </div>
  <div class="flex flex-col mt-4 gap-5 pb-40">
    <div v-if="isCreate" class="bg-gray-100 p-4 rounded-md">
      <h1 class="text-md block font-semibold tracking-wider text-gray-700">
        Start with selecting dates!
      </h1>
      <div class="w-full flex justify-start mt-2 pb-2">
        <DatePicker @updatePeriod="handleDateUpdate"></DatePicker>
      </div>
      <div
        v-for="(date, index) in selectedDates"
        :key="index"
        class="mt-4 border-2 p-4 rounded-md bg-white"
      >
        <h4 class="text-md block font-semibold tracking-wider text-gray-700">
          {{ formatDate(date) }}
        </h4>
        <h3 class="mb-2">Start hours:</h3>
        <div
          v-for="(hour, hourIndex) in startHours[index]"
          :key="hourIndex"
          class="flex flex-col gap-2 bg-gray bg-op-30 p-4 border-rd-md mb-2"
        >
          <HourInputField
            v-model="startHours[index][hourIndex]"
            @remove="removeStartHour(index, hourIndex)"
          />
          <div
            v-if="props.parentItem && 'bookableTrips' in props.parentItem"
            class="mt-4"
          >
            <GuidePicker
              v-if="guides.length > 0"
              v-model="selectedGuides[index]"
              label="Select a guide"
              :guides="guides"
            ></GuidePicker>
          </div>
        </div>
        <div
          @click="addStartHour(index)"
          class="cursor-pointer border-2 border-gray-100 w-full p-3.6 rounded bg-white flex gap-2 items-center"
        >
          <button class="text-gray-300 p-2 rounded">
            <Plus class="w-8 h-8" />
          </button>
          <p class="text-gray-500">Add a start hour</p>
        </div>
        <p
          v-if="errorMessages[index]"
          class="text-red-500 bg-red-200 p-4 rounded mt-2"
        >
          {{ errorMessages[index] }}
        </p>
      </div>
    </div>

    <div v-if="!isCreate && props.bookable?.__typename === 'BookableTrip'">
      <h1 class="text-md block font-semibold tracking-wider text-gray-700">
        Updating a trip
      </h1>
      <div class="w-full border-1 border-gray-100 mt-4"></div>
      <div class="mt-4">
        <GuidePicker
          v-if="guides.length > 0"
          v-model="selectedGuides[0]"
          label="Select a guide"
          :guides="guides"
        ></GuidePicker>
      </div>
    </div>

    <div v-if="!isCreate && props.bookable?.__typename === 'BookableActivity'">
      <h1 class="text-md block font-semibold tracking-wider text-gray-700">
        Updating an activity
      </h1>
      <div class="w-full border-1 border-gray-100 mt-4"></div>
      <div class="mt-6">
        <CountPicker
          v-model="newStartHour"
          :min="-3"
          :max="3"
          :disableInput="true"
          label="New Start Hour"
        ></CountPicker>
        <div class="flex bg-gray-100 rounded-md p-4 items-center mt-2 gap-2">
          <p class="text-md block font-semibold tracking-wider text-gray-700">
            New start date:
          </p>
          <p class="bg-white px-4 p-2 rounded-md">
            {{ formattedNewStartDate }}
          </p>
        </div>
      </div>
    </div>

    <div>
      <h1 class="text-md block font-semibold tracking-wider text-gray-700">
        Status
      </h1>
      <StatusSelect v-model="status" :create="isCreate"></StatusSelect>
    </div>

    <div v-if="!isCreate && props.bookable?.__typename === 'BookableActivity'">
      <h1 class="text-md block font-semibold tracking-wider text-gray-700 mb-2">
        Make activity recommended?
      </h1>
      <ToggleSwitch v-model="recommended" label=""></ToggleSwitch>
    </div>

    <div class="w-full border-1 border-gray-100 mt-4"></div>
    <div>
      <h3
        class="text-lg bg-amber-200 w-full rounded-md block font-bold tracking-wider text-amber-700 mb-1 p-4"
      >
        Bookable settings
      </h3>
      <div class="p-4 bg-amber-100 border-rd-md flex flex-col gap-4">
        <CountPicker
          v-model="localBookingSettings.max_persons"
          label="Max participants"
        ></CountPicker>
        <CountPicker
          v-model="localBookingSettings.min_persons_required"
          label="Min participants"
        ></CountPicker>
        <ToggleSwitch
          v-model="localBookingSettings.autocancel"
          label="Auto cancel"
        ></ToggleSwitch>

        <CountPicker
          v-model="localBookingSettings.auto_cancel_days_before"
          label="Auto cancel days before"
        ></CountPicker>
        <div v-if="props.bookable">
          <p>
            Auto cancel on:
            {{
              formatFullDate(
                props.bookable.bookableSettings?.autocancel_on.toString() ?? '',
              )
            }}
          </p>
        </div>
        <InputFieldNumber
          v-model="localBookingSettings.price"
          label="Price"
        ></InputFieldNumber>
      </div>
    </div>

    <WarningModal
      v-if="showWarningModal"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      :warningText="`Are you sure you want to cancel this booking slot? Keep in mind that this will cancel all bookings for this slot.`"
      :visible="showWarningModal"
    ></WarningModal>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  watch,
  onMounted,
  getCurrentInstance,
  inject,
  computed,
  watchEffect,
} from 'vue'
import type {
  BookableActivity,
  CreateBookableActivityInput,
  UpdateBookableActivityInput,
} from '@/interfaces/bookableActivity.interface'
import type {
  BookableTrip,
  CreateBookableTripInput,
  UpdateBookableTripInput,
} from '@/interfaces/bookableTrip.interface'
import CountPicker from '@/components/form/countPicker.vue'
import ToggleSwitch from '@/components/form/toggleSwitch.vue'
import InputFieldNumber from '@/components/form/inputFieldNumber.vue'
import DatePicker from '@/components/form/DatePicker.vue'
import HourInputField from '@/components/form/HourInputField.vue'
import type { BookingSettings } from '@/interfaces/bookingSettings.interface'
import type { Trip } from '@/interfaces/trip.interface'
import type { Activity } from '@/interfaces/activity.interface'
import { formatFullDate, getHourAndMinutes } from '@/utils/converter'
import {
  CREATE_BOOKABLE_ACTIVITY_MUTATION,
  UPDATE_BOOKABLE_ACTIVITY_MUTATION,
} from '@/graphql/activities/activities.admin.query'

import {
  CREATE_BOOKABLE_TRIP_MUTATION,
  UPDATE_BOOKABLE_TRIP_MUTATION,
} from '@/graphql/trip/trips.admin.query'
import { useMutation, useQuery } from '@vue/apollo-composable'
import type { BookableSettingsInput } from '@/interfaces/bookableSettings.interface'
import StatusSelect from './StatusSelect.vue'
import GuidePicker from '@/components/form/guidePicker.vue'
import type { User } from '@/interfaces/user.interface'
import { GET_ALL_GUIDES } from '@/graphql/user/user.admin'

import WarningModal from '../reusable/warningModal.vue'
import useCustomUser from '@/composables/useCustomUser'
import { Plus } from 'lucide-vue-next'

const { customUser } = useCustomUser()

const props = defineProps<{
  bookable?: BookableActivity | BookableTrip | null
  parentItem?: Activity | Trip
}>()

const status = ref(props.bookable?.status ?? 'OPEN')

const isCreate = ref(!props.bookable)

const errorMessages = reactive<Record<number, string>>({})

let proceedWithSave = false

const recommended = ref(false)
if (props.bookable && 'activityId' in props.bookable) {
  recommended.value = props.bookable.recommended ?? false
}
if (props.parentItem && 'bookableActivities' in props.parentItem) {
  recommended.value = props.parentItem.recommended
}

const localBookingSettings = reactive({
  max_persons:
    props.bookable?.bookableSettings?.max_persons ??
    props.parentItem?.bookingSettings?.max_participants ??
    0,
  min_persons_required:
    props.bookable?.bookableSettings?.min_persons_required ??
    props.parentItem?.bookingSettings?.min_participants ??
    0,
  autocancel:
    props.bookable?.bookableSettings?.autocancel ??
    props.parentItem?.bookingSettings?.auto_cancel ??
    false,
  auto_cancel_days_before:
    props.parentItem?.bookingSettings?.auto_cancel_days_before ?? 0,
  price:
    props.bookable?.bookableSettings?.price ??
    props.parentItem?.bookingSettings?.price ??
    0,
  places:
    props.bookable?.bookableSettings?.places ??
    props.parentItem?.bookingSettings?.max_participants ??
    0,
})

const showWarningModal = ref(false)

const emit = defineEmits(['createBookable', 'updateBookable'])

const selectedDates = ref<Date[]>([])
const startHours = reactive<Record<number, string[]>>({})

const handleDateUpdate = (dates: Date[]) => {
  selectedDates.value = dates

  dates.forEach((date, index) => {
    if (!(index in startHours)) {
      startHours[index] = ['']
    }
    if (!(index in errorMessages)) {
      errorMessages[index] = ''
    }
    if (!(index in selectedGuides)) {
      selectedGuides[index] = ''
    }
  })
}

const addStartHour = (index: number) => {
  if (startHours[index].some(hour => hour === '')) {
    errorMessages[index] =
      'Fill in the hours before adding even more on this date'
    return
  }
  errorMessages[index] = ''
  startHours[index].push('')
}

const removeStartHour = (index: number, hourIndex: number) => {
  startHours[index].splice(hourIndex, 1)
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const newStartDate = ref('')
const newStartHour = ref(0)
const maxStartDate = computed(() => {
  if (props.bookable?.startDate) {
    const maxDate = new Date(props.bookable.startDate)
    maxDate.setHours(maxDate.getHours() + 3)
    return maxDate.toISOString().slice(0, 16)
  }
  return ''
})

const formattedNewStartDate = computed(() => {
  if (props.bookable?.startDate) {
    const newDate = new Date(props.bookable.startDate)
    newDate.setHours(newDate.getHours() + newStartHour.value)
    return newDate.toLocaleString()
  }
  return ''
})

interface QueryResultCreateBookableActivity {
  createBookableActivity: BookableActivity
}

interface QueryResultUpdateBookableActivity {
  updateBookableActivity: BookableActivity
}

interface QueryResultCreateBookableTrip {
  createBookableTrip: BookableTrip
}

interface QueryResultUpdateBookableTrip {
  updateBookableTrip: BookableTrip
}

const { mutate: createBookableActivity } =
  useMutation<QueryResultCreateBookableActivity>(
    CREATE_BOOKABLE_ACTIVITY_MUTATION,
  )

const { mutate: updateBookableActivity } =
  useMutation<QueryResultUpdateBookableActivity>(
    UPDATE_BOOKABLE_ACTIVITY_MUTATION,
  )

const { mutate: createBookableTrip } =
  useMutation<QueryResultCreateBookableTrip>(CREATE_BOOKABLE_TRIP_MUTATION)

const { mutate: updateBookableTrip } =
  useMutation<QueryResultUpdateBookableTrip>(UPDATE_BOOKABLE_TRIP_MUTATION)

const {
  result: guidesResult,
  loading: guidesLoading,
  error: guidesError,
} = useQuery<{ allGuides: User[] }>(GET_ALL_GUIDES)

const handleConfirm = () => {
  showWarningModal.value = false
  proceedWithSave = true
  status.value = 'CANCELLED'

  saveBookable()
}

const handleCancel = () => {
  showWarningModal.value = false
}
const guides = computed(() => {
  const result = guidesResult.value?.allGuides ?? []
  console.log('guides', result)
  return result
})

const selectedGuides = reactive<Record<number, string>>({})

const saveBookable = async () => {
  if (!isCreate.value && status.value === 'CANCELLED' && !proceedWithSave) {
    showWarningModal.value = true
    return
  }

  const calculateAutocancelOn = (endDate: Date, daysBefore: number) => {
    const date = new Date(endDate)
    date.setDate(date.getDate() - daysBefore)
    return date
  }

  const bookableSettingsInput: BookableSettingsInput = {
    max_persons: localBookingSettings.max_persons,
    min_persons_required: localBookingSettings.min_persons_required,
    autocancel: localBookingSettings.autocancel,
    autocancel_on: props.bookable?.bookableSettings?.autocancel_on,
    price: localBookingSettings.price,
    places: localBookingSettings.places,
  }

  const handleCreate = async () => {
    const createdBookables: (BookableActivity | BookableTrip)[] = []

    if (props.parentItem?.__typename === 'Activity') {
      console.log('Creating activity bookable...')
      const parentItem = props.parentItem as Activity
      for (const [index, date] of selectedDates.value.entries()) {
        for (const hour of startHours[index]) {
          const [hourPart, minutePart] = hour.split(':')
          console.log('hourPart', hourPart)
          console.log('minutePart', minutePart)

          const startDate = new Date(date)
          console.log('startDate', date)
          console.log('complete:' + date.toString())
          startDate.setHours(parseInt(hourPart), parseInt(minutePart))
          inject

          const activityBookable: CreateBookableActivityInput = {
            activityId: parentItem.id,
            startDate: startDate,
            duration: parentItem.duration || 0,
            status: 'OPEN',
            recommended: false,
            bookableSettings: bookableSettingsInput,
            bookingIds: [],
            createdById: customUser.value?.id ?? '',
          }

          const res = await createBookableActivity({
            createBookableActivityInput: activityBookable,
          })

          if (res && res.data?.createBookableActivity) {
            createdBookables.push(res.data.createBookableActivity)
          }
        }
      }
    } else if (props.parentItem?.__typename === 'Trip') {
      console.log('Creating trip bookable...')
      const parentItem = props.parentItem as Trip
      for (const [index, date] of selectedDates.value.entries()) {
        for (const hour of startHours[index]) {
          console.log('hour', hour)
          const [hourPart, minutePart] = hour.split(':')
          const startDate = new Date(date)
          startDate.setUTCHours(parseInt(hourPart), parseInt(minutePart))

          console.log('#331 CreateUpdateBookable.vue')
          console.log('Selected Guides: ', selectedGuides)
          console.log(
            'Creating trip bookable... With following guides:',
            selectedGuides,
          )
          if (!customUser.value?.id) {
            console.warn('customUser.value?.id is undefined')
          }

          const tripBookable: CreateBookableTripInput = {
            tripId: parentItem.id,
            startDate: startDate,
            createById: customUser.value?.id ?? '',
            status: 'OPEN',
            bookableSettings: bookableSettingsInput,
            bookingIds: [],
            assignedGuideId: selectedGuides[index],
          }

          console.log('tripBookable', tripBookable)

          const res = await createBookableTrip({
            createBookableTripInput: tripBookable,
          })

          if (res && res.data?.createBookableTrip) {
            createdBookables.push(res.data.createBookableTrip)
          }
        }
      }
    } else {
      console.log('Something went wrong...')
    }

    if (createdBookables.length > 0) {
      emit('createBookable', createdBookables)
    }
  }

  const handleUpdate = async () => {
    if (props.bookable?.__typename === 'BookableActivity') {
      console.log('Updating activity bookable...')
      console.log('newStartDateXXX', formattedNewStartDate.value)

      let preformatedNewStartDate = formattedNewStartDate.value
      // check if in format 14/12/2024, 18:00:00
      if (
        preformatedNewStartDate.includes('/') &&
        preformatedNewStartDate.includes(':') &&
        preformatedNewStartDate.includes(',')
      ) {
        try {
          const [datePart, timePart] = preformatedNewStartDate.split(', ')
          const [day, month, year] = datePart.split('/').map(Number)
          const [hours, minutes, seconds] = timePart.split(':').map(Number)
          console.log('Parsed values:', {
            day,
            month,
            year,
            hours,
            minutes,
            seconds,
          })

          // Correct the order of parameters for the Date constructor
          const parsedDate = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            seconds,
          )
          preformatedNewStartDate = parsedDate.toISOString()
        } catch (error) {
          console.error('Failed to parse and reformat the date:', error)
          return
        }
      }

      const newStartDate = new Date(preformatedNewStartDate)

      console.log(
        'newStartDate',
        newStartDate.toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      )

      // Correct the order of parameters for the correctedDate
      const correctedDate = new Date(
        newStartDate.getFullYear(),
        newStartDate.getMonth(),
        newStartDate.getDate(),
        newStartDate.getHours(),
        newStartDate.getMinutes(),
        newStartDate.getSeconds(),
      )

      console.log('correctedDate', correctedDate)
      if (correctedDate.toString() === 'Invalid Date') {
        console.error('Invalid date aborting update..')
        return
      }
      const bookable = props.bookable as BookableActivity
      const activityBookable: UpdateBookableActivityInput = {
        id: bookable.id,
        activityId: bookable.activityId,
        startDate: correctedDate ? correctedDate : bookable.startDate,
        status: status.value,
        recommended: recommended.value,
        bookableSettings: bookableSettingsInput,
      }

      console.log('activityBookable', activityBookable)

      const res = await updateBookableActivity({
        updateBookableActivityInput: activityBookable,
      })

      if (res && res.data?.updateBookableActivity) {
        emit('updateBookable', res.data.updateBookableActivity)
      }
    } else if (props.bookable?.__typename === 'BookableTrip') {
      console.log('Updating trip bookable...')
      const bookable = props.bookable as BookableTrip
      const tripBookable: UpdateBookableTripInput = {
        id: bookable.id,
        tripId: bookable.tripId,
        status: status.value,
        bookableSettings: bookableSettingsInput,
        assignedGuideId: selectedGuides[0],
      }

      const res = await updateBookableTrip({
        updateBookableTripInput: tripBookable,
      })

      if (res && res.data?.updateBookableTrip) {
        emit('updateBookable', res.data.updateBookableTrip)
      }
    } else {
      console.log('Something went wrong...')
    }
  }

  if (isCreate.value) {
    await handleCreate()
  } else {
    await handleUpdate()
  }
}

onMounted(() => {
  if (
    props.bookable &&
    'assignedGuideId' in props.bookable &&
    props.bookable.assignedGuideId
  ) {
    const assignedGuideId = props.bookable.assignedGuideId
    selectedGuides[0] = assignedGuideId
  }
})

// Watch for changes in props.bookable and update selectedGuides accordingly
watch(
  () => props.bookable,
  newBookable => {
    if (
      newBookable &&
      'assignedGuideId' in newBookable &&
      newBookable.assignedGuideId
    ) {
      selectedGuides[0] = newBookable.assignedGuideId
    }
  },
  { immediate: true },
)

defineExpose({
  saveBookable,
})
</script>
