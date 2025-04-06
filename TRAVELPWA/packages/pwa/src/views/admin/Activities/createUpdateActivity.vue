<template>
  <SideSlide @closeSlide="closeActivity" @saveSlide="saveActivity">
    <div class="w-full flex justify-between mt-4 bg-gray-100 p-4 rounded-md">
      <h1 class="text-md block font-semibold tracking-wider text-gray-700">
        {{ isEditMode ? 'Update Activity' : 'Create Actvity' }}
      </h1>
    </div>
    <div class="flex flex-col mt-4 gap-5 pb-40">
      <inputField
        v-model="activity.name"
        placeholder="Activity Name"
        label="Activity Name"
      ></inputField>
      <TextField
        v-model="activity.description"
        placeholder="Description"
        label="Description"
      ></TextField>
      <div class="p-4 bg-gray-100 border-rd-md">
        <ImagePicker
          v-model="activity.bannerImageUrl"
          label="Banner image"
          class="mb-4"
        >
        </ImagePicker>
        <ImagePicker
          v-model="activity.headerImageUrl"
          label="Header image"
        ></ImagePicker>
      </div>

      <ToggleSwitch
        v-model="activity.recommended"
        label="Do you want this activity to be recommended?"
      ></ToggleSwitch>

      <div>
        <p class="text-md block font-semibold tracking-wider text-gray-700">
          Recommended age
        </p>

        <div class="flex items-center gap-2">
          <p class="text-md block font-semibold tracking-wider text-gray-700">
            From
          </p>
          <inputField
            v-model="startAge"
            placeholder="Age"
            class="flex-1/2 max-w-70px"
          ></inputField>
          <p class="text-md block font-semibold tracking-wider text-gray-700">
            until
          </p>
          <inputField
            v-model="endAge"
            placeholder="Age"
            class="flex-1/2 max-w-70px"
          ></inputField>
        </div>
      </div>
      <DurationSelect v-model="activity.duration"></DurationSelect>
      <MultiInput
        label="Equipment provided"
        v-model="activity.equipmentProvided"
      ></MultiInput>
      <MultiInput
        label="Safety measures "
        v-model="activity.safetyMeasures"
      ></MultiInput>
      <LocationSelection v-model="activity.locationId"></LocationSelection>
      <div class="w-full border-1 border-gray-100 mt-4"></div>
      <div>
        <h3
          class="text-lg bg-amber-200 w-full rounded-md block font-bold tracking-wider text-amber-700 mb-1 p-4"
        >
          Bookable settings
        </h3>
        <div class="p-4 bg-amber-100 border-rd-md flex flex-col gap-4">
          <CountPicker
            v-model="activity.bookingSettings.max_participants"
            label="Max participants"
          ></CountPicker>
          <CountPicker
            v-model="activity.bookingSettings.min_participants"
            label="Min participants"
          ></CountPicker>
          <ToggleSwitch
            v-model="activity.bookingSettings.auto_cancel"
            label="Auto cancel"
          ></ToggleSwitch>
          <CountPicker
            v-model="activity.bookingSettings.auto_cancel_days_before"
            label="Auto cancel days before"
          ></CountPicker>
          <InputFieldNumber
            v-model="activity.bookingSettings.price"
            label="Price"
          ></InputFieldNumber>
        </div>
      </div>
    </div>
    <form @submit.prevent="saveActivity"></form>
    <AlertModal
      v-if="showAlert"
      :visible="showAlert"
      alertTitle="Error"
      alertText="You forgot filling something in. Please check all your inputfields."
      buttonText="Close"
      @close="showAlert = false"
    />
  </SideSlide>
</template>

<script setup lang="ts">
import SideSlide from '@/components/layout/sideSlide.vue'
import type {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
} from '@/interfaces/activity.interface'
import type { BookingSettingsInput } from '@/interfaces/bookingSettings.interface'
import { ref, onBeforeUnmount, type PropType, watch } from 'vue'
import ToggleSwitch from '@/components/form/toggleSwitch.vue'
import ImagePicker from '@/components/form/imagePicker.vue'
import DurationSelect from '@/components/form/durationSelect.vue'
import MultiInput from '@/components/form/multiInput.vue'
import LocationSelection from '@/components/form/locationSelection.vue'
import MapView from '@/components/generic/MapView.vue'
import CountPicker from '@/components/form/countPicker.vue'
import InputFieldNumber from '@/components/form/inputFieldNumber.vue'
import TextField from '@/components/form/textField.vue'
import { useMutation } from '@vue/apollo-composable'
import {
  CREATE_ACTIVITY_MUTATION,
  UPDATE_ACTIVITY_MUTATION,
} from '@/graphql/activities/activities.admin.query'
import inputField from '@/components/form/inputField.vue'
import AlertModal from '@/components/reusable/alertModal.vue'

const emit = defineEmits(['toggleSlide', 'activityCreated', 'activityUpdated'])

