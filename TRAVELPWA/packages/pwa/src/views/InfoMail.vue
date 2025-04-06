<template>
  <div
    class="flex flex-col items-center justify-center mb-12 pb-28 pt-28 px-4 sm:px-6 lg:px-8 bg-gray-100"
  >
    <div
      class="flex flex-col items-start justify-center border-1 p-6 bg-white sm:p-8 md:p-12 rounded-md border-gray-200 shadow-lg w-full max-w-md lg:max-w-lg xl:max-w-xl"
    >
      <h1 class="text-4xl font-bold mb-2">Application</h1>
      <p class="text-lg text-center mb-6">
        Tell us why you should be an ideal trip leader
      </p>
      <form
        @submit.prevent="sendApplication"
        class="flex flex-col space-y-4 w-full"
      >
        <div>
          <label
            for="email"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Email address</label
          >
          <input
            v-model="formData.email"
            type="text"
            id="email"
            placeholder="Your Email"
            :class="[
              'mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400',
              emailError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
          />
          <p v-if="emailError" class="text-red-600">{{ emailError }}</p>
        </div>
        <div>
          <label
            for="name"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Name</label
          >
          <input
            v-model="formData.name"
            type="text"
            id="name"
            placeholder="Your Name"
            :class="[
              'mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400',
              nameError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
          />
          <p v-if="nameError" class="text-red-600">{{ nameError }}</p>
        </div>
        <div>
          <label
            for="subject"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Subject</label
          >
          <input
            v-model="formData.subject"
            type="text"
            id="subject"
            placeholder="Subject"
            :class="[
              'mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400',
              subjectError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
          />
          <p v-if="subjectError" class="text-red-600">{{ subjectError }}</p>
        </div>
        <div>
          <label
            for="description"
            class="w-full text-md block font-semibold tracking-wider text-gray-700"
            >Description</label
          >
          <textarea
            v-model="formData.description"
            id="description"
            placeholder="Tell us why"
            :class="[
              'w-full focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400 p-2 border-2 border-gray-300 rounded',
              descriptionError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
          ></textarea>
          <p v-if="descriptionError" class="text-red-600">
            {{ descriptionError }}
          </p>
        </div>
        <button type="submit" class="text-white">
          <p
            class="p-2 bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 hover:shadow-lg duration-300 rounded"
          >
            Send Application
          </p>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  email: '',
  name: '',
  subject: '',
  description: '',
})

const emailError = ref('')
const nameError = ref('')
const subjectError = ref('')
const descriptionError = ref('')

const validateForm = () => {
  emailError.value = formData.value.email ? '' : 'Email is required'
  if (formData.value.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.value.email)) {
      emailError.value = 'Please enter a valid email address'
    } else {
      emailError.value = ''
    }
  }
  nameError.value = formData.value.name ? '' : 'Name is required'
  subjectError.value = formData.value.subject ? '' : 'Subject is required'
  descriptionError.value = formData.value.description
    ? ''
    : 'Description is required'

  return (
    !emailError.value &&
    !nameError.value &&
    !subjectError.value &&
    !descriptionError.value
  )
}

const sendApplication = async () => {
  if (!validateForm()) return

  console.log('Sending application:', formData.value)
  formData.value = {
    email: '',
    name: '',
    subject: '',
    description: '',
  }

  // try {
  //   const response = await fetch(
  //     'https://your-backend-service.com/send-email',
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         to: 'wanderix@service.be',
  //         ...formData.value,
  //       }),
  //     },
  //   )

  //   if (response.ok) {
  //     alert('Application sent successfully!')
  //   } else {
  //     alert('Failed to send application.')
  //   }
  // } catch (error) {
  //   console.error('Error sending application:', error)
  //   alert('An error occurred while sending the application.')
  // }
}
</script>
