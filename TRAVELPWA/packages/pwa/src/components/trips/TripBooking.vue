<template>
  <router-link
    :to="`/${isOldBooking ? 'oldbookings' : 'mybookings'}/${booking.id}`"
    class="group block bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 hover:transform hover:scale-102 transition-transform duration-300"
  >
    <div class="p-4 flex flex-col justify-between h-full">
      <!-- Title and Description -->
      <div class="space-y-3 mb-4">
        <h2 class="text-xl font-semibold text-gray-800 transition-colors">
          {{ booking.trip?.name }}
        </h2>
        <p class="text-sm text-gray-600">
          <span class="font-bold">Date:</span>
          {{ new Date(booking.startDate).toLocaleDateString() }} -
          {{ new Date(booking.endDate).toLocaleDateString() }}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-bold">Age Group:</span> {{ booking.trip?.ageGroup }}
        </p>

        <p class="text-sm text-gray-600">
          <span class="font-bold">Total Price:</span> ${{ booking.totalPrice }}
        </p>
      </div>

      <!-- Image Section -->
      <div class="relative w-full h-40">
        <img
          :src="booking.trip?.headerImageUrl"
          alt="Trip Image"
          class="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Booking } from '@/interfaces/booking.interface'

defineProps<{ booking: Booking; isOldBooking: boolean }>()
</script>
