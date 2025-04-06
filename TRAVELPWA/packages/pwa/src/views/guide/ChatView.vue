<template>
  <div class="bg-white rounded-xl p-6 md:h-[calc(100vh-130px)]">
    <div class="flex h-full gap-4" v-if="!isLoadingChat">
      <div class="h-full w-full md:w-4/12 flex flex-col">
        <div
          class="w-full aspect-ratio-video border flex flex-col justify-center items-center gap-4 border-rd-md mb-4 bg-gradient-to-br from-amber-300 to-orange-400 bg-opacity-30 p-4"
        >
          <div class="flex flex-col justify-center items-center gap-2">
            <div class="relative">
              <img
                v-if="customUser?.imageUrl"
                :src="customUser.imageUrl"
                alt="User image"
                class="w-25 h-25 rounded-full object-cover"
              />
              <div
                v-else
                class="h-25 w-25 flex bg-white items-center justify-center rounded-full"
              >
                <img
                  src="/lama.svg"
                  alt="User image"
                  class="w-14 h-14 object-fit"
                />
              </div>
              <span
                class="bg-green w-4 h-4 absolute right-1 bottom-1 border-rd-full border border-white border-2"
              ></span>
            </div>

            <h1 v-if="customUser" class="font-bold text-white">
              {{ getUsernameOrEmail(customUser) }}
            </h1>
            <p class="bg-white p-y-2 p-x-4 border-rd-md text-sm text-orange-6">
              {{ customUser?.role }}
            </p>
          </div>
        </div>
        <div v-if="customUser?.role === 'GUIDE'">
          <button
            @click="startChatWithTripLeader"
            class="p-2 text-white rounded block mb-2 bg-green-400 text-white hover:scale-102 cursor-pointer duration-300 px-6 w-full"
          >
            {{ t('ChatTourOperator') }}
          </button>
        </div>
        <div>
          <button
            class="flex gap-2 w-full relative mb-2 border border-gray-200 border-rd-md"
            @click="setFilter"
          >
            <span
              class="absolute top-0 h-full w-1/2 bg-gray-200 z-1 border-rd-md transition-all duration-300 block"
              :class="[activeFilter === 'all' ? 'left-0' : 'right-0']"
            ></span>
            <span
              class="flex-1 p-y-2 hover:scale-105 transition-all duration-300 ease-in-out z-2"
              :class="[activeFilter === 'all' ? 'text-black' : 'text-black']"
            >
              {{ t('active') }}
            </span>
            <span
              :class="[
                'flex-1 p-y-2 hover:scale-105 transition-all duration-300 ease-in-out z-2',
                activeFilter === 'finished' ? 'text-black' : 'text-black',
              ]"
            >
              {{ t('archived') }}
            </span>
          </button>
        </div>
        <div>
          <button
            @click="toggleFilterModal"
            :class="[
              'flex gap-2 w-fit p-2 rounded text-black mb-2 hover:bg-gray-200 transition-all duration-300 ease-in-out hover:scale-105 ',
              showFilterModal ? 'bg-gray-200' : 'bg-white',
            ]"
          >
            <Filter />
          </button>
          <div
            v-if="showFilterModal"
            class="flex flex-col gap-2 transition-all duration-300 ease-in-out p-2 border-rd-md mb-4 bg-gray-200"
          >
            <input
              type="text"
              placeholder="Search chatrooms"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
              v-model="searchQuery"
            />
            <div class="flex gap-2">
              <button
                @click="setActiveSort('activity')"
                :class="[
                  'p-2 border border-gray-200 border-rd-md border-2 border-white hover:scale-105 transition-all duration-300 ease-in-out',
                  activeSort === 'activity' ? 'bg-gray-200 ' : 'bg-white',
                ]"
              >
                {{ t('sort_by_recent_activity') }}
              </button>
              <button
                @click="setActiveSort('tripDate')"
                :class="[
                  'p-2 border border-gray-200 border-rd-md border-2 border-white hover:scale-105 transition-all duration-300 ease-in-out',
                  activeSort === 'tripDate' ? 'bg-gray-200 ' : 'bg-white',
                ]"
              >
                {{ t('sort_by_date') }}
              </button>
            </div>
          </div>
        </div>
        <!-- selectable rooms  -->

        <div class="h-50vh md:flex-1 overflow-x-scroll flex flex-col gap-2">
          <div
            v-for="chatroom in filteredChatrooms"
            :key="chatroom.id"
            class="relative w-full"
          >
            <button
              @click="joinChatroom(chatroom.id)"
              :class="[
                'block w-full text-left  rounded bg-gray-100 relative flex  gap-2 p-y-2 p-x-2 group flex-col md:flex items-start',
                chatroom.status === 'finished' ? 'bg-gray-300 opacity-60' : '',
              ]"
            >
              <p
                class="p-y-2 p-x-1 border-rd-md bg-amber-400 text-white text-sm w-27 text-center"
              >
                {{ splitdateFromNameReturnDate(chatroom.name) }}
              </p>
              <div class="w-full flex items-center justify-between">
                <div class="flex flex-col">
                  <div class="flex gap-2">
                    <p
                      class="text-truncate group-hover:ml-2 transition-all duration-300 ease-in-out flex justify-between"
                    >
                      {{ splitdateFromNameReturnName(chatroom.name) }}
                    </p>
                    <div
                      class="relative"
                      v-if="notificationCounts[chatroom.id] > 0"
                    >
                      <span
                        class="bg-red-200 animate-ping w-4 h-4 border-rd-full block"
                      >
                      </span>
                      <span
                        class="bg-red-500 w-3 h-3 border-rd-full absolute top-0.75/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 block"
                      >
                      </span>
                    </div>
                  </div>

                  <p
                    class="text-sm text-gray-500 overflow-hidden text-truncate w-75%"
                    v-if="latestMessages[chatroom.id]"
                  >
                    {{ latestMessages[chatroom.id].content }}
                  </p>
                </div>
                <ChevronRight
                  class="h-6 w-6 text-gray-500 group-hover:text-black transition-all duration-300 ease-in-out"
                />
              </div>
            </button>
            <span
              v-if="newChatrooms.includes(chatroom.id)"
              class="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
            >
              New
            </span>
          </div>
        </div>
      </div>
      <!-- CHATVIEUW -->

      <div
        class="w-full md:w-8/12 border-rd-md p-4 flex flex-col fixed top-0 h-full md:relative left-0 z-999 bg-black md:bg-white bg-opacity-50 md:bg-opacity-100 backdrop-blur-2"
        v-if="currentRoomId"
      >
        <div class="w-full h-full">
          <div v-if="!showModal" class="flex flex-col h-full">
            <div
              class="flex items-center mb-4 bg-gray-100 border-rd-md p-2 p-x-4 gap-2 bg-gradient-to-br from-amber-300 to-orange-400 text-white justify-between"
            >
              <div class="flex flex-wrap items-center gap-2">
                <button
                  class="p-2 hover:scale-105 transition-all duration-300 ease-in-out"
                  @click="openChatroomInfo"
                >
                  <Info />
                </button>
                <h1>
                  {{
                    chatrooms.find(room => room.id === currentRoomId)?.name ||
                    'Unknown Room'
                  }}
                </h1>
              </div>
              <button
                @click="leaveChatroom()"
                class="p-2 hover:scale-105 hover:scale-105 transition-all duration-300 ease-in-out md:hidden"
              >
                <Undo2 />
              </button>
            </div>
            <div
              class="flex flex-1 flex-col gap-4 bg-white p-4 border-rd-md overflow-y-scroll"
            >
              <div
                v-for="message in reversedMessages"
                :key="message.content"
                class="flex gap-2 border-rd-md w-fit"
                :class="[
                  isMyMessage(message)
                    ? ' self-end flex-row-reverse'
                    : ' self-start',
                ]"
              >
                <div class="relative w-8 h-8 rounded-full overflow-hidden">
                  <div
                    v-if="imageLoading"
                    class="absolute top-0 w-full h-full bg-gray-300"
                  ></div>
                  <img
                    v-if="message.user?.imageUrl"
                    :src="message.user.imageUrl"
                    alt="User Avatar"
                    class="absolute top-0 w-full h-full object-cover"
                    @load="imageLoading = false"
                  />
                  <img
                    v-else-if="!imageLoading && !message.user?.imageUrl"
                    src="/lama.svg"
                    alt="User Avatar"
                    class="w-8 h-8 rounded-full object-fit"
                    :class="{ 'bg-gray-300': imageLoading }"
                  />
                </div>

                <p
                  class="flex flex-col p-x-4 p-y-2 border-rd-md"
                  :class="[
                    isMyMessage(message) ? 'bg-gray-100 ' : 'bg-amber-100',
                  ]"
                >
                  <span
                    class="text-sm opacity-70"
                    :class="[isMyMessage(message) ? 'hidden' : '']"
                    >{{
                      message.user
                        ? getUsernameOrEmail(message.user)
                        : 'Unknown User'
                    }}</span
                  >
                  {{ message.content }}
                </p>
              </div>
              <div
                v-if="loading"
                class="h-full w-full grid place-items-center overflow-hidden bg-white"
              >
                <svg
                  class="w-10 h-10 text-amber-300 animate-spin"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                >
                  <path
                    d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                    stroke="currentColor"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                    stroke="currentColor"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-orange"
                  ></path>
                </svg>
              </div>
              <div
                v-else-if="reversedMessages.length == 0"
                class="flex justify-center items-center h-50vh"
                @load="loading = false"
                @loadstart="loading = true"
              >
                <div class="flex flex-col justify-center items-center gap-2">
                  <Frown class="w-12 h-12" />
                  <p>Geen berichten</p>
                </div>
              </div>
            </div>
            <div class="mt-4 relative">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="Aa"
                class="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 p-2 border border-gray-300 border-rd-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                :disabled="isCurrentRoomFinished"
              />
              <label
                class="absolute top-0 right-0 border-rd-md h-full w-fit p-x-2 bg-gray-300 text-white flex items-center justify-center"
              >
                <Send />
              </label>
            </div>
          </div>

          <div
            v-else
            class="absolute top-0 left-0 w-full h-full bg-white flex flex-col gap-2 p-4"
          >
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold">{{ t('members') }}</h2>
              <button
                @click="closeModal"
                class="p-2 hover:scale-105 hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <Undo2 />
              </button>
            </div>
            <ul class="flex flex-col gap-2 h-full overflow-y-scroll">
              <li
                v-for="user in currentChatroomUsers"
                :key="user.id"
                class="bg-gray-200 bg-op-30 p-2 p-x-4 border-rd-md flex gap-2 items-center"
              >
                <img
                  v-if="user.imageUrl"
                  :src="user.imageUrl"
                  alt="User Avatar"
                  class="w-8 h-8 rounded-full object-cover"
                /><img
                  v-else
                  src="/lama.svg"
                  alt="User Avatar"
                  class="w-8 h-8 rounded-full object-fit"
                />
                <p>{{ getUsernameOrEmail(user) }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        v-else-if="!currentRoomId"
        class="hidden md:grid place-items-center w-8/12 h-full bg-gray-200 border-rd-md"
      >
        <div class="flex flex-col gap-2 justify-center items-center">
          <p>Selecteer een chat!</p>
          <Smile class="w-12 h-12" />
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex flex-col md:flex-row h-full gap-4">
        <!-- Sidebar Skeleton -->
        <div class="h-full w-full md:w-4/12 flex flex-col gap-6 animate-pulse">
          <!-- Profile Section -->
          <div
            class="w-full aspect-ratio-video bg-gray-200 rounded-md flex flex-col justify-center items-center gap-4 p-4"
          >
            <div class="h-25 w-25 bg-gray-300 rounded-full"></div>
            <div class="h-6 w-32 bg-gray-200 rounded"></div>
            <div class="h-5 w-24 bg-gray-200 rounded"></div>
          </div>
          <!-- Button -->
          <div class="h-10 w-full bg-gray-200 rounded"></div>
          <!-- Filter Buttons -->
          <div class="flex flex-col gap-4">
            <div class="h-10 w-full bg-gray-200 rounded"></div>
            <div class="h-10 w-48 bg-gray-200 rounded"></div>
          </div>
          <!-- Chatrooms List -->
          <div class="h-[50vh] md:flex-1 overflow-y-scroll flex flex-col gap-4">
            <div class="h-16 w-full bg-gray-200 rounded"></div>
            <div class="h-16 w-full bg-gray-200 rounded"></div>
            <div class="h-16 w-full bg-gray-200 rounded"></div>
            <div class="h-16 w-full bg-gray-200 rounded"></div>
          </div>
        </div>

        <!-- Chat View Skeleton -->
        <div
          class="w-full md:w-8/12 border border-gray-300 p-4 flex flex-col gap-4 animate-pulse bg-opacity-50 backdrop-blur md:bg-white md:bg-opacity-100"
        >
          <!-- Chat Header -->
          <div class="h-10 w-full bg-gray-200 rounded"></div>
          <!-- Chat Messages -->
          <div class="flex-1 bg-gray-200 rounded overflow-y-scroll p-4">
            <div class="h-16 w-full bg-gray-300 rounded mb-4"></div>
            <div class="h-16 w-full bg-gray-300 rounded mb-4"></div>
            <div class="h-16 w-full bg-gray-300 rounded mb-4"></div>
          </div>
          <!-- Input Section -->
          <div class="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, inject } from 'vue'
import { useSubscription, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import useFirebase from '@/composables/useFirebase'
import { io, type Socket } from 'socket.io-client'
import useCustomUser from '@/composables/useCustomUser'
import { useRouter } from 'vue-router'

import type { Chatroom } from '@/interfaces/Chatroom.interface'
import type { EmbeddedMessage } from '@/interfaces/EmbeddedMessage.interface'
import type { User } from '@/interfaces/user.interface'
import { NEW_CHATROOM_FOR_USER_MUTATION } from '@/graphql/chatroom/chatroom.query'
import {
  MessageCircle,
  X,
  Filter,
  HeartCrack,
  Info,
  Undo2,
  Send,
  Frown,
  Battery,
  ChevronRight,
  Smile,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isChatOpen = ref(false)
const imageLoading = ref(true)
const socket = ref<Socket | null>(null)
const isConnected = ref(false)
const messages = ref<EmbeddedMessage[]>([])
const chatrooms = ref<Chatroom[]>([])
const newMessage = ref('') // New message input field
const currentRoomId = ref<string | null>(null) // Current room ID
const showModal = ref(false) // Modal visibility
const currentChatroomUsers = ref<User[]>([]) // Users in the current chatroom
const latestMessages = ref<Record<string, EmbeddedMessage>>({}) // Latest messages for each chatroom
const notificationCounts = ref<Record<string, number>>({}) // Notification counts for each chatroom
const chatContainer = ref<HTMLElement | null>(null) // Ref for chat container
const newChatrooms = ref<string[]>([]) // New chatrooms
const activeFilter = ref('all') // Active filter
const isCurrentRoomFinished = computed(() => {
  const chatroom = chatrooms.value.find(room => room.id === currentRoomId.value)
  return chatroom?.status === 'finished'
})

const searchQuery = ref('')
const activeSort = ref('')
const isLoadingChat = ref(true)

const { firebaseUser, restoreUser } = useFirebase()
const { customUser, restoreCustomUserWithChatrooms } = useCustomUser()
const router = useRouter()

const loading = ref(false)

const showFilterModal = ref(false)

const LATEST_MESSAGE_SUBSCRIPTION = gql`
  subscription LatestMessage($chatroomId: String!) {
    latestMessage(chatroomId: $chatroomId) {
      type
      content
      createdAt
      userId
    }
  }
`

watch(currentRoomId, () => {
  if (currentRoomId.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})

const NEW_CHATROOM_SUBSCRIPTION = gql`
  subscription NewChatroom($userId: String!) {
    newChatroom(userId: $userId) {
      id
      name
      usersIds
      messages {
        type
        userId
        content
        createdAt
      }
      createdAt
      status
    }
  }
`

const subscriptions = ref<Record<string, any>>({})

const isChatWithTripLeaderToday = computed(() => {
  const today = new Date().toDateString()
  return chatrooms.value.some(chatroom => {
    const chatDate = new Date(chatroom.createdAt).toDateString()
    console.log('chatroom', chatroom)
    return chatroom.name.includes('tripleader') && chatDate === today
  })
})

const subscribeToLatestMessage = (chatroomId: string) => {
  // Unsubscribe from the previous subscription if it exists
  if (subscriptions.value[chatroomId]) {
    subscriptions.value[chatroomId].unsubscribe()
  }

  const { result: latestMessage, error } = useSubscription(
    LATEST_MESSAGE_SUBSCRIPTION,
    {
      chatroomId,
    },
  )

  // Store the unsubscribe function
  // subscriptions.value[chatroomId] = { unsubscribe: latestMessage.unsubscribe }

  watch(latestMessage, (data: any) => {
    if (data?.latestMessage) {
      console.log('New latest message received:', data.latestMessage)
      latestMessages.value[chatroomId] = data.latestMessage

      console.log('chatrooms value', chatrooms.value)
      // set status to active
      const chatroomIndex = chatrooms.value.findIndex(
        room => room.id === chatroomId,
      )

      if (chatroomIndex === -1) {
        console.warn(`Chatroom with ID ${chatroomId} not found.`)
        return
      }

      console.log('chatroomIndex', chatroomIndex)

      // check how old the last messsage was if older then 3 days remain inactive if not set to active
      const lastMessageDate = new Date(data.latestMessage.createdAt)
      const currentDate = new Date()
      const diffTime = Math.abs(
        currentDate.getTime() - lastMessageDate.getTime(),
      )
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (currentRoomId.value !== chatroomId) {
        notificationCounts.value[chatroomId] =
          (notificationCounts.value[chatroomId] || 0) + 1
      }
    }
  })

  watch(error, err => {
    if (err) {
      console.error('Subscription error:', err)
    }
  })
}

const splitdateFromNameReturnDate = (name: string) => {
  // dd/mm/yyyy - name
  const date = name.split(' - ')[0]

  return date
}

const splitdateFromNameReturnDateV2 = (name: string) => {
  // Assuming the date format is dd/mm/yyyy - name
  const date = name.split(' - ')[0]
  const [day, month, year] = date.split('/')
  return new Date(`${year}-${month}-${day}`)
}

const splitdateFromNameReturnName = (n: string) => {
  const nameSplit = n.split(' - ')[1]

  return nameSplit
}

const subscribeToNewChatroom = (userId: string) => {
  const { result: newChatroom, error } = useSubscription(
    NEW_CHATROOM_SUBSCRIPTION,
    {
      userId,
    },
  )

  watch(newChatroom, (data: any) => {
    if (data?.newChatroom) {
      console.log('New chatroom received:', data.newChatroom)
      // Check if the chatroom already exists to prevent duplicates
      if (!chatrooms.value.some(room => room.id === data.newChatroom.id)) {
        chatrooms.value = [...chatrooms.value, data.newChatroom] // Create a new array
        newChatrooms.value = [...newChatrooms.value, data.newChatroom.id]

        // Flash the new chatroom for 5 seconds
        setTimeout(() => {
          newChatrooms.value = newChatrooms.value.filter(
            id => id !== data.newChatroom.id,
          )
        }, 5000)
      }
    }
  })

  watch(error, err => {
    if (err) {
      console.error('Subscription error:', err)
    }
  })
}

const connect = async () => {
  if (!firebaseUser.value) {
    console.warn(
      'Firebase user is not available. Cannot establish socket connection.',
    )
    return
  }
  const token = await firebaseUser.value.getIdToken()

  // Disconnect an existing socket before creating a new one
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
  }

  socket.value = io(import.meta.env.VITE_REALTIME_URL, {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Connect the socket after setting up listeners
  socket.value.connect()

  // Handle connection lifecycle
  socket.value.on('connect', () => {
    console.log('Socket connected.')
    isConnected.value = true
  })

  socket.value.on('disconnect', () => {
    console.log('Socket disconnected.')
    isConnected.value = false
  })

  socket.value.on('connect_error', error => {
    console.error('Socket connection error:', error.message)
    isConnected.value = false
  })

  // Handle incoming messages
  socket.value.on('Chatroom:message', (message: EmbeddedMessage) => {
    console.log('Received message:', message)
    messages.value.push(message)

    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })

    // Set chatroom to active if a message is received
    const chatroomIndex = chatrooms.value.findIndex(
      room => room.id === currentRoomId.value,
    )
    if (
      chatroomIndex !== -1 &&
      chatrooms.value[chatroomIndex].status === 'inactive'
    ) {
      chatrooms.value[chatroomIndex].status = 'active'
    }
  })

  // Handle errors
  socket.value.on('error', (error: string) => {
    console.error('Error:', error)
  })
}

const setActiveSort = (sortType: string) => {
  activeSort.value = sortType
}

const joinChatroom = async (roomId: string) => {
  imageLoading.value = true
  loading.value = true
  currentRoomId.value = roomId
  messages.value = []
  closeModal()
  if (socket.value) {
    socket.value.emit('Chatroom:message', { roomId, message: null })
  }
  subscribeToLatestMessage(roomId)

  notificationCounts.value[roomId] = 0

  // Remove "new" tag when joining the chatroom
  newChatrooms.value = newChatrooms.value.filter(id => id !== roomId)

  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
  // wait for 500ms before turning loading.value to false, we do this because otherwise loading will be done even when we are not sure if their are messages incoming or not...
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const leaveChatroom = () => {
  currentRoomId.value = null
  messages.value = []
}

const sendMessage = () => {
  if (newMessage.value.trim() === '' || !firebaseUser.value || !socket.value) {
    return
  }

  const message: EmbeddedMessage = {
    type: 'text',
    userId: customUser.value?.id || 'Error',
    content: newMessage.value,
    createdAt: new Date(),
  }

  socket.value.emit('Chatroom:message', {
    roomId: currentRoomId.value,
    message,
  })

  newMessage.value = ''
}

const isMyMessage = (message: EmbeddedMessage) => {
  return message.userId === customUser.value?.id
}

const openChatroomInfo = () => {
  const chatroom = chatrooms.value.find(room => room.id === currentRoomId.value)
  if (chatroom) {
    currentChatroomUsers.value = chatroom.users
    showModal.value = true
  }
}

const closeModal = () => {
  // currentRoomId.value = null
  showModal.value = false
}

const getUsernameOrEmail = (user: User) => {
  return user.username || user.email
}

const reversedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    return (
      new Date(a.createdAt ?? 0).getTime() -
      new Date(b.createdAt ?? 0).getTime()
    )
  })
})

