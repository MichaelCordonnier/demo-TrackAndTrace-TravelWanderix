<template>
  <div class="w-full bg-gray-100 mb-12 pt-12 pb-30">
    <div class="container mx-auto px-4 sm:px-8 xl:px-40 2xl:px-80">
      <!-- Return Button -->
      <div class="min-w mb-10">
        <div
          @click="goBack"
          class="flex items-center justify-start text-gray-700 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max"
        >
          <ArrowLeft class="h-8 w-8 text-gray-700" />
          <p class="p-2 text-xl">Cancel</p>
        </div>
      </div>

      <div class="flex justify-between items-center relative mb-10">
        <!-- Line connecting steps -->
        <div
          class="absolute inset-x-3 left-0 top-1/3 origin-center transform origin-center -translate-y-1/2 justify-center mx-auto h-1 bg-white z-0"
        >
          <div
            class="absolute inset-x-3 h-1 origin-center bg-gradient-to-br from-amber-300 to-orange-400 transition-all duration-700 outline outline-white rounded-full"
            :style="{ width: `${(currentStep - 1) * 49}%` }"
          ></div>
        </div>

        <!-- Step 1 -->
        <div
          class="flex flex-col items-start z-10"
          :class="{ 'font-bold text-gray-700': currentStep === 1 }"
          @click="
            currentStep > 1 && currentStep !== 3 ? (currentStep = 1) : null
          "
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center bg-white"
            :class="{
              ' ring-4 ring-white bg-gradient-to-br from-amber-300 to-orange-400':
                currentStep === 1,
              'cursor-pointer bg-gradient-to-br from-amber-300 to-orange-400 ring-4 ring-white':
                currentStep === 2,
              'bg-gradient-to-br from-amber-300 to-orange-400 ring-4 ring-white':
                currentStep === 3,
            }"
          >
            <span
              class="text-black font-bold"
              :class="{ 'text-white': currentStep === 1 || 2 }"
              >1</span
            >
          </div>
          <span class="mt-2 text-sm">Add Person</span>
        </div>

        <!-- Step 2 -->
        <div
          class="flex flex-col items-center z-10 md:ml-14"
          :class="{ 'font-bold text-gray-700': currentStep === 2 }"
          @click="
            currentStep > 2 && currentStep !== 3 ? (currentStep = 2) : null
          "
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center bg-white"
            :class="{
              'ring-4 ring-white bg-gradient-to-br from-amber-300 to-orange-400':
                currentStep === 2,
              'cursor-pointer bg-gradient-to-br from-amber-300 to-orange-400':
                currentStep > 2 && currentStep != 3,
              'bg-gradient-to-br from-amber-300 to-orange-400 ring-4 ring-white':
                currentStep === 3,
            }"
          >
            <span
              class="text-black font-bold"
              :class="{
                'text-white': currentStep === 2,
                ' text-white': currentStep === 3,
                'text-gray': currentStep === 1,
              }"
              >2</span
            >
          </div>
          <span class="mt-2 text-sm">Pay</span>
        </div>

        <!-- Step 3 -->
        <div
          class="flex flex-col items-end z-10"
          :class="{ 'font-bold text-gray-700': currentStep === 3 }"
          @click="currentStep === 3 ? (currentStep = 3) : null"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center bg-white"
            :class="{
              'ring-4 ring-white bg-gradient-to-br from-amber-300 to-orange-400':
                currentStep === 3,
            }"
          >
            <span
              class="text-black font-bold"
              :class="{
                'text-white': currentStep === 3,
                'text-gray': currentStep === 2 || 1,
              }"
              >3</span
            >
          </div>
          <span class="mt-2 text-sm hidden sm:block">Confirmed Booking</span>
          <span class="mt-2 text-sm sm:hidden block">Confirmed</span>
        </div>
      </div>

      <!-- Loading and Error Messages -->
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else-if="error" class="text-center py-8 text-red-500">
        Error: {{ error.message }}
      </div>

      <!-- Booking Form Section -->

      <div v-if="trip && currentStep === 1">
        <form
          @submit.prevent="handleFormSubmit"
          class="flex flex-col md:flex-row gap-8 bg-white p-8 shadow-md rounded-md"
        >
          <div class="bg-white w-full md:w-1/2 border-left border-gray-200">
            <div class="mb-2">
              <h2 class="text-2xl font-semibold mb-4">Creating Booking for</h2>

              <!-- Display logged-in Firebase User Information -->
              <div
                class="rounded-md bg-gray-100 p-8 mb-2 border border-gray-200"
              >
                <label class="text-gray-700 whitespace-nowrap"
                  >Your account</label
                >
                <div
                  class="w-full px-4 py-2 border border-gray-300 bg-white rounded my-2"
                >
                  <p>{{ customUser?.username || 'Loading user...' }}</p>
                </div>
                <div
                  class="w-full px-4 py-2 border border-gray-300 bg-white rounded my-2"
                >
                  <p>{{ firebaseUser?.email || 'Loading user...' }}</p>
                </div>
              </div>
            </div>

            <!-- Extra Persons Input Section -->
            <div>
              <div
                v-for="(person, index) in newBooking.extraPersons"
                :key="index"
                class="grid grid-cols-1 md:grid-cols-[auto,1fr,1fr,auto] gap-4 items-center mb-1"
              >
                <div
                  class="relative rounded-md bg-gray-100 p-8 mb-2 border border-gray-200"
                >
                  <label class="text-gray-700 whitespace-nowrap"
                    >Extra Person {{ index + 1 }}</label
                  >
                  <input
                    v-model="person.name"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded my-2"
                    placeholder="Name"
                    required
                  />
                  <input
                    v-model="person.email"
                    type="email"
                    class="w-full px-4 py-2 border border-gray-300 rounded mb-2"
                    placeholder="Email"
                    required
                  />
                  <button
                    @click.prevent="removeExtraPerson(index)"
                    class="h-10 w-10 flex items-center justify-center group absolute top-3 right-3 rounded-full bg-gray-100 text-white rounded hover:bg-gray-200 transition duration-300 hover:scale-105 transform"
                  >
                    <Trash
                      class="text-gray-400 group-hover:text-gray-500 h-12"
                    />
                  </button>
                </div>
              </div>

              <!-- Add Extra Person Button -->
              <div
                v-if="
                  newBooking.extraPersons &&
                  newBooking.extraPersons.length + 1 < availablePlaces
                "
                class="w-full"
              >
                <button
                  @click.prevent="addExtraPerson"
                  class="w-full hover:scale-102 hover:shadow-lg duration-300 text-white p-2 bg-gradient-to-br from-amber-300 to-orange-400 mt-2 inline-block rounded"
                >
                  Add Extra Person
                </button>
              </div>
            </div>
          </div>

          <!-- Booking Details Section -->
          <div
            class="w-full md:w-1/2 h-full md:sticky top-10 bg-gray-100 md:p-4 rounded-md"
          >
            <div
              class="bg-white p-4 border border-gray-300 rounded-lg shadow-md md:sticky top-10"
            >
              <!-- <p class="text-red-500 mb-2">Debug Id: {{ trip?.id }}</p> -->
              <!-- <p
                :class="{
                  'text-green-500': trip?.status === 'OPEN',
                  'text-yellow-500': trip?.status === 'FULL',
                  'text-red-500': trip?.status === 'CLOSED',
                }"
                class="font-bold mb-2"
              >
                Status: {{ trip?.status }}
              </p> -->
              <img
                :src="trip?.trip.bannerImageUrl"
                alt="Trip Image"
                class="w-full h-48 object-cover rounded-md mb-4"
              />
              <h1 class="text-xl font-bold mb-2">
                {{ trip?.trip.name }}
              </h1>
              <p class="mb-2 text-md">
                <span class="font-bold">Start Date:</span>
                {{ formatDateWithoutHours(trip?.startDate || '') }}
              </p>
              <p class="mb-4 text-md">
                <span class="font-bold">End Date:</span>
                {{ formatDateWithoutHours(trip?.endDate || '') }}
              </p>
              <div class="mt-4 text-center">
                <!-- Conditionally styled header for extra persons -->
                <h2
                  v-if="newBooking.extraPersons?.length"
                  class="text-lg font-semibold flex flex-col md:flex-row items-start justify-start md:gap-2"
                >
                  <span>Places Still Open:</span>
                  <div>
                    <span class="font-bold text-amber-500">
                      {{
                        Math.max(
                          availablePlaces - 1 - newBooking.extraPersons.length,
                          0,
                        )
                      }}</span
                    >
                    / {{ trip?.bookableSettings.max_persons }}
                  </div>
                </h2>

                <!-- Default header if no extra persons -->
                <h2
                  v-else
                  class="text-lg font-semibold flex flex-col md:flex-row items-start justify-start md:gap-2"
                >
                  <span>Places Still Open:</span>
                  <div>
                    <span class="font-bold text text-amber-500">{{
                      availablePlaces - 1
                    }}</span>
                    / {{ trip?.bookableSettings.max_persons }}
                  </div>
                </h2>
              </div>
              <!-- Progress bar -->
              <div>
                <div
                  class="relative h-2 rounded-full bg-gray-200 overflow-hidden mt-2"
                >
                  <div
                    class="absolute top-0 left-0 h-2 bg-gradient-to-br from-amber-300 to-orange-400"
                    :style="{
                      width: `${((availablePlaces - 1 - (newBooking.extraPersons?.length ?? 0)) / trip?.bookableSettings.max_persons) * 100}%`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
            <!-- Total Price Display -->
            <div
              class="shadow-lg rounded-md p-8 mb-2 border border-gray-300 mt-4 bg-white"
            >
              <p class="text-lg font-medium">
                <span class="font-bold">Price:</span> {{ endPrice || '0' }}€
              </p>
              <div
                @click="handleFormSubmit"
                class="w-full flex justify-center rounded-md mt-4 bg-gradient-to-br from-green-400 to-green-600 text-white hover:scale-105 hover:shadow-lg cursor-pointer duration-300 p-4"
              >
                Pay
              </div>
            </div>
          </div>
        </form>
      </div>
      <!-- Payment Section -->
      <div v-if="currentStep === 2" class="flex flex-col">
        <div
          class="w-full mt-2 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto border-1 border-gray-100"
        >
          <p class="text-lg">
            <span class="font-bold">Price:</span> {{ endPrice || '0' }}€
          </p>
        </div>
        <div
          class="mt-2 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto border-1 border-gray-100"
        >
          <h2 class="text-2xl font-semibold mb-6">Payment Details</h2>
          <form class="space-y-4" @submit.prevent="handlePayment()">
            <!-- Card Number Field -->
            <div>
              <label for="cardNumber" class="block text-sm font-medium"
                >Card Number</label
              >
              <input
                v-model="paymentCred.cardNumber"
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                :class="[
                  'w-full px-3 py-2 rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
                  paymentErr.cardNumber
                    ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                    : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
                ]"
              />
              <p v-if="paymentErr.cardNumber" class="text-red-600">
                {{ paymentErr.cardNumber }}
              </p>
            </div>

            <!-- Cardholder Name Field -->
            <div>
              <label for="cardHolderName" class="block text-sm font-medium"
                >Cardholder Name</label
              >
              <input
                v-model="paymentCred.cardHolderName"
                type="text"
                id="cardHolderName"
                placeholder="Your Name"
                :class="[
                  'w-full px-3 py-2 rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
                  paymentErr.cardHolderName
                    ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                    : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
                ]"
              />
              <p v-if="paymentErr.cardHolderName" class="text-red-600">
                {{ paymentErr.cardHolderName }}
              </p>
            </div>

            <!-- Expiry Date and CVV Fields -->
            <div class="flex space-x-4">
              <div class="flex-1">
                <label for="expiryMonth" class="block text-sm font-medium"
                  >Month</label
                >
                <input
                  v-model="paymentCred.expiryMonth"
                  type="text"
                  id="expiryMonth"
                  placeholder="MM"
                  :class="[
                    'w-full px-3 py-2 rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
                    paymentErr.expiryMonth
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                      : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
                  ]"
                />
                <p v-if="paymentErr.expiryMonth" class="text-red-600">
                  {{ paymentErr.expiryMonth }}
                </p>
              </div>
              <div class="flex-1">
                <label for="expiryYear" class="block text-sm font-medium"
                  >Year</label
                >
                <input
                  v-model="paymentCred.expiryYear"
                  type="text"
                  id="expiryYear"
                  placeholder="YYYY"
                  :class="[
                    'w-full px-3 py-2 rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
                    paymentErr.expiryYear
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                      : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
                  ]"
                />
                <p v-if="paymentErr.expiryYear" class="text-red-600">
                  {{ paymentErr.expiryYear }}
                </p>
              </div>
              <div class="flex-1">
                <label for="cvv" class="block text-sm font-medium">CVV</label>
                <input
                  v-model="paymentCred.cvv"
                  type="text"
                  id="cvv"
                  placeholder="123"
                  :class="[
                    'w-full px-3 py-2 rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
                    paymentErr.cvv
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                      : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
                  ]"
                />
                <p v-if="paymentErr.cvv" class="text-red-600">
                  {{ paymentErr.cvv }}
                </p>
              </div>
            </div>
            <!-- Confirm and Pay Button -->
            <button type="submit" class="text-white w-full">
              <p
                class="w-full flex justify-center rounded-md mt-4 bg-gradient-to-br from-green-400 to-green-600 text-white hover:scale-102 cursor-pointer duration-300 p-4"
              >
                Pay
              </p>
            </button>
            <!-- Cancel Button -->
            <div
              @click="currentStep = 1"
              class="w-full flex justify-center rounded-md mt-4 border-2 border-gray-200 text-gray hover:border-gray-400 hover:text-gray-400 hover:scale-102 cursor-pointer duration-300 p-4"
            >
              cancel
            </div>
          </form>
        </div>
      </div>

      <!-- Confirmation Section -->
      <div
        v-if="currentStep === 3"
        class="relative mt-20 mb-32 bg-white rounded-lg shadow-md max-w-md mx-auto border-1 border-gray-100"
      >
        <div class="absolute w-full flex justify-center -top-7">
          <div
            class="w-15 h-15 shadow-md rounded-full bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-white flex items-center justify-center"
          >
            <Check class="text-white h-8 w-8" />
          </div>
        </div>
        <div class="p-6">
          <h2 class="text-2xl font-semibold mb-4 mt-8 text-center">
            Booking Confirmed
          </h2>
          <p class="mb-6 text-center mt-4">We look forward to welcoming you</p>
          <div class="flex flex-col">
            <button
              @click="goToBookableTrip"
              class="w-full flex justify-center rounded-md mt-4 bg-gradient-to-br from-green-400 to-green-600 text-white hover:scale-102 cursor-pointer duration-300 p-4"
            >
              Go to your Trip
            </button>
            <button
              @click="goBackToHome"
              class="w-full flex justify-center rounded-md mt-4 border-2 border-gray-200 text-gray hover:border-gray-400 hover:text-gray-400 hover:scale-102 cursor-pointer duration-300 p-4"
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AlertModal
    :visible="showAlertModal"
    :alertText="alertText"
    :alertTitle="alertTitle"
    :buttonText="alertButton"
    @close="handleAlertClose"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Trash, Check } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import router from '@/router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { GET_BOOKABLE_TRIP_BY_ID } from '@/graphql/trip/trip.query'
