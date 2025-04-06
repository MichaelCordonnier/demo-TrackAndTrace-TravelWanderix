<template>
  <div class="relative">
    <label
      v-if="label"
      class="text-md block font-semibold tracking-wider text-gray-700"
      >{{ label }}</label
    >
    <input
      v-model="imageUrl"
      type="text"
      placeholder="Enter image URL"
      class="mb-2 mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400"
    />
    <button
      v-if="!disablePreview"
      @click="showPreview"
      class="bg-gradient-to-br from-amber-300 to-orange-400 p-x-4 p-y-2 border-rd-md text-white ml-auto hover:scale-105 transition-all duration-300 text-white py-2 px-4 rounded hover:bg-amber-600"
      :disabled="!imageUrl"
    >
      Preview Image
    </button>

    <div
      v-if="isPreviewVisible"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10"
      @click.self="closePreview"
    >
      <div class="relative">
        <img
          :src="imageUrl"
          alt="Image Preview"
          class="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
        />
        <button
          @click="closePreview"
          class="group absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
          aria-label="Close"
        >
          <X class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['update:modelValue', 'close'])
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  disablePreview: {
    type: Boolean,
    default: false,
  },
})

const imageUrl = ref(props.modelValue)
const isPreviewVisible = ref(false)

watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== undefined) {
      imageUrl.value = newValue
    }
  },
  { immediate: true },
)

watch(imageUrl, newValue => {
  emit('update:modelValue', newValue)
})

const showPreview = () => {
  if (imageUrl.value && !props.disablePreview) {
    isPreviewVisible.value = true
  }
}

const closePreview = () => {
  isPreviewVisible.value = false
  emit('close')
}
</script>
