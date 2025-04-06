<template>
  <div
    class="border relative border-gray-200 p-4 bg-white mb-4 rounded-lg shadow-md"
  >
    <div class="mb-4 absolute -top-4 right-4">
      <div
        v-if="trip.status === StatusBookables.OPEN"
        class="bg-green-200 px-2 py-1 rounded-full text-center p-10"
      >
        <p class="text-green-700 px-4">{{ t('status.open') }}</p>
      </div>
      <div
        v-if="trip.status === StatusBookables.CLOSED"
        class="bg-red-200 px-2 py-1 rounded-full text-center p-10"
      >
        <p class="text-red-700 px-4">{{ t('status.closed') }}</p>
      </div>
      <div
        v-if="trip.status === StatusBookables.FULL"
        class="bg-yellow-200 px-2 py-1 rounded-full text-center px-4"
      >
        <p class="text-yellow-700 px-4">{{ t('status.full') }}</p>
      </div>
    </div>
    <div class="mb-2 flex justify-between">
      <div>
        <p class="text-gray-700 flex flex-col lg:block">
          <span class="font-bold">{{ t('startDate') }}: </span>
          {{ formatFullDate(trip.startDate) }}
        </p>
        <p class="text-gray-700 flex flex-col lg:block">
          <span class="font-bold">{{ t('endDate') }}: </span>
          {{ formatFullDate(trip.endDate) }}
        </p>
        <p class="text-gray-700">
          <span class="font-bold">{{ t('price') }}:</span> ${{
            trip.bookableSettings.price
          }}
        </p>
      </div>
      <div class="flex flex-col h-auto items-center justify-center">
        <router-link
          class="hover:scale-105 hover:shadow-lg duration-300 text-white p-2 bg-gradient-to-br from-amber-300 to-orange-400 w-max mt-2 inline-block rounded ml-4 px-8"
          :to="{
            name: 'bookabletripbyname',
            params: { slug: trip.id },
          }"
          >{{ t('view') }}</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { StatusBookables } from '@/views/trips/_slug.vue'
import { formatFullDate } from '@/utils/converter'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  trip: {
    id: string
    startDate: string
    endDate: string
    bookableSettings: {
      price: number
    }
    status: StatusBookables
  }
}>()
</script>

<style scoped></style>
