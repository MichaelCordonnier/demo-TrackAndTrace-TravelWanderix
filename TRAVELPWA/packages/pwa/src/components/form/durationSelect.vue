<template>
  <div>
    <label class="text-md block font-semibold tracking-wider text-gray-700">
      Select Duration (in hours)
    </label>
    <select
      v-model="selectedDuration"
      @change="updateDuration"
      class="mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <option v-for="hour in durationOptions" :key="hour" :value="hour">
        {{ hour }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const durationOptions = Array.from({ length: 10 }, (_, i) => i + 1)
const selectedDuration = ref(props.modelValue)

const updateDuration = () => {
  emit('update:modelValue', selectedDuration.value)
}
</script>
