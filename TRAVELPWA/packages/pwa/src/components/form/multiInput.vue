<template>
  <div>
    <label
      v-if="label"
      class="text-md block font-semibold tracking-wider text-gray-700 mb-1"
      >{{ label }}</label
    >
    <div class="flex items-center gap-2 mb-2">
      <input
        v-model="newInput"
        @keydown.enter="addInput"
        placeholder="Type and press Enter"
        class="block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
      />
      <Button
        @click="addInput"
        class="bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 transition-all duration-300 text-white rounded-full w-10 h-9 flex items-center justify-center"
      >
        <Plus
      /></Button>
    </div>
    <div class="bg-gray-100 p-3 rounded-md mt-2">
      <div class="flex gap-2 flex-wrap bg-white p-2 rounded-md">
        <div
          v-for="(item, index) in currentModelValue"
          :key="index"
          class="flex gap-2 items-center rounded-full pl-4 text-amber-700 bg-amber-200"
        >
          <span class="mr-2 p-1">{{ item }}</span>
          <div
            @click="removeInput(index)"
            class="cursor-pointer p-1 hover:bg-amber-300 rounded-full"
          >
            <X class="text-amber-700" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { Plus, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[] | undefined // Accepting undefined
  label?: string // Optional label
}>()

const emit = defineEmits(['update:modelValue'])

// Set a default value of an empty array if modelValue is undefined
const currentModelValue = computed(() => props.modelValue || [])

const newInput = ref('')

const addInput = () => {
  if (newInput.value.trim() !== '') {
    emit('update:modelValue', [...currentModelValue.value, newInput.value])
    newInput.value = '' // Clear input after adding
  }
}

const removeInput = (index: number) => {
  const updatedList = currentModelValue.value.filter((_, i) => i !== index)
  emit('update:modelValue', updatedList)
}
</script>
