<template>
  <div>
    <button
      class="text-lg font-semibold bg-gray-100 w-full text-start p-4 rounded-md text-gray-700"
      @click="toggleDateFilter"
      :aria-expanded="isDateFilterOpen"
    >
      Filter by Range
    </button>
    <div
      v-if="isDateFilterOpen"
      class="w-full flex justify-center items-center"
    >
      <DateRangePicker
        :currentDate="new Date()"
        @updatePeriod="setPeriod"
      ></DateRangePicker>
    </div>

    <div class="mt-4">
      <button
        class="text-lg font-semibold bg-gray-100 w-full text-start p-4 rounded-md text-gray-700"
        @click="toggleStatusFilter"
        :aria-expanded="isFilterStatusOpen"
      >
        Filter by Status
      </button>

      <div
        v-if="isFilterStatusOpen"
        class="w-full flex justify-center items-center"
      >
        <div class="flex flex-wrap gap-2">
          <div
            v-for="status in statusFilters"
            :key="status.status"
            class="group hover:bg-gray-100 mt-2 flex items-center ps-4 border border-gray-200 rounded w-full"
          >
            <input
              class="hidden"
              type="checkbox"
              :id="status.status"
              :value="status.status"
              v-model="localStatusFilters"
            />
            <label
              class="flex items-center h-12 px-2 rounded cursor-pointer w-full"
              :for="status.status"
            >
              <span
                class="checkbox-inner flex items-center justify-center w-5 h-5 text-transparent border-2 border-gray-300 rounded-full aspect-ratio-square"
              ></span>
              <span
                :class="status.color"
                class="mx-4 p-2 rounded-lg px-4 w-full text-center"
              >
                {{ status.title }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="isFilterApplied"
      class="mt-4 text-lg font-semibold bg-red-100 w-full text-start p-4 rounded-md text-red-700"
      @click="resetFilters"
    >
      Reset Filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DateRangePicker from '../form/DateRangePicker.vue'

interface Filters {
  range: {
    start: Date | null
    end: Date | null
  }
  status: string[]
}

const isDateFilterOpen = ref(false)
const isFilterStatusOpen = ref(false)

const localRange = ref({ start: null as Date | null, end: null as Date | null })
const localStatusFilters = ref<string[]>([])

const statusFilters = ref([
  {
    title: 'closed',
    status: 'CLOSED',
    color: 'bg-red-200 text-red-700',
  },
  {
    title: 'open',
    status: 'OPEN',
    color: 'bg-green-200 text-green-700',
  },
  {
    title: 'full',
    status: 'FULL',
    color: 'bg-amber-200 text-amber-700',
  },
  {
    title: 'cancelled',
    status: 'CANCELLED',
    color: 'bg-gray-200 text-gray-700',
  },
  {
    title: 'finished',
    status: 'FINISHED',
    color: 'bg-gray-200 text-gray-700',
  },
])

const emit = defineEmits(['applyFilters'])

const filtersCurrently = computed<Filters>(() => ({
  range: localRange.value,
  status: localStatusFilters.value,
}))

const isFilterApplied = computed(() => {
  return (
    (localRange.value.start !== null && localRange.value.end !== null) ||
    localStatusFilters.value.length > 0
  )
})

console.log('filtersCurrently', {
  range: localRange.value,
  status: localStatusFilters.value,
})

watch(
  filtersCurrently,
  newFilters => {
    console.log('filters', newFilters)
    emit('applyFilters', newFilters)
  },
  { deep: true },
)

const toggleDateFilter = () => {
  isDateFilterOpen.value = !isDateFilterOpen.value
}

const toggleStatusFilter = () => {
  isFilterStatusOpen.value = !isFilterStatusOpen.value
}

const setPeriod = (period: { startDate?: Date; endDate?: Date }) => {
  console.log('setPeriod', period)
  if (period.startDate && period.endDate) {
    localRange.value = { start: period.startDate, end: period.endDate }
  }
}

const resetFilters = () => {
  localRange.value = { start: null, end: null }
  localStatusFilters.value = []
}
</script>

<style scoped>
input[type='checkbox'] + label span:first-of-type {
  background-color: #ffffff;
  box-shadow: 0 0 0 0.1rem #ebebeb;
}
input[type='checkbox']:checked + label span:first-of-type {
  background: linear-gradient(120deg, #ffd900, #ff9419);
  color: #fff;
  padding: 0.5rem;
  border: 0.2rem solid #ffffff;
  box-shadow: 0 0 0 0.1rem #ebebeb;
}

.checkbox-inner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: transparent no-repeat center;
}
</style>