const props = defineProps({
  updateActivity: {
    type: Object as () => Activity | undefined,
    required: false,
  },
})

const isEditMode = ref(false)

const activity = ref<CreateActivityInput>({
  name: '',
  bannerImageUrl: '',
  headerImageUrl: '',
  recommended: false,
  ageGroup: '',
  description: '',
  duration: 0,
  equipmentProvided: [],
  safetyMeasures: [],
  locationId: '',
  bookingSettings: {
    max_participants: 0,
    min_participants: 0,
    auto_cancel: false,
    auto_cancel_days_before: 0,
    price: 0,
  } as BookingSettingsInput,
})

const startAge = ref('')
const endAge = ref('')

const showAlert = ref(false)

const clearActivity = () => {
  activity.value = {
    name: '',
    bannerImageUrl: '',
    headerImageUrl: '',
    recommended: false,
    ageGroup: '',
    description: '',
    duration: 0,
    equipmentProvided: [],
    safetyMeasures: [],
    locationId: '',
    bookingSettings: {
      max_participants: 0,
      min_participants: 0,
      auto_cancel: false,
      auto_cancel_days_before: 0,
      price: 0,
    } as BookingSettingsInput,
  }
  startAge.value = ''
  endAge.value = ''
}

watch(
  () => props.updateActivity,
  updateActivity => {
    console.log('Update activity (#createUpdateActivity.vue):', updateActivity)
    if (updateActivity && updateActivity.name) {
      console.log('Updating activity:', updateActivity)
      activity.value = {
        name: updateActivity.name || '',
        bannerImageUrl: updateActivity.bannerImageUrl || '',
        headerImageUrl: updateActivity.headerImageUrl || '',
        recommended: updateActivity.recommended,
        ageGroup: updateActivity.ageGroup || '',
        description: updateActivity.description || '',
        duration: updateActivity.duration || 0,
        equipmentProvided: updateActivity.equipmentProvided || [],
        safetyMeasures: updateActivity.safetyMeasures || [],
        locationId: updateActivity.locationId || '',
        bookingSettings: {
          max_participants:
            updateActivity.bookingSettings?.max_participants || 0,
          min_participants:
            updateActivity.bookingSettings?.min_participants || 0,
          auto_cancel: updateActivity.bookingSettings?.auto_cancel || false,
          auto_cancel_days_before:
            updateActivity.bookingSettings?.auto_cancel_days_before || 0,
          price: updateActivity.bookingSettings?.price || 0,
        },
      }
      const [start, end] = (updateActivity.ageGroup || '').split('-')
      console.log('Start:', start, 'End:', end)
      startAge.value = start
      endAge.value = end

      isEditMode.value = true
    } else {
      clearActivity()
      isEditMode.value = false
    }
  },
  { immediate: true, deep: true },
)

const makeRangeString = (start: string, end: string) => {
  const startNoSpaces = start.replace(/\s+/g, '')
  const endNoSpaces = end.replace(/\s+/g, '')
  return `${startNoSpaces} - ${endNoSpaces}`
}

onBeforeUnmount(() => {
  clearActivity()
})

const closeActivity = () => {
  console.log('Resetting activity')
  clearActivity()
  emit('toggleSlide')
}

interface QueryResultCreateActivity {
  createActivity: Activity
}

interface QueryResultUpdateActivity {
  updateActivity: Activity
}

const { mutate: createActivity } = useMutation<QueryResultCreateActivity>(
  CREATE_ACTIVITY_MUTATION,
)

const { mutate: updateActivityMutation } =
  useMutation<QueryResultUpdateActivity>(UPDATE_ACTIVITY_MUTATION)

const saveActivity = async () => {
  activity.value.ageGroup = makeRangeString(startAge.value, endAge.value)

  if (!isEditMode.value) {
    try {
      const data = await createActivity({
        createActivityInput: activity.value,
      })

      console.log('Activity data:', data)

      if (data?.data?.createActivity) {
        console.log('Activity created:', data.data.createActivity)
        emit('activityCreated', data.data.createActivity)
        emit('toggleSlide')
        clearActivity()
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      showAlert.value = true
    }
  } else {
    try {
      console.log('Updating activity [#PAYLOAD]: ', activity.value)
      console.log('with id:', props.updateActivity!.id)
      // casten in ee updateActivityInput
      const updateActivityInput: UpdateActivityInput = {
        ...activity.value,
        id: props.updateActivity!.id,
      }

      const data = await updateActivityMutation({
        updateActivityInput: updateActivityInput,
      })

      console.log('Activity data:', data)

      if (data?.data?.updateActivity) {
        console.log('Activity updated:', data.data.updateActivity)
        emit('activityUpdated', data.data.updateActivity)
        emit('toggleSlide')
        clearActivity()
      }
    } catch (error) {
      console.error('Error updating activity:', error)
      showAlert.value = true
    }
  }

  console.log('Activity data:', activity.value.locationId)
}
</script>
