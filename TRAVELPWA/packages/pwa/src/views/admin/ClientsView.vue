<template>
  <div>
    <div class="bg-white rounded-xl p-6 lg:h-[calc(100vh-130px)] flex flex-col">
      <div class="mb-4">
        <h1 class="font-bold text-xl text-gray-700">Clients</h1>
        <p>
          Here, you can view all registered users on your website, including
          their bookings or, if they are guides, their assignments.
        </p>
      </div>
      <div
        class="flex-1 flex flex-col lg:flex-row gap-10 w-full overflow-hidden"
      >
        <div
          class="lg:flex-1/2 xl:flex-2/3 bg-white border-rd-2xl p-4 h-[80vh]lg:h-full flex flex-col"
        >
          <div
            class="flex justify-between gap-2 mb-2 flex-col md:flex-row md:items-center"
          >
            <div class="relative">
              <input
                type="text"
                placeholder="Search"
                v-model="searchQuery"
                class="mb-2 mt-1 block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
              />
              <Search class="absolute right-3 top-3 w-6 h-6 text-gray-400" />
            </div>
            <div class="flex gap-2 h-fit w-full md:w-fit">
              <ButtonNormalLight
                @click="toggleFilter('ADMIN')"
                :isActive="filterRoles.includes('ADMIN')"
                label="Admins"
              ></ButtonNormalLight>
              <ButtonNormalLight
                @click="toggleFilter('USER')"
                :isActive="filterRoles.includes('USER')"
                label="Users"
              ></ButtonNormalLight>
              <ButtonNormalLight
                @click="toggleFilter('GUIDE')"
                :isActive="filterRoles.includes('GUIDE')"
                label="Guides"
              ></ButtonNormalLight>
            </div>
          </div>
          <div
            class="hidden lg:flex justify-between px-4 py-2 font-semibold bg-gray-100 border-rd-md mb-4"
          >
            <span class="w-40px mr-4"></span>

            <p class="flex-1 text-left">Email & Username</p>
            <p class="text-left">Role</p>
            <span class="ml-4 w-40px"></span>
          </div>

          <!-- Loading and User List -->
          <div
            v-if="loading"
            class="flex flex-col gap-2 overflow-y-scroll h-full"
          >
            <div
              v-for="n in 10"
              :key="n"
              class="flex items-center gap-4 p-4 border border-gray-300 rounded-md animate-pulse w-full border-rd-md"
            >
              <!-- Skeleton for User Image -->
              <div
                class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"
              ></div>

              <!-- Skeleton for User Info -->
              <div class="flex-1 truncate text-left space-y-2">
                <div class="h-4 bg-gray-200 rounded-md w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>

              <!-- Skeleton for User Role -->
              <div class="h-6 bg-gray-200 rounded-md w-16"></div>

              <!-- Skeleton for Icon -->
              <div class="w-6 h-6 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          <div
            v-else
            class="lg:flex-1 flex flex-col gap-2 overflow-y-scroll h-50vh lg:h-full pb-10"
          >
            <button
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user)"
              class="flex items-center gap-4 p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition w-full border-rd-md"
              :class="{
                'border-2 border-gray-500':
                  selectedUser && selectedUser.id === user.id,
                'border border-gray':
                  !selectedUser || selectedUser.id !== user.id,
              }"
            >
              <div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0">
                <img
                  v-if="user.imageUrl"
                  :src="user.imageUrl"
                  alt="User profile picture"
                  class="w-full h-full object-cover rounded-full"
                />
                <div v-else class="w-full h-full grid place-items-center">
                  <img
                    src="/lama.svg"
                    alt="User profile picture"
                    class="w-26px h-26px block"
                  />
                </div>
              </div>

              <div class="flex-1 truncate text-left">
                <h2 class="truncate">{{ user.email }}</h2>
                <span v-if="user.username">{{ user.username }}</span>
              </div>

              <p class="text-sm px-2 py-1 bg-gray-100 rounded-md">
                {{ user.role }}
              </p>

              <div>
                <Eye v-if="selectedUser && selectedUser.id === user.id" />
                <EyeOff v-else />
              </div>
            </button>
          </div>
        </div>

        <!-- User Details Section -->
        <div
          class="fixed top-0 left-0 w-full lg:relative lg:flex-1/3 bg-white p-4 z-998 lg:z-1 transition-transform duration-200 lg:translate-x-0 max-h-100vh overflow-y-scroll h-full"
          :class="{
            'translate-x-full lg:translate-x-0': !modalOpen && !selectedUser,
            'translate-x-0': modalOpen || selectedUser,
          }"
        >
          <button
            @click="toggleModal"
            class="group h-10 w-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110 lg:hidden ml-auto mb-4"
            aria-label="Close"
          >
            <X class="h-6 w-6" />
          </button>
          <div v-if="selectedUser">
            <div
              class="p-4 rounded-md flex flex-col gap-4 transition-all duration-300 ease-in-out relative"
              :class="isEditing ? 'bg-amber-100' : ' bg-gray-100'"
            >
              <div class="flex flex-col xl:flex-row gap-2 xl:items-center">
                <div class="flex flex-col w-fit lg:items-center">
                  <img
                    v-if="selectedUser.imageUrl"
                    :src="selectedUser.imageUrl"
                    alt="User profile picture"
                    class="h-25 w-25 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="h-25 w-25 rounded-full border-2 grid place-items-center"
                  >
                    <div class="rounded-full bg-gray-200">
                      <img
                        src="/lama.svg"
                        alt="User Profile Image"
                        class="w-90px h-90px object-fill p-4"
                      />
                    </div>
                  </div>
                  <div v-if="isEditing">
                    <ImagePicker
                      v-model="selectedUser.imageUrl"
                      :disable-preview="true"
                      class="mt-2"
                    />
                  </div>
                </div>
                <div class="flex-1 flex flex-col gap-2 text-gray-800">
                  <span>
                    <small>User</small>
                    <p>
                      {{ selectedUser.username || 'Not yet configured' }}
                    </p></span
                  >
                  <span class="w-90% text-truncate">
                    <small>Email</small>
                    <p>{{ selectedUser.email }}</p></span
                  >
                </div>
              </div>
              <div
                class="flex"
                :class="isEditing ? 'flex-col' : 'items-center gap-10'"
              >
                <div class="flex text-start">
                  <div
                    v-if="isEditing"
                    class="gap-2 flex flex-col text-gray-800 w-1/2"
                  >
                    <small>Role</small>
                    <DropDown
                      v-model="selectedUser.role"
                      :options="roleOptions"
                    />
                  </div>
                  <div v-else class="flex flex-col gap-2 text-gray-800">
                    <small>Role</small>
                    <p
                      class="text-sm px-2 py-1 bg-gray-100 rounded-md border border-gray-800"
                    >
                      {{ selectedUser.role }}
                    </p>
                  </div>
                </div>

                <!-- locale  -->

                <div v-if="isEditing" class="flex flex-col gap-2 w-1/2">
                  <small>Language</small>
                  <DropDown
                    v-model="selectedUser.locale"
                    :options="[
                      { value: 'en', label: 'English' },
                      { value: 'nl', label: 'Dutch' },
                      { value: 'zh', label: 'Chinese' },
                      { value: 'es', label: 'Spanish' },
                    ]"
                  />
                </div>
                <div v-else class="flex flex-col gap-2">
                  <small>Language</small>
                  <p
                    class="text-sm px-2 py-1 bg-gray-100 rounded-md border border-gray-800 w-fit"
                  >
                    {{ selectedUser.locale }}
                  </p>
                </div>
              </div>

              <!-- Edit and Save/Discard Buttons -->
              <div v-if="isEditing" class="flex gap-2 mt-2">
                <button
                  @click="saveChanges"
                  class="bg-gradient-to-br from-green-400 to-green-600 p-x-4 p-y-2 text-white hover:scale-105 transition-all duration-300 text-white py-2 px-4 rounded"
                >
                  Save
                </button>
                <button
                  @click="discardChanges"
                  class="bg-gradient-to-br from-red-400 to-red-600 text-white p-2 rounded px-4 hover:scale-105 transform duration-300 hover:shadow-lg"
                >
                  Discard
                </button>
              </div>
              <button
                v-else
                @click="isEditing = true"
                class="group hover:text-amber-500 bg-white flex items-center justify-center w-48px h-48px mb-4 block absolute top-4 lg:top-0 right-4 lg-right-0 border-rd-tr-md border-rd-lb-md"
              >
                <Pencil
                  class="group-hover:scale-105 transform duration-300 group-hover:bg-amber-100 rounded-md w-40px h-40px p-2"
                />
              </button>
            </div>

            <div
              v-if="
                selectedUser.role === 'GUIDE' &&
                selectedUser.assignedBookableTrips &&
                selectedUser.assignedBookableTrips.length > 0
              "
            >
              <h1 class="mt-4 mb-2 font-bold text-gray-800">Assigned Trips</h1>
              <div class="h-40vh overflow-y-scroll flex flex-col gap-2">
                <div
                  v-for="assignedTrip in selectedUser.assignedBookableTrips"
                  :key="assignedTrip.id"
                  class="w-full border bg-gray bg-op-30 flex justify-between h-130px relative border-rd-md transition-all duration-200 ease-in-out group hover:bg-gray-300 transition-all duration-300 ease-in-out"
                >
                  <div class="border-rd-md overflow-hidden flex w-full">
                    <img
                      v-if="assignedTrip.trip.headerImageUrl"
                      class="h-full w-75px object-cover block"
                      alt="Trip header image"
                      :src="assignedTrip.trip.headerImageUrl"
                    />
                    <div class="block flex justify-between w-full p-2">
                      <div class="">
                        <p>{{ assignedTrip.trip.name }}</p>
                        <small class="">{{
                          formatFullDate(assignedTrip.startDate)
                        }}</small>
                      </div>
                      <RouterLink
                        :to="`/admin/trip/bookable/${assignedTrip.id}`"
                        class="absolute w-full h-full top-0 left-0"
                      ></RouterLink>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="selectedUser.reports && selectedUser.reports.length > 0"
              >
                <h1 class="mt-4 mb-2 font-bold text-gray-800">
                  Written reports:
                </h1>
                <div class="h-40vh overflow-y-scroll flex flex-col gap-2">
                  <button
                    v-for="report in selectedUser.reports"
                    :key="report.id"
                    class="flex justify-between items-center bg-gray bg-op-30 border-rd-2xl mt-2 p-4 text-gray-800 text-left hover:bg-gray-300 transition-all duration-300 ease-in-out"
                    @click="showReportModal(report)"
                  >
                    <div class="flex-1">
                      <p>{{ report.title }}</p>
                      <small
                        >{{ report.bookableTrip.trip.name }} -
                        {{
                          formatFullDate(report.bookableTrip.startDate)
                        }}</small
                      >
                    </div>

                    <Eye class="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3
                class="mt-4 mb-2 font-bold text-gray-800"
                v-if="selectedUser.bookings.length > 0"
              >
                Reis Bookings
              </h3>
              <div
                class="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-80vh lg:max-h-50vh h-fit overflow-y-scroll"
              >
                <div
                  v-for="booking in selectedUser.bookings"
                  :key="booking.id"
                  class="w-full border-rd-2xl overflow-hidden relative group h-200px lg:h-unset"
                >
                  <img
                    v-if="booking.trip?.headerImageUrl"
                    :src="booking.trip.headerImageUrl"
                    alt="Trip header image"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span
                    class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent opacity-75"
                  ></span>
                  <p
                    class="absolute top-0 lg:top-2 lg:right-2 text-white text-wrap text-right text-bold flex gap-2 bg-black bg-opacity-10 backdrop-blur border-rd-md p-x-2 p-y-1 flex-wrap w-full lg:w-fit"
                  >
                    <span class="text-white text-shadow">{{
                      formatFullDate(booking.startDate)
                    }}</span>
                  </p>
                  <h1
                    class="absolute bottom-0 text-white font-bold text-xl text-wrap w-full p-2"
                  >
                    {{ booking.trip?.name }}
                  </h1>
                  <RouterLink
                    :to="`/admin/booking/${booking.id}`"
                    class="absolute w-full h-full top-0 left-0"
                  ></RouterLink>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="h-full w-full border border-gray-300 rounded-md flex items-center justify-center text-center"
          >
            <div class="grid place-items-center gap-2">
              <p>Select a user to see details</p>
              <Smile />
            </div>
          </div>
        </div>
      </div>
    </div>
    <ReportsModal
      v-if="isReportModalVisible && selectedReport"
      :report="selectedReport"
      :isVisible="isReportModalVisible"
      @Close="closeReportModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { GET_ALL_USERS } from '@/graphql/user/user.admin'
