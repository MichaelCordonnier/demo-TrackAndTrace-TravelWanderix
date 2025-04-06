<template>
  <div class="bg-white rounded-xl p-6">
    <div
      @click="goBack"
      class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max"
    >
      <ArrowLeft class="h-8 w-8 text-gray-800" />
      <p class="p-2 text-xl">Back</p>
    </div>
    <div>
      <div v-if="loading">
        <div class="animate-pulse mt-6">
          <!-- Skeleton for the main header -->
          <div
            class="flex flex-col lg:flex-row gap-6 bg-gray-100 p-4 rounded-lg"
          >
            <!-- Skeleton for text content -->
            <div class="lg:w-2/3 bg-white p-4 rounded-lg">
              <div class="h-8 w-2/3 bg-gray-300 rounded-md mb-4"></div>
              <div class="h-6 w-1/4 bg-gray-300 rounded-md mb-4"></div>
              <div class="h-4 w-full bg-gray-200 rounded-md mb-2"></div>
              <div class="h-4 w-3/4 bg-gray-200 rounded-md mb-2"></div>
              <div class="h-4 w-1/2 bg-gray-200 rounded-md"></div>

              <!-- Skeleton for equipment provided -->
              <div class="mt-4">
                <div class="h-4 w-1/4 bg-gray-300 rounded-md mb-2"></div>
                <div class="flex flex-wrap gap-2">
                  <div class="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div class="h-6 w-24 bg-gray-200 rounded-full"></div>
                  <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              </div>

              <!-- Skeleton for safety measures -->
              <div class="mt-4">
                <div class="h-4 w-1/4 bg-gray-300 rounded-md mb-2"></div>
                <div class="flex flex-wrap gap-2">
                  <div class="h-6 w-28 bg-gray-200 rounded-full"></div>
                  <div class="h-6 w-32 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>

            <!-- Skeleton for image -->
            <div class="lg:w-1/3 bg-gray-200 rounded-lg h80 relative">
              <div
                class="absolute top-4 right-4 h-12 w-12 bg-gray-300 rounded-md"
              ></div>
            </div>
          </div>

          <!-- Skeleton for booking slots -->
          <div class="bg-gray-100 p-4 mt-6">
            <div class="flex justify-between mt-4">
              <div class="h-12 w-1/4 bg-gray-200 rounded-md mb-4"></div>
              <div class="h-12 w-12 bg-gray-200 rounded-full mb-4 mr-4"></div>
            </div>
            <div class="flex flex-col lg:flex-row">
              <div class="mt-2 bg-gray-200 p-4 rounded-lg w-full lg:w-5/7">
                <div class="h-6 w-1/4 bg-gray-300 rounded-md mb-4"></div>
                <div class="space-y-2">
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                  <div class="h-12 bg-gray-300 rounded-md"></div>
                </div>
              </div>
              <div
                class="ml-2 h-140 bg-gray-100 rounded-md hidden lg:block lg:w-1/3 p-4 pt-2"
              >
                <div class="space-y-2">
                  <div class="h-12 bg-gray-200 rounded-md"></div>
                  <div class="h-12 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="error">Error: {{ error.message }}</div>
      <div v-else-if="activityData">
        <div
          class="flex flex-col lg:flex-row gap-6 mt-4 bg-gray-100 p-4 rounded-lg"
        >
          <div class="lg:w-2/3 bg-white p-4 rounded-lg">
            <div
              class="flex items-start lg:items-center flex-col lg:flex-row justify-between border-b border-gray-300 pb-4"
            >
              <h1 class="font-bold text-2xl text-gray-700">
                {{ activityData.name }}
              </h1>
              <div
                class="flex gap-2 items-start mt-2 xl:mt-0 lg:items-end flex-col xl:flex-row"
              >
                <div
                  v-if="activityData.recommended"
                  class="rounded-lg bg-amber-200 p-2"
                >
                  <p class="text-lg text-amber-700 font-bold">Recommended</p>
                </div>
                <div class="p-2 bg-white border rounded-lg">
                  <p class="text-gray-700 text-lg px-4 font-bold">
                    {{ activityData?.bookingSettings?.price }} €
                  </p>
                </div>
              </div>
            </div>
            <p class="mt-4 text-gray-600 text-base sm:text-lg lg:text-lg">
              {{ activityData.description }}
            </p>
            <p class="mt-2 text-gray-700 text-sm sm:text-base">
              <strong>Age Group:</strong> {{ activityData.ageGroup }}
            </p>
            <div
              v-if="
                activityData.equipmentProvided &&
                activityData.equipmentProvided.length
              "
              class="mt-4"
            >
              <p class="text-gray-700 mb-2 text-sm sm:text-base">
                <strong>Equipment Provided:</strong>
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in activityData.equipmentProvided"
                  :key="item"
                  class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full shadow-sm"
                >
                  {{ item }}
                </span>
              </div>
            </div>
            <div
              v-if="
                activityData.safetyMeasures &&
                activityData.safetyMeasures.length
              "
              class="mt-4"
            >
              <p class="text-gray-700 mb-2 text-sm sm:text-base">
                <strong>Safety Measures:</strong>
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in activityData.safetyMeasures"
                  :key="item"
                  class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full shadow-sm"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="lg:w-1/3 relative max-h bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              v-if="
                activityData.headerImageUrl &&
                activityData.headerImageUrl !== 'placeholder'
              "
              :src="activityData.headerImageUrl"
              alt="Activity Header"
              class="w-full h-full bg-gray-200 object-cover rounded-lg"
              loading="lazy"
            />
            <div
              v-else
              class="bg-gray-200 w-full h-full grid place-items-center rounded-lg"
            >
              <ImageOff class="h-8 w-8 text-gray-300" />
            </div>
            <button
              class="absolute top-4 right-4 group text-gray-400 hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px mb-4 block"
              @click="toggleSlideUpdate"
            >
              <Pencil
                class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
              />
            </button>
          </div>
        </div>
        <div class="mt-4 bg-gray-100 p-4 rounded-lg">
          <bookableViewer
            :bookableItems="activityData.bookableActivities"
            :parentItem="activityData"
          ></bookableViewer>
        </div>
      </div>
      <!-- peak error handling -->
      <div v-else class="text-red"><p>Error</p></div>
    </div>
    <CreateUpdateActivity
      v-if="isEditing"
      @toggleSlide="toggleSlideUpdate"
      @activityUpdated="updateActivity"
      :updateActivity="activity"
    ></CreateUpdateActivity>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import router from '@/router'