import { CREATE_BOOKING } from '@/graphql/booking/booking.admin.query'
import type { BookableTrip } from '@/interfaces/bookableTrip.interface'
import type { CreateBookingInput } from '@/interfaces/booking.create.interface'
import useFirebase from '@/composables/useFirebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { formatDateWithoutHours } from '@/utils/converter'
import { ArrowLeft } from 'lucide-vue-next'
import AlertModal from '@/components/reusable/alertModal.vue'
import useCustomUser from '@/composables/useCustomUser'

const { customUser } = useCustomUser()

const route = useRoute()
const bookableToFind = route.params.slug as string

// Firebase user info
const { firebaseUser } = useFirebase()

const auth = getAuth()
onAuthStateChanged(auth, user => {
  if (!user) {
    router.push('/login')
  } else {
    newBooking.value.fireAuthId = user.uid
  }
})

// Query for trip details
const { loading, error, result } = useQuery(
  GET_BOOKABLE_TRIP_BY_ID,
  { id: bookableToFind },
  { fetchPolicy: 'cache-and-network' },
)

const trip = ref<BookableTrip | null>(null)
const availablePlaces = ref<number>(0)
const bookings = ref<BookableTrip['bookings']>([])

watch(result, newResult => {
  const bookableTrip = newResult?.bookableTrip as BookableTrip
  if (bookableTrip) {
    trip.value = bookableTrip
    bookings.value = [...bookableTrip.bookings]
    availablePlaces.value = bookableTrip.bookableSettings.places
  }
})

