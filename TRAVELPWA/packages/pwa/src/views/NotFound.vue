<template>
  <div
    class="w-full flex justify-center mb-12 pb-30 pt-20 px-4 sm:px-6 lg:px-8 bg-gray-100 flex flex-col items-center justify-center"
  >
    <img src="/not-found.png" alt="404 Not Found" class="mb-2 h-80" />
    <h1 class="text-4xl text-gray-800 font-bold">404</h1>
    <p class="text-gray-700 text-2xl">Page not found</p>
    <p class="text-gray-500 text-lg text-md mt-4 text-center">
      The page you are looking for does not exist.
    </p>
    <div
      @click="goBack"
      class="cursor-pointer p-2 mt-4 bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 hover:shadow-lg duration-300 rounded px-4 text-white mt-2"
    >
      Go back to home
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.push('/')
    }

    return {
      goBack,
    }
  },
})
</script>
