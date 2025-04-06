<template>
  <div class="bg-white rounded-xl p-6 h-max lg:h-[calc(100vh-123px)]">
    <div
      @click="goBack"
      class="flex items-center justify-start text-gray-800 font-semibold cursor-pointer hover:scale-105 duration-300 max-w-max"
    >
      <ArrowLeft class="h-8 w-8 text-gray-800" />
      <p class="p-2 text-xl">Back</p>
    </div>
    <div v-if="loading">
      <div class="animate-pulse mt-6">
        <div class="flex flex-col lg:flex-row gap-4 mt-4">
          <!-- Left Panel Skeleton -->
          <div
            class="bg-gray-100 p-4 rounded-md w-full lg:w-1/4 h-max lg:h-[calc(100vh-230px)]"
          >
            <div class="w-full h-200px bg-gray-300 rounded-md mt-2"></div>
            <div class="bg-white p-4 mt-4 rounded-md">
              <div class="h-5 w-1/3 bg-gray-300 rounded-md"></div>
              <div class="h-6 w-2/3 bg-gray-300 rounded-md mt-2"></div>
              <div class="h-5 w-1/2 bg-gray-300 rounded-md mt-4"></div>
              <div class="p-4 bg-gray-100 border-rd-md flex flex-col gap-2">
                <div class="flex items-center justify-between w-full">
                  <div class="h-5 w-1/4 bg-gray-300 rounded-md"></div>
                  <div class="h-5 w-20 bg-gray-300 rounded-md"></div>
                </div>
                <div class="flex items-center justify-between w-full">
                  <div class="h-5 w-1/4 bg-gray-300 rounded-md"></div>
                  <div class="h-5 w-20 bg-gray-300 rounded-md"></div>
                </div>
              </div>
              <div
                class="block w-full text-center mt-4 p-2 rounded-md bg-gray-300"
              ></div>
            </div>
          </div>

          <!-- Right Panel Skeleton -->
          <div class="flex flex-col bg-gray-100 w-full p-4 rounded-md">
            <div class="h-5 w-1/4 bg-gray-300 rounded-md mt-4"></div>
            <div
              class="bg-white rounded-md p-4 w-full mt-4 h-[calc(100vh-340px)] overflow-hidden overflow-y-scroll"
            >
              <div class="flex flex-col gap-4">
                <!-- Skeleton for each booking item -->
                <div class="group mb-2 bg-gray-100 rounded-md p-4">
                  <div
                    class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div>
                        <div class="h-4 w-20 bg-gray-300 rounded-md"></div>
                        <div class="h-4 w-36 bg-gray-300 rounded-md mt-2"></div>
                      </div>
                    </div>
                    <div
                      class="flex flex-col w-full lg:w-max sm:flex-row gap-2 sm:gap-10 my-2 mt-4 lg:mt-0 lg:my-0"
                    >
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-24 bg-gray-300 rounded-md"></div>
                      </div>
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-16 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="group mb-2 bg-gray-100 rounded-md p-4">
                  <div
                    class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div>
                        <div class="h-4 w-20 bg-gray-300 rounded-md"></div>
                        <div class="h-4 w-36 bg-gray-300 rounded-md mt-2"></div>
                      </div>
                    </div>
                    <div
                      class="flex flex-col w-full lg:w-max sm:flex-row gap-2 sm:gap-10 my-2 mt-4 lg:mt-0 lg:my-0"
                    >
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-24 bg-gray-300 rounded-md"></div>
                      </div>
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-16 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="group mb-2 bg-gray-100 rounded-md p-4">
                  <div
                    class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div>
                        <div class="h-4 w-20 bg-gray-300 rounded-md"></div>
                        <div class="h-4 w-36 bg-gray-300 rounded-md mt-2"></div>
                      </div>
                    </div>
                    <div
                      class="flex flex-col w-full lg:w-max sm:flex-row gap-2 sm:gap-10 my-2 mt-4 lg:mt-0 lg:my-0"
                    >
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-24 bg-gray-300 rounded-md"></div>
                      </div>
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <div class="h-4 w-16 bg-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <div class="flex flex-col lg:flex-row gap-4 mt-4">
        <div
          class="bg-gray-100 p-4 rounded-md w-full lg:w-1/4 h-max lg:h-[calc(100vh-230px)]"
        >
          <img
            :src="bookableActivity?.activity?.headerImageUrl"
            alt=""
            class="w-full h-200px border-rd-md mt-2 object-cover"
          />
          <div class="bg-white p-4 mt-4 rounded-md">
            <h1 class="font-medium text-gray-500">Booking</h1>
            <h1 class="font-bold text-lg text-gray-700">
              {{ bookableActivity?.name }}
            </h1>
            <p class="font-semibold mt-4 mb-2">
              {{
                bookableActivity?.startDate
                  ? formatDate(bookableActivity.startDate.toString())
                  : 'N/A'
              }}
            </p>
            <div class="p-4 bg-gray-100 border-rd-md flex flex-col gap-2">
              <div class="flex items-center justify-between w-full">
                <p class="font-semibold">Start hour:</p>
                <p class="bg-white p-2 rounded-md ml-2 w-20 text-center">
                  {{
                    bookableActivity?.startDate
                      ? formatTime(bookableActivity.startDate.toString())
                      : 'N/A'
                  }}
                </p>
              </div>
              <div class="flex items-center justify-between w-full">
                <p class="font-semibold">End hour:</p>
                <p class="bg-white p-2 rounded-md ml-2 w-20 text-center">
                  {{
                    bookableActivity?.startDate
                      ? formatTime(bookableActivity.endDate.toString())
                      : 'N/A'
                  }}
                </p>
              </div>
            </div>
            <div
              :class="{
                'bg-green-200': bookableActivity?.status === 'OPEN',
                'bg-red-200': bookableActivity?.status === 'CLOSED',
                'bg-yellow-200': bookableActivity?.status === 'FULL',
                'bg-gray-200':
                  bookableActivity?.status === 'FINISHED' ||
                  bookableActivity?.status === 'CANCELLED',
              }"
              class="block w-full text-center mt-4 p-2 rounded-md text-white font-medium"
            >
              <p
                v-if="bookableActivity?.status === 'OPEN'"
                class="text-green-700"
              >
                Open
              </p>
              <p
                v-else-if="bookableActivity?.status === 'CLOSED'"
                class="text-red-700"
              >
                Closed
              </p>
              <p
                v-else-if="bookableActivity?.status === 'FULL'"
                class="text-amber-600"
              >
                Full
              </p>
              <p
                v-else-if="bookableActivity?.status === 'FINISHED'"
                class="text-gray-700"
              >
                Finished
              </p>
              <p
                v-else-if="bookableActivity?.status === 'CANCELLED'"
                class="text-gray-700"
              >
                Cancelled
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-col bg-gray-100 w-full p-4 rounded-md">
          <p class="text-lg font-semibold mt-4">Bookings:</p>
          <div
            class="bg-white rounded-md p-4 w-full mt-4 h-[calc(100vh-340px)] overflow-hidden overflow-y-scroll"
          >
            <div v-if="bookableActivity?.bookings?.length">
              <div
                v-for="booking in bookableActivity?.bookings"
                :key="booking.id"
                class="group mb-4 bg-gray-100 rounded-md hover:shadow-md border-2 border-gray-100 hover:border-gray-300 cursor-pointer"
              >
                <RouterLink
                  :to="`/admin/booking/${booking.parentBooking?.id}`"
                  class="group inline-block p-4 w-full"
                >
                  <div
                    class="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <img
                        v-if="booking.user?.imageUrl"
                        :src="booking.user.imageUrl"
                        alt="User Image"
                        class="w-12 h-12 rounded-full object-cover"
                      />
                      <div
                        v-else
                        class="w-12 h-12 object-fit border-2 border-gray-200 rounded-full flex justify-center items-center bg-white"
                      >
                        <img
                          src="/lama.svg"
                          alt="Profile Picture"
                          class="object-fit w-8 h-8"
                        />
                      </div>
                      <div>
                        <p class="font-semibold">
                          {{ booking.user?.username || 'user' }}
                        </p>
                        <p class="text-gray-500">{{ booking.user?.email }}</p>
                      </div>
                    </div>
                    <div
                      class="flex flex-col w-full lg:w-max sm:flex-row gap-2 sm:gap-10 my-2 mt-4 lg:mt-0 lg:my-0"
                    >
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <p class="font-semibold">Price Paid:</p>
                        <p class="bg-white p-2 rounded-md px-4">
                          ${{ booking.totalPrice }}
                        </p>
                      </div>
                      <div
                        class="flex gap-2 justify-between w-full lg:w-max items-center"
                      >
                        <p class="font-semibold">People:</p>
                        <p class="bg-white p-2 rounded-md px-4">
                          {{ booking.how_many }}
                        </p>
                      </div>
                    </div>
                    <div>
                      <ChevronRight
                        class="hidden lg:block h-8 w-8 text-gray-800 -translate-x-2 group-hover:translate-x-0 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
            <div
              v-else
              class="flex-grow h-full w-full flex flex-col gap-2 items-center justify-center text-gray-700 opacity-70 border-rd-md text-center"
            >
              <p>No Bookings for this activity yet</p>
              <HeartCrack />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import router from '@/router'
import type { BookableActivity } from '@/interfaces/bookableActivity.interface'
import { useQuery } from '@vue/apollo-composable'
import { GET_BOOKABLE_ACTIVITY_BY_ID } from '@/graphql/activities/activities.admin.query'
import { ref, computed } from 'vue'
import { formatDate, formatTime } from '@/utils/converter'
import { ArrowLeft, ChevronRight, HeartCrack } from 'lucide-vue-next'

const bookableToFind = useRoute().params.slug as string

interface QueryResult {
  bookableActivity: BookableActivity
}

const { result, loading, error } = useQuery<QueryResult>(
  GET_BOOKABLE_ACTIVITY_BY_ID,
  {
    id: bookableToFind,
  },
  {
    fetchPolicy: 'cache-and-network',
  },
)

const bookableActivity = computed(() => result.value?.bookableActivity)

const goBack = () => {
  const route = useRoute()
  router.go(-1)
}
</script>