watch(reversedMessages, newMessages => {
  if (newMessages.length > 0) {
    loading.value = false
  }
})

const totalNotificationCount = computed(() => {
  return Object.values(notificationCounts.value).reduce((a, b) => a + b, 0)
})

const toggleChatView = () => {
  isChatOpen.value = !isChatOpen.value
}

const toggleFilterModal = () => {
  showFilterModal.value = !showFilterModal.value
}

const redirectToSignup = () => {
  isChatOpen.value = !isChatOpen.value
  router.push('/auth/login')
}

const showErrorMessageTripLeader = ref(false)

const startChatWithTripLeader = async () => {
  const { mutate: createChatroom } = useMutation(NEW_CHATROOM_FOR_USER_MUTATION)

  if (isChatWithTripLeaderToday.value) {
    console.log('Setting error message to true')
    showErrorMessageTripLeader.value = true
    setTimeout(() => {
      showErrorMessageTripLeader.value = false
    }, 3000)

    return
  }
  try {
    if (!customUser.value) {
      console.error('Custom user is not available.')
      return
    }

    const today = new Date().toDateString()
    const existingChatroom = chatrooms.value.find(chatroom => {
      const chatDate = new Date(chatroom.createdAt).toDateString()
      return chatroom.name.includes('Tour Operator') && chatDate === today
    })

    if (existingChatroom) {
      joinChatroom(existingChatroom.id)
      return
    }

    const response = await createChatroom({ userId: customUser.value.id })

    const newChatroom = response?.data?.newChatroomForUser
    // Check if the chatroom already exists to prevent duplicates
    if (!chatrooms.value.some(room => room.id === newChatroom.id)) {
      chatrooms.value.push(newChatroom)
      newChatrooms.value.push(newChatroom.id)
    }
    // Join the newly created chatroom
    joinChatroom(newChatroom.id)
  } catch (error) {
    console.error('Error creating chatroom with trip leader:', error)
  }
}