import { computed, reactive, ref, watch } from 'vue'
import { ArrowLeft, Pencil, ImageOff } from 'lucide-vue-next'
import { useQuery } from '@vue/apollo-composable'
import { GET_ACTIVITY_BY_ID } from '@/graphql/activities/activities.admin.query'
import CreateUpdateActivity from './createUpdateActivity.vue'
import type { Activity } from '@/interfaces/activity.interface'
import bookableViewer from '@/components/layout/bookableViewer.vue'
const route = useRoute()

interface QeuryResult {
  activity: Activity
}

const activityData = ref<Activity | undefined>(undefined)

const isEditing = ref(false)
const toggleSlideUpdate = () => {
  isEditing.value = !isEditing.value
  // if (!isEdtingOrCreate.value) {
  //   selectedActivity.value = undefined
  // }
}

const actvityToFind = route.params.slug as string
if (!actvityToFind) {
  throw new Error('Activity ID is required')
}

const { loading, error, result } = useQuery<QeuryResult>(
  GET_ACTIVITY_BY_ID,
  {
    id: actvityToFind,
  },
  {
    fetchPolicy: 'cache-and-network',
  },
)

const activity = computed(() => result.value?.activity as Activity)
console.log('activityData', activityData)

const updateActivity = (updatedActivity: Activity) => {
  console.log('trying to update activity...')
  console.log('updatedActivity', updatedActivity)

  activityData.value = updatedActivity
}

const goBack = () => {
  router.go(-1)
}

watch(activity, newVal => {
  activityData.value = newVal
  console.log('Bookables', activityData.value.bookableActivities)
})
</script>