import { useMutation, useQuery } from '@vue/apollo-composable'
import type { User } from '@/interfaces/user.interface'
import {
  EyeOff,
  Eye,
  Smile,
  Squirrel,
  Pencil,
  X,
  Search,
} from 'lucide-vue-next'
import ImagePicker from '@/components/form/imagePicker.vue'
import MultiSelect from '@/components/form/multiSelect.vue'
import DropDown from '@/components/form/dropDown.vue'
import { UPDATE_USER } from '@/graphql/user/user.admin'
import { formatFullDate } from '@/utils/converter'
import ButtonNormalLight from '@/components/reusable/ButtonNormalLight.vue'
import ReportsModal from '@/components/reusable/reportsModal.vue'
import type { Report } from '@/interfaces/report.interface'

const { result, loading } = useQuery(GET_ALL_USERS, null, {
  fetchPolicy: 'cache-and-network',
})

const usersList = ref<User[]>([])
const searchQuery = ref('')
const filterRoles = ref<string[]>([])
const isReportModalVisible = ref(false)
const selectedReport = ref<Report | null>(null)

watch(result, newResult => {
  if (newResult?.allUsers) {
    usersList.value = newResult.allUsers
  }
})

const showReportModal = (report: Report) => {
  selectedReport.value = report
  isReportModalVisible.value = true
}

