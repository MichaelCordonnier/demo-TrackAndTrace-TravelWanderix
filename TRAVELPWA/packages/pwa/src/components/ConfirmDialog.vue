<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-4 rounded shadow-lg">
      <p>{{ props.message }}</p>
      <div class="flex justify-end mt-4">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded mr-2"
          @click="onConfirm"
        >
          Yes
        </button>
        <button class="bg-gray-300 px-4 py-2 rounded" @click="onCancel">
          No
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  message: String,
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>
