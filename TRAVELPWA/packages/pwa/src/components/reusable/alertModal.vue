<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
  >
    <div
      class="mx-4 md:mx-auto relative mt-20 mb-32 bg-white rounded-lg shadow-md max-w-md border-1 border-gray-100"
    >
      <div class="absolute w-full flex justify-center -top-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-triangle-alert-icon text-white h-22 w-22"
        >
          <defs>
            <linearGradient id="gradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#e20000" />
              <stop offset="100%" stop-color="#ff7248" />
            </linearGradient>
          </defs>
          <path
            fill="url(#gradientRed)"
            stroke-width="1"
            d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
          ></path>
          <path fill="none" d="M12 9v4"></path>
          <path fill="none" d="M12 17h.01"></path>
        </svg>
      </div>
      <div class="p-6">
        <h2 class="text-2xl font-semibold mb-4 mt-8 text-center">
          {{ alertTitle }}
        </h2>
        <p class="mb-6 text-center mt-4">{{ alertText }}</p>
        <div class="flex flex-col">
          <button
            @click="close"
            class="w-full flex justify-center rounded-md mt-4 bg-gradient-to-br from-red-500 to-red-700 text-white hover:scale-102 cursor-pointer duration-300 p-4"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, watch } from 'vue'
import { TriangleAlert } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  alertTitle: string
  alertText: string
  buttonText: string
}>()
const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<style>
@layer utilities {
  .fill-url-gradient-red-orange {
    --tw-fill: url('#gradient-red-orange');
  }

  /* Gradient definition */
  #gradient-red-orange {
    background: linear-gradient(to right, #f56565, #fbbf24, #ed8936);
  }
}
</style>
