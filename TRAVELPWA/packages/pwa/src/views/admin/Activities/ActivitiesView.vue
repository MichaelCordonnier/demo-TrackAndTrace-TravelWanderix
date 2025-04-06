<template>
  <div class="bg-white rounded-xl p-6">
    <h1 class="font-bold text-xl text-gray-700">Activities</h1>
    <p>Curate and Customize Your Activities Here</p>

    <div class="flex justify-between items-center mb-4 mt-2 pr-3">
      <div class="relative">
        <input
          type="text"
          placeholder="Search"
          class="mb-2 mt-1 block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
          v-model="searchQuery"
        />
        <Search class="absolute right-3 top-3 w-6 h-6 text-gray-400" />
      </div>
      <button
        class="w-12 h-12 font-bold text-white flex items-center justify-center hover:scale-105 hover:shadow-lg transform duration-300"
        @click="toggleSlide"
        :class="[
          isEditingOrCreate
            ? 'bg-gradient-to-br from-gray-300 to-gray-400 rounded-full'
            : 'bg-gradient-to-br from-amber-300 to-orange-400 rounded-full',
        ]"
      >
        <Plus class="w-8 h-8" />
      </button>
    </div>
    <div
      class="grid h-[calc(100vh-305px)] py-4 overflow-hidden overflow-y-scroll"
    >
      <div v-if="loading">
        <ul
          class="grid gap-2 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <li v-for="n in 12" :key="n" class="animate-pulse">
            <div class="border rounded-lg w-full h-45 bg-gray-200"></div>
            <div class="bg-gray-200 mt-2 h-5 w-3/4 rounded-md mb-2"></div>
          </li>
        </ul>
      </div>
      <div v-else-if="error" class="text-red font-semibold">
        Error: {{ error.message }}
      </div>
      <div v-else>
        <ul
          class="grid gap-3 transition-all ease-in-out duration-200 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <li
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="relative w-full h-full flex flex-col"
          >
            <div class="flex-grow relative">
              <div class="w-full h-50 bg-gray-200 rounded-lg">
                <img
                  v-if="
                    activity.headerImageUrl &&
                    activity.headerImageUrl !== 'placeholder'
                  "
                  :src="getImageUrl(activity.headerImageUrl || '')"
                  alt="Activity Header Image"
                  class="w-full h-50 object-cover rounded-lg"
                  loading="lazy"
                />
                <div
                  v-else
                  class="bg-gray-200 w-full h-50 grid place-items-center rounded-lg"
                >
                  <ImageOff class="h-8 w-8 text-gray-300" />
                </div>
              </div>
            </div>
            <h2 class="text-black py-2 overflow-hidden text-truncate">
              {{ activity.name }}
            </h2>
            <div
              class="flex gap-2 absolute left-2 bottom-8 align-items-center w-full text-gray-400"
            >
              <router-link
                class="group hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px block"
                :to="{ name: 'admin-activity', params: { slug: activity.id } }"
                ><BookCopy
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
              /></router-link>
              <button
                class="group hover:text-amber-500 bg-white rounded-md flex items-center justify-center w-48px h-48px mb-4 block"
                @click="toggleUpdate(activity)"
              >
                <Pencil
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
                />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <CreateUpdateActivity
      v-if="isEditingOrCreate"
      @toggleSlide="toggleSlide"
      @activityCreated="addActivity"
      @activityUpdated="updateActivity"
      :updateActivity="selectedActivity"
    ></CreateUpdateActivity>
  </div>
</template>
<script setup lang="ts">
import { GET_ALL_ACTIVITIES } from '@/graphql/activities/activities.admin.query'
import type { Activity } from '@/interfaces/activity.interface'
import { useQuery } from '@vue/apollo-composable'
import { computed, ref, watch } from 'vue'
import { getImageUrl } from '@/utils/img'
import CreateUpdateActivity from './createUpdateActivity.vue'
import { BookCopy, ImageOff, Pencil, Plus, Search } from 'lucide-vue-next'

const isEditingOrCreate = ref(false)
const selectedActivity = ref<Activity | undefined>(undefined)
const searchQuery = ref('')

const toggleSlide = () => {
  isEditingOrCreate.value = !isEditingOrCreate.value
  if (!isEditingOrCreate.value) {
    selectedActivity.value = undefined
  }
}

const toggleUpdate = (activity: Activity) => {
  selectedActivity.value = activity
  isEditingOrCreate.value = !isEditingOrCreate.value
}

const updateActivity = (updatedActivity: Activity) => {
  const index = localActivities.value.findIndex(
    activity => activity.id === updatedActivity.id,
  )

  if (index !== -1) {
    localActivities.value[index] = updatedActivity
  }
}

interface QueryResultActivities {
  activities: Activity[]
}

const { loading, error, result } = useQuery<QueryResultActivities>(
  GET_ALL_ACTIVITIES,
  null,
  {
    fetchPolicy: 'cache-and-network',
  },
)

const activities = computed(() => result.value?.activities || [])
const localActivities = ref<Activity[]>([])

const addActivity = (newActivity: Activity) => {
  localActivities.value = [...localActivities.value, newActivity]
}

const filteredActivities = computed(() => {
  if (!searchQuery.value) {
    return localActivities.value
  }
  return localActivities.value.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

watch(activities, newActivities => {
  localActivities.value = [...newActivities]
})
</script>
