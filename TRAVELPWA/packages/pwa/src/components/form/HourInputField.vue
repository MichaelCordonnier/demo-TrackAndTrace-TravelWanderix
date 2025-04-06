<template>
  <div class="flex items-center gap-2">
    <button
      @click="remove"
      class="bg-gradient-to-br from-red-400 to-red-600 text-white p-2 rounded"
    >
      <Minus />
    </button>
    <input
      type="time"
      v-model="localValue"
      class="block rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 bg-white focus-visible:ring-amber-400"
      @input="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import { Minus } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue', 'remove'])

const localValue = ref(props.modelValue)

watch(localValue, newValue => {
  emit('update:modelValue', newValue)
})

const updateValue = (event: Event) => {
  const input = event.target as HTMLInputElement
  localValue.value = input.value
}

const remove = () => {
  emit('remove')
}
</script>