const newBooking = ref<CreateBookingInput>({
  type: 'trip',
  fireAuthId: firebaseUser?.value?.uid || '',
  bookable_trip_id: bookableToFind,
  extraPersons: [],
  booking_trip_id: null,
  bookable_activity_id: null,
})

const endPrice = computed(() => {
  const pricePerPerson = trip.value?.bookableSettings.price || 0
  const extraPersonsCount = newBooking.value.extraPersons?.length || 0
  return pricePerPerson * (extraPersonsCount + 1)
})

// Step tracking
const currentStep = ref(1)

const validateExtraPersons = () => {
  return (newBooking.value?.extraPersons ?? []).every(person => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return person.name.trim() !== '' && emailPattern.test(person.email)
  })
}

const handleFormSubmit = () => {
  if (
    (newBooking.value.extraPersons?.length ?? 0) + 1 <=
    availablePlaces.value
  ) {
    if (validateExtraPersons()) {
      currentStep.value = 2 // Go to payment step
    } else {
      alertTitle.value = 'Validation error'
      alertText.value =
        'Please provide valid names and emails for all extra persons.'
      alertButton.value = 'OK'
      showAlertModal.value = true
    }
  } else {
    console.log('Not enough places available.')
  }
}

const paymentCred = ref({
  cardNumber: '1234567812345678',
  cardHolderName: 'Sugar Daddy',
  expiryMonth: '12',
  expiryYear: '2025',
  cvv: '123',
})

