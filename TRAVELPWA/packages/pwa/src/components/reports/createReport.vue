<template>
  <SideSlide @closeSlide="closeReport" @saveSlide="saveReport">
    <div
      class="w-full flex justify-between bg-gray-100 p-4 rounded-md mt-2 text-gray-700 font-semibold"
    >
      <h1>{{ isEditMode ? 'Update Report' : 'Create Report' }}</h1>
    </div>
    <div class="flex flex-col mt-4 gap-5 pb-40">
      <div>
        <inputField
          v-model="report.title"
          placeholder="Report Title"
          label="Report Title"
        ></inputField>
        <div v-if="errorMessageTitle" class="bg-red-500 text-white p-2 rounded">
          {{ errorMessageTitle }}
        </div>
      </div>
      <div>
        <TextField
          v-model="report.description"
          placeholder="Description"
          label="Description"
        ></TextField>
        <div
          v-if="errorMessageDescription"
          class="bg-red-500 text-white p-2 rounded"
        >
          {{ errorMessageDescription }}
        </div>
      </div>
    </div>
    <form @submit.prevent="saveReport"></form>
  </SideSlide>
</template>

<script setup lang="ts">
import SideSlide from '@/components/layout/sideSlide.vue'
import { ref, onBeforeUnmount, watch } from 'vue'
import TextField from '@/components/form/textField.vue'
import type { CreateReportInput, Report } from '@/interfaces/report.interface'
import inputField from '@/components/form/inputField.vue'
import { useMutation } from '@vue/apollo-composable'
import {
  UPDATE_REPORT_MUTATION,
  CREATE_REPORT_MUTATION,
} from '@/graphql/reports/report.query'

const emit = defineEmits(['toggleSlide', 'reportCreated', 'reportUpdated'])

const errorMessageTitle = ref('')

const errorMessageDescription = ref('')

const props = defineProps({
  updateReport: {
    type: Object as () => Report | undefined,
    required: false,
  },
  guideId: {
    type: String,
    required: true,
  },
  bookableTripId: {
    type: String,
    required: true,
  },
})

console.log(
  'updateReport: ',
  props.updateReport,
  'GuideID: ',
  props.guideId,
  'BookabletripID: ',
  props.bookableTripId,
)

const isEditMode = ref(false)

const report = ref<CreateReportInput>({
  id: '',
  title: '',
  date: new Date(),
  description: '',
  guideId: props.guideId,
  bookableTripId: props.bookableTripId,
})

const clearReport = () => {
  report.value = {
    id: '',
    title: '',
    date: new Date(),
    description: '',
    guideId: '',
    bookableTripId: '',
  }
}

watch(
  () => props.updateReport,
  updateReport => {
    if (updateReport && updateReport.title) {
      report.value = {
        id: updateReport.id || '',
        title: updateReport.title || '',
        date: new Date(updateReport.date) || new Date(),
        description: updateReport.description || '',
        guideId: updateReport.guideId || props.guideId,
        bookableTripId: updateReport.bookableTripId || props.bookableTripId,
      }
      isEditMode.value = true
    } else {
      clearReport()
      isEditMode.value = false
    }
  },
  { immediate: true, deep: true },
)

onBeforeUnmount(() => {
  clearReport()
})

const closeReport = () => {
  clearReport()
  emit('toggleSlide')
}

interface QueryResultCreateReport {
  createReport: Report
}

interface QueryResultUpdateReport {
  updateReport: Report
}

const { mutate: updateReportMutation } = useMutation<QueryResultUpdateReport>(
  UPDATE_REPORT_MUTATION,
)
const { mutate: createReportMutation } = useMutation<QueryResultCreateReport>(
  CREATE_REPORT_MUTATION,
)

const saveReport = async () => {
  //if values are empty show error message
  if (!report.value.title) {
    errorMessageTitle.value = 'Title is required'
  } else {
    errorMessageTitle.value = ''
  }

  if (!report.value.description) {
    errorMessageDescription.value = 'Description is required'
  } else {
    errorMessageDescription.value = ''
  }

  if (errorMessageTitle.value || errorMessageDescription.value) {
    //console.log('Error message:', errorMessageTitle.value, errorMessageDescription.value)
    return
  }

  console.log('isEditMode', isEditMode.value)

  if (!isEditMode.value) {
    try {
      const createReportInput = {
        ...report.value,
        guideId: props.guideId,
        bookableTripId: props.bookableTripId,
      }
      delete createReportInput.id
      console.log('createReportInput for creating', createReportInput)
      const data = await createReportMutation({
        createReportInput,
      })

      console.log('Report data:', data)

      if (data?.data?.createReport) {
        console.log('Report created:', data.data.createReport)
        emit('reportCreated', data.data.createReport)
        emit('toggleSlide')
        clearReport()
      }
    } catch (error) {
      console.error('Error creating report:', error)
    }
  } else {
    try {
      const data = await updateReportMutation({
        updateReportInput: report.value,
      })

      console.log('Report data:', data)

      if (data?.data?.updateReport) {
        console.log('Report updated:', data.data.updateReport)

        emit('reportUpdated', report.value)
        emit('toggleSlide')
        clearReport()
      }
    } catch (error) {
      console.error('Error updating report:', error)
    }
  }
  console.log('report data', report.value)
}
</script>
