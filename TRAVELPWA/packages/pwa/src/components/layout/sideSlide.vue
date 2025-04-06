<template>
  <div
    class="fixed overflow-hidden border border-amber ease-in-out right-0 top-0 w-100vw h-100vh bg-black bg-op-30 transition-all duration-100 z-999"
  >
    <transition name="slide">
      <div
        v-if="isVisible"
        ref="slide"
        class="bg-white absolute right-0 top-0 w-full md:w-500px md:max-w-[calc(100vw-15%)] p-4 h-100vh overflow-scroll"
      >
        <div
          class="w-full flex justify-between shadow-lg border rounded-md p-2 sticky top-0 z-1 bg-white"
        >
          <button
            class="bg-gradient-to-br from-green-400 to-green-600 p-x-4 p-y-2 text-white hover:scale-105 transition-all duration-300 text-white py-2 px-4 rounded hover:bg-amber-600"
            @click="saveSlide"
          >
            Save Changes
          </button>
          <button
            @click="closeSlide"
            class="group h-10 w-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
            aria-label="Close"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <slot></slot></div
    ></transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { X } from 'lucide-vue-next'

const slide = ref(null)

onClickOutside(slide, event => {
  event.stopPropagation()
  closeSlide()
})

const emit = defineEmits(['closeSlide', 'saveSlide'])

const isVisible = ref(false)

const closeSlide = () => {
  isVisible.value = false
  setTimeout(() => {
    emit('closeSlide')
  }, 300) // Match the duration of the transition
}

const saveSlide = () => {
  emit('saveSlide')
}

const hideBodyOverflow = () => {
  document.body.classList.add('overflow-hidden')
}

const showBodyOverflow = () => {
  document.body.classList.remove('overflow-hidden')
}
onMounted(() => {
  isVisible.value = true
  hideBodyOverflow()
})

onBeforeUnmount(() => {
  showBodyOverflow()
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>
