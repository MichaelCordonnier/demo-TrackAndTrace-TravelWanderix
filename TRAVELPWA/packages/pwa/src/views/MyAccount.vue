<template>
  <div class="p-6 mx-auto max-w-4xl">
    <div class="mb-20 text-center">
      <h1 class="text-5xl font-extrabold tracking-tight mb-12 text-gray-800">
        {{ t('account') }}
      </h1>

      <!-- Profile Section -->
      <div
        class="bg-gray-100 shadow border-gray-200 border-1 rounded-2xl p-6 mb-8 text-center relative"
      >
        <img
          v-if="firebaseUser?.photoURL"
          :src="firebaseUser?.photoURL ?? 'https://via.placeholder.com/150'"
          alt="Default picture"
          class="bg-gray-100 object-cover w-24 h-24 rounded-full mx-auto border-4 border-gray-200 shadow-lg -mt-16 mb-4"
        />
        <div
          v-else
          class="w-24 h-24 object-fit mx-auto border-4 border-gray-200 shadow-lg -mt-16 mb-4 rounded-full flex justify-center items-center bg-white"
        >
          <img
            src="/lama.svg"
            alt="Profile Picture"
            class="object-fit w-14 h-14"
          />
        </div>
        <h2 class="text-2xl font-bold text-gray-800">
          {{ firebaseUser?.displayName ?? t('guestUser') }}
        </h2>
        <div v-if="customUser" class="flex mt-4 space-x-4 flex-row flex-col">
          <div class="text-center">
            <p class="text-lg font-medium text-gray-700">
              {{ customUser.email }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-lg font-medium text-gray-700">
              {{ customUser.gender }}
            </p>
            <!-- <p>{{ fireToken }}</p> -->
          </div>
        </div>
        <button
          @click="toggleProfileSettings"
          class="absolute hover:scale-110 hover:shadow-lg duration-300 top-4 right-4 cursor-pointer text-white font-medium bg-gradient-to-br from-amber-300 to-orange-400 p-2 rounded-full"
        >
          <Pencil />
        </button>
      </div>
    </div>

    <div class="mb-20 space-y-8">
      <div class="flex justify-center space-x-4">
        <button
          :class="{
            'bg-gradient-to-br from-amber-300 to-orange-400 text-white':
              selectedView === 'mybookings',
            'bg-gray-200 text-gray-800': selectedView !== 'mybookings',
          }"
          class="p-3 rounded shadow-md hover:shadow-lg hover:scale-105 duration-300"
          @click="selectedView = 'mybookings'"
        >
          {{ t('myBookings') }}
        </button>
        <button
          :class="{
            'bg-gradient-to-br from-amber-300 to-orange-400 text-white':
              selectedView === 'oldbookings',
            'bg-gray-200 text-gray-800': selectedView !== 'oldbookings',
          }"
          class="p-3 rounded shadow-md hover:shadow-lg hover:scale-105 duration-300"
          @click="selectedView = 'oldbookings'"
        >
          {{ t('oldBookings') }}
        </button>
      </div>

      <div v-if="selectedView === 'mybookings'">
        <div v-if="loading" class="text-center text-indigo-600 font-medium">
          <div>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 4xl:grid-cols-3 gap-8"
            >
              <div v-for="n in 4" :key="n" class="animate-pulse">
                <div class="h-80 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="error"
          class="text-center text-red-500 font-medium my-32"
        >
          {{ t('error') }}: {{ error.message }}
        </div>
        <div v-else>
          <div
            v-if="filteredBookings.length === 0"
            class="text-gray-500 text-center my-50"
          >
            {{ t('noBookingsFound') }}
          </div>
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 4xl:grid-cols-3 gap-8"
          >
            <TripBooking
              v-for="booking in filteredBookings"
              :key="booking.id"
              :booking="booking"
              :isOldBooking="false"
            />
          </div>
        </div>
      </div>
      <div v-else-if="selectedView === 'oldbookings'">
        <div v-if="loading">
          <div>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 4xl:grid-cols-3 gap-8"
            >
              <div v-for="n in 4" :key="n" class="animate-pulse">
                <div class="h-80 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="error"
          class="text-center text-red-500 font-medium my-32"
        >
          {{ t('error') }}: {{ error.message }}
        </div>
        <div v-else>
          <div
            v-if="filteredOldBookings.length === 0"
            class="text-gray-500 text-center my-50"
          >
            {{ t('noOldBookingsFound') }}
          </div>
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 4xl:grid-cols-3 gap-8"
          >
            <TripBooking
              v-for="booking in filteredOldBookings"
              :key="booking.id"
              :booking="booking"
              :isOldBooking="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="openProfileSettings">
    <ProfileFormEditOnly
      @close="closeProfileSettings"
      @update="refreshUserData"
    ></ProfileFormEditOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuery, useApolloClient } from '@vue/apollo-composable'
import { GET_ALL_BOOKINGS_BY_USER } from '@/graphql/user/user.query'
import useFirebase from '@/composables/useFirebase'
import useCustomUser from '@/composables/useCustomUser'
import { useRouter } from 'vue-router'
//import { LogOut } from 'lucide-vue-next'
import type { Booking } from '@/interfaces/booking.interface'
import TripBooking from '@/components/trips/TripBooking.vue'
import ProfileFormEditOnly from '@/components/reusable/ProfileFormEditOnly.vue'
import { Pencil } from 'lucide-vue-next'
import AlertModal from '@/components/reusable/alertModal.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { firebaseUser, logout, reloadUser } = useFirebase()

const fireToken = ref('')

const { client } = useApolloClient()

const { customUser, restoreCustomUser } = useCustomUser()
const { replace } = useRouter()

const uid = ref(firebaseUser.value?.uid || '')

const { result, loading, error, refetch } = useQuery(GET_ALL_BOOKINGS_BY_USER, {
  uid,
})

const bookings = computed(() => result.value?.userByFirebaseUid?.bookings || [])

const openProfileSettings = ref(false)

const toggleProfileSettings = () => {
  openProfileSettings.value = !openProfileSettings.value
}

const closeProfileSettings = async () => {
  openProfileSettings.value = false
  await restoreCustomUser()
  await reloadUser()
  refreshUserData()
}

const refreshUserData = () => {
  refetch()
  restoreCustomUser()
}

const filteredBookings = computed(() => {
  console.log('Bookings:', bookings.value)
  return bookings.value.filter((booking: Booking) => {
    return booking.bookableTrip?.status !== 'FINISHED'
  })
})

const filteredOldBookings = computed(() => {
  console.log('Bookings:', bookings.value)
  return bookings.value.filter((booking: Booking) => {
    return booking.bookableTrip?.status === 'FINISHED'
  })
})

onMounted(async () => {
  if (!uid.value) {
    console.error('User is not logged in')
  }
  restoreCustomUser()

  if (firebaseUser.value) {
    fireToken.value = await firebaseUser.value.getIdToken()
    //console.log('Firebase Token:', fireToken.value)
  }
})

// const logoutUser = () => {
//   logout().then(() => {
//     customUser.value = undefined
//     client.resetStore()
//     replace({ path: '/' })
//   })
// }

const selectedView = ref('mybookings')
</script>