const closeReportModal = () => {
  isReportModalVisible.value = false
  selectedReport.value = null
}
const filteredUsers = computed<User[]>(() => {
  return usersList.value.filter(user => {
    const matchesRole =
      filterRoles.value.length === 0 || filterRoles.value.includes(user.role)
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.username &&
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesRole && matchesSearch
  })
})

const selectedUser = ref<User | null>(null)
const modalOpen = ref(false)
const isEditing = ref(false)
const originalUser = ref<User | null>(null)

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
  { value: 'GUIDE', label: 'Guide' },
]

const toggleModal = () => {
  modalOpen.value = !modalOpen.value
  if (selectedUser.value) {
    selectedUser.value = null
  }
  if (modalOpen.value) {
    // Prevent scrolling when modal is open (for mobile only)
    if (window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    }
  } else {
    document.body.style.overflow = '' // Re-enable scrolling
  }
}

const selectUser = (user: User) => {
  if (isEditing.value) {
    discardChanges()
  }
  toggleModal()
  selectedUser.value = { ...user }
  originalUser.value = { ...user }
  isEditing.value = false
}

const toggleFilter = (role: string) => {
  if (filterRoles.value.includes(role)) {
    filterRoles.value = filterRoles.value.filter(r => r !== role)
  } else {
    filterRoles.value.push(role)
  }
}

