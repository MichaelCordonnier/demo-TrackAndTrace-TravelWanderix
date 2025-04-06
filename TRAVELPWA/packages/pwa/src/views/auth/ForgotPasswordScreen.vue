<template>
  <div
    class="flex flex-col items-center justify-center mb-12 pb-60 pt-60 px-4 sm:px-6 lg:px-8 bg-gray-100"
  >
    <div
      class="flex flex-col items-center justify-center border-1 p-6 sm:p-8 md:p-12 rounded-md border-gray-200 bg-white shadow-lg w-full max-w-md lg:max-w-lg xl:max-w-x"
    >
      <div class="flex items-start flex-col">
        <h1 class="text-4xl font-bold mb-2 text-start">Reset Password</h1>
        <p class="text-lg text-start mb-6">
          Enter your email to reset your password
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col w-80%">
        <div>
          <label
            for="email"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Email address</label
          >
          <input
            type="text"
            v-model="email"
            id="email"
            placeholder="Enter your email"
            :class="[
              'mt-1 block w-full rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2 ',
              emailError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-orange-500 focus-visible:ring-orange-400',
            ]"
            @input="validateEmail"
          />
        </div>
        <p class="text-red-600" v-if="emailError">{{ emailError }}</p>
        <p class="text-red-600" v-if="error">{{ error.message }}</p>
        <div v-if="confirmation" class="text-gray-600">
          Password reset email sent!
        </div>
        <button type="submit" class="text-white">
          <p
            class="p-2 mt-4 bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 hover:shadow-lg duration-300 rounded"
          >
            Reset Password
          </p>
        </button>
        <div class="flex justify-center">
          <RouterLink
            class="mt-3 text-orange hover:underline inline-block rounded text-center text-sm text-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
            to="/auth/register"
          >
            Need to create an account?
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import useFirebase from '@/composables/useFirebase'

const { resetPassword } = useFirebase()

const email = ref('')
const error = ref<{ message: string } | null>(null)
const confirmation = ref(false)
const emailError = ref<string | null>(null)

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = null
  }
}

const handleSubmit = async () => {
  validateEmail()
  if (emailError.value) {
    return
  }
  try {
    await resetPassword(email.value)
    console.log('Password reset email sent!')
    confirmation.value = true
    error.value = null
  } catch (err) {
    error.value = { message: (err as Error).message }
    console.log('Error sending password reset email: ' + (err as Error).message)
    if ((err as Error).message === 'Firebase: Error (auth/invalid-email).') {
      error.value = { message: 'User not found' }
    }
  }
}
</script>