const paymentErr = ref({
  cardNumber: '',
  cardHolderName: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
})

const validatePaymentDetails = () => {
  let isValid = true
  if (!paymentCred.value.cardNumber) {
    paymentErr.value.cardNumber = 'required'
    isValid = false
  } else if (
    !/^\d{16}$|^\d{4}(\s?\d{4}){3}$/.test(paymentCred.value.cardNumber)
  ) {
    paymentErr.value.cardNumber = 'Invalid card number'
    isValid = false
  } else {
    paymentErr.value.cardNumber = ''
  }

  if (!paymentCred.value.cardHolderName) {
    paymentErr.value.cardHolderName = 'Required'
    isValid = false
  } else if (!/^[A-Za-z\s]+$/.test(paymentCred.value.cardHolderName)) {
    paymentErr.value.cardHolderName = 'Invalid card holder name'
    isValid = false
  } else {
    paymentErr.value.cardHolderName = ''
  }

  if (!paymentCred.value.expiryMonth) {
    paymentErr.value.expiryMonth = 'Required'
    isValid = false
  } else if (!/^\d{2}$/.test(paymentCred.value.expiryMonth)) {
    paymentErr.value.expiryMonth = 'Invalid expiry month'
    isValid = false
  } else {
    paymentErr.value.expiryMonth = ''
  }

  if (!paymentCred.value.expiryYear) {
    paymentErr.value.expiryYear = 'Required'
    isValid = false
  } else if (!/^\d{4}$/.test(paymentCred.value.expiryYear)) {
    paymentErr.value.expiryYear = 'Invalid expiry year'
    isValid = false
  } else {
    paymentErr.value.expiryYear = ''
  }

  if (!paymentCred.value.cvv) {
    paymentErr.value.cvv = 'Required'
    isValid = false
  } else if (!/^\d{3}$/.test(paymentCred.value.cvv)) {
    paymentErr.value.cvv = 'Invalid CVV'
    isValid = false
  } else {
    paymentErr.value.cvv = ''
  }

  return isValid
}