watch(customUser, () => {
  updateChatrooms()
})

const updateChatrooms = async () => {
  console.log('trying to update chatrooms')
  if (customUser.value) {
    chatrooms.value = [...(customUser.value.chatrooms || [])] // Create a new array
    console.log('Chatrooms:', chatrooms.value)
    chatrooms.value.forEach(chatroom => {
      notificationCounts.value[chatroom.id] = 0 // Initialize notification count
      // set the latest message
      if (chatroom.lastMessage) {
        latestMessages.value[chatroom.id] =
          chatroom.lastMessage as EmbeddedMessage
      }
      subscribeToLatestMessage(chatroom.id)
    })
    if (customUser.value?.id) {
      subscribeToNewChatroom(customUser.value.id)
    }
  } else {
    chatrooms.value = []
    messages.value = []
    currentRoomId.value = null
  }
}

const searchQueryWatcher = computed(() => {
  return searchQuery.value
})

watch(searchQuery, newQuery => {
  if (newQuery) {
    activeSort.value = ''
  }
})

const filteredChatrooms = computed(() => {
  let filtered = chatrooms.value

  if (searchQuery.value) {
    // make sure to deactive the filter modal

    filtered = filtered.filter(
      chatroom =>
        chatroom.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        chatroom.users.some(user =>
          getUsernameOrEmail(user)
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()),
        ),
    )
  }

  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(
      chatroom => chatroom.status === activeFilter.value,
    )
  }

  if (activeSort.value === 'activity') {
    filtered.sort((a, b) => {
      const aLatest = latestMessages.value[a.id]?.createdAt || 0

      const bLatest = latestMessages.value[b.id]?.createdAt || 0
      console.log('aLatest', aLatest)
      console.log('bLatest', bLatest)
      return new Date(bLatest).getTime() - new Date(aLatest).getTime()
    })
  } else if (activeSort.value === 'tripDate') {
    filtered.sort((a, b) => {
      const aDate = new Date(splitdateFromNameReturnDateV2(a.name))
      const bDate = new Date(splitdateFromNameReturnDateV2(b.name))
      console.log('aDate', aDate)
      console.log('bDate', bDate)
      return aDate.getTime() - bDate.getTime()
    })
  }

  return filtered
})

const setFilter = () => {
  console.log('Setting filter...')
  if (activeFilter.value === 'all') {
    activeFilter.value = 'finished'
  } else {
    activeFilter.value = 'all'
  }
  console.log('Active filter:', activeFilter.value)
}

onMounted(async () => {
  await restoreUser()
  console.log('Restored user:', firebaseUser.value)
  console.log('Trying to restore user with chatrooms...')
  await restoreCustomUserWithChatrooms()
  console.log('Restored custom user:', customUser.value)
  updateChatrooms()
  await connect()
  isLoadingChat.value = false
  console.log('Loading is done... ', isLoadingChat.value)
})

watch(customUser, () => {
  updateChatrooms()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10%);
}
</style>