const { mutate: updateUser } = useMutation(UPDATE_USER)

const saveChanges = async () => {
  if (selectedUser.value) {
    try {
      // Call mutation to update the user in the backend
      await updateUser({
        updateUserInput: {
          id: selectedUser.value.id,
          uid: selectedUser.value.uid,
          email: selectedUser.value.email,
          gender: selectedUser.value.gender,
          locale: selectedUser.value.locale,
          role: selectedUser.value.role,
          imageUrl: selectedUser.value.imageUrl,
          username: selectedUser.value.username,
          assignedBookableTripIds: selectedUser.value.assignedBookableTripIds,
        },
      })

      // Find the index of the updated user in the users list
      if (selectedUser.value) {
        const index = usersList.value.findIndex(
          user => selectedUser.value && user.id === selectedUser.value.id,
        )
        if (index !== -1) {
          // Update the user data in the users list
          usersList.value = [
            ...usersList.value.slice(0, index),
            { ...selectedUser.value },
            ...usersList.value.slice(index + 1),
          ]
        }
      }

      console.log('Changes saved for', selectedUser.value)
      isEditing.value = false
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }
}

const discardChanges = () => {
  if (originalUser.value) {
    selectedUser.value = { ...originalUser.value }
  }
  isEditing.value = false
}
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}
</style>