const handlePayment = () => {
  if (validatePaymentDetails()) {
    // Here, you would typically handle the payment logic.
    // Create booking
    createBooking()
    // For the sake of this example, we'll simulate successful payment
  }
}

const addExtraPerson = () => {
  if ((newBooking.value.extraPersons?.length ?? 0) < availablePlaces.value) {
    newBooking.value.extraPersons?.push({ name: '', email: '' })
  }
}

const removeExtraPerson = (index: number) => {
  newBooking.value.extraPersons?.splice(index, 1)
}

const goBack = () => {
  router.go(-1)
}

const { mutate: createBookingMutation } = useMutation(CREATE_BOOKING)

const createBooking = async () => {
  try {
    const response = await createBookingMutation({
      createBookingInput: newBooking.value,
    })

    const newBookingData = response?.data.createBooking
    console.log('response', response)
    if (newBookingData) {
      bookableTripId.value = newBookingData.id
      bookings.value.push(newBookingData)
      availablePlaces.value -= newBookingData.how_many
      newBooking.value.extraPersons = []
      console.log('Booking created successfully!')
      currentStep.value = 3 // Go to confirmation step
    }
  } catch (err) {
    console.error('Error creating booking:', err)
    if ((err as Error).message.includes('10 days')) {
      alertTitle.value = 'Problem'
      alertButton.value = 'Ok, I understand'
      alertText.value =
        'You can only book 10 days in advance. Contact an admin if you really want to make a booking'
    } else if ((err as Error).message.includes('past')) {
      alertTitle.value = 'Problem'
      alertButton.value = 'Ok, I understand'
      alertText.value = 'Booking is already finished'
    } else {
      alertTitle.value = 'Problem'
      alertButton.value = 'Ok'
      alertText.value = 'Failed to create booking. Please try again.'
    }
    showAlertModal.value = true
  }
}

const goBackToHome = () => {
  router.replace('/')
}

const goToBookableTrip = () => {
  router.replace('/mybookings/' + bookableTripId.value)
}

const showAlertModal = ref(false)
const alertText = ref('')
const alertTitle = ref('')
const alertButton = ref('')
const bookableTripId = ref('')

const handleAlertClose = () => {
  showAlertModal.value = false
}
</script>
