<template>
  <div>
    <!-- Chat Bubble -->
    <div
      class="fixed bottom-12 right-12 flex items-center justify-center z-999"
    >
      <button
        @click="toggleChatView"
        class="w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full shadow-lg relative flex items-center justify-center hover:scale-105 hover:shadow-lg duration-300 text-white outline outline-width-2 outline-white"
        :class="isChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'"
        data-testid="chat-toggle-button"
      >
        <MessageCircle
          class="h-6 w-6 sm:h-8 sm:w-8 transition-transform duration-300 hover:scale-115"
        />
        <span
          v-if="totalNotificationCount > 0"
          class="absolute top-0 right-0 w-5 h-5 text-sm text-white bg-red-500 rounded-full flex items-center justify-center -translate-y-2 -translate-x-2"
        >
          {{ totalNotificationCount }}
        </span>
      </button>
    </div>

    <!-- Chat View -->
    <div
      v-if="isChatOpen && !isLoadingChatModule"
      class="fixed bottom-2 right-2 md:bottom-20 md:right-20 w-[calc(100%-1rem)] md:w-50vw lg:w-30vw bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-70vh border-rd-md overflow-hidden"
    >
      <div
        class="flex justify-between items-center p-4 bg-gradient-to-br from-amber-300 to-orange-400 text-white"
      >
        <h2 class="text-lg font-semibold hover:group">{{ t('chat') }}</h2>
        <button
          @click="toggleChatView"
          class="text-xl group hover:bg-white hover:bg-op-30 p-2 rounded-full"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 p-4 overflow-y-scroll border h-full border">
        <!-- No user view -->
        <div v-if="!customUser">
          <button
            @click="redirectToSignup"
            class="w-full h-full grid place-items-center bg-gray-200 border-rd-md p-4 group border border-gray-200 hover:border-amber"
          >
            <p class="text-center text-black">{{ t('ChatContact') }}</p>
            <Frown
              class="h-6 w-6 text-black transition-all duration-300 ease-in-out group-hover:scale-105"
            />
          </button>
        </div>

        <!-- Chats view -->
        <div v-if="!currentRoomId && customUser" class="h-full">
          <button
            class="flex gap-2 w-full relative overflow-hidden mb-2 border border-gray-200 border-rd-md"
            @click="setFilter"
          >
            <span
              class="absolute top-0 left-0 h-full w-1/2 bg-gray-200 -z-1 border-rd-md transition-all duration-300"
              :class="[activeFilter === 'all' ? 'left-0' : 'left-50% ']"
            ></span>
            <span
              :class="[
                'flex-1 p-y-2 hover:scale-105 transition-all duration-300 ease-in-out',
                activeFilter === 'all' ? 'text-black' : 'text-black',
              ]"
            >
              {{ t('active') }}
            </span>
            <span
              :class="[
                'flex-1 p-y-2 hover:scale-105 transition-all duration-300 ease-in-out',
                activeFilter === 'finished' ? 'text-black' : 'text-black',
              ]"
            >
              {{ t('archived') }}
            </span>
          </button>
          <p class="font-semibold text-lg mb-4 flex flex-col">
            {{ t('Available.Chats') }}
          </p>
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
                  'p-2 border border-gray-200 border-rd-md border-2 border-white hover:scale-105 transition-all duration-300 ease-in-out hover:scale-105 transition-all duration-300 ease-in-out',
                  activeSort === 'activity' ? 'bg-gray-200 ' : 'bg-white',
                ]"
              >
                {{ t('recentActive') }}
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

          <div class="overflow-y-auto h-35vh flex flex-col gap-4">
            <div
              v-if="filteredChatrooms.length == 0"
              class="h-full grid place-items-center bg-gray-100 border-rd-md"
            >
              <div class="flex flex-col gap-2 items-center">
                <p>No chat's available</p>
                <HeartCrack class="h-12 w-12 text-black" />
              </div>
            </div>
            <div
              v-for="chatroom in filteredChatrooms"
              :key="chatroom.id"
              class="relative w-full"
            >
              <button
                @click="joinChatroom(chatroom.id)"
                :class="[
                  'block w-full text-left  rounded bg-gray-100 relative flex  gap-2 items-center p-y-2 p-x-2 group',
                  chatroom.status === 'finished'
                    ? 'bg-gray-300 opacity-70'
                    : '',
                ]"
              >
                <p
                  class="p-y-2 p-x-1 border-rd-md bg-amber-400 text-white text-sm w-25 text-center"
                >
                  {{ splitdateFromNameReturnDate(chatroom.name) }}
                </p>
                <div class="w-full flex items-center justify-between">
                  <div class="flex flex-col">
                    <div class="flex gap-2">
                      <p
                        class="group-hover:ml-2 transition-all duration-300 ease-in-out flex justify-between"
                      >
                        {{ splitdateFromNameReturnName(chatroom.name) }}
                      </p>
                      <div
                        class="relative"
                        v-if="notificationCounts[chatroom.id] > 0"
                      >
                        <span
                          class="bg-red-200 animate-ping w-4 h-4 border-rd-full absolute top-2 right-0 transform"
                        >
                        </span>
                        <span
                          class="bg-red-500 w-3 h-3 border-rd-full absolute top-2 right-0 transform absolute"
                        >
                        </span>
                      </div>
                    </div>

                    <p
                      class="text-sm text-gray-500 overflow-hidden text-truncate md:w-75%"
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
          <div>
            <button
              @click="startChatWithTripLeader"
              class="mt-4 p-2 text-white rounded block bg-green-400 text-white hover:scale-102 cursor-pointer duration-300 px-6"
            >
              {{ t('ChatTourOperator') }}
            </button>
            <p v-if="showErrorMessageTripLeader" class="text-red text-sm mt-2">
              {{ t('AlreadyContact') }}
            </p>
          </div>
        </div>
        <!-- chat view -->
        <div v-else-if="currentRoomId" class="h-full flex flex-col gap-4">
          <div
            class="flex justify-between items-center mb-4 bg-gray-100 border-rd-md p-2 p-x-4"
          >
            <button
              class="p-2 hover:scale-105 transition-all duration-300 ease-in-out"
              @click="openChatroomInfo"
            >
              <Info />
            </button>
            <button
              class="p-2 hover:scale-105 hover:scale-105 transition-all duration-300 ease-in-out"
              @click="leaveChatroom"
            >
              <Undo2 />
            </button>
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
            ref="chatContainer"
            v-else-if="messages.length"
            class="h-full overflow-y-auto border p-4 bg-white rounded shadow flex flex-col gap-4"
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
                  class="w-full h-full object-cover"
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
                class="flex-1 flex flex-col p-x-4 p-y-2 border-rd-md"
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
          </div>
          <div v-else class="h-full grid place-items-center">
            <div class="flex flex-col gap-2 items-center justify-center">
              <p class="text-center text-black h-full">No messages yet.</p>
              <HeartCrack />
            </div>
          </div>
          <div class="mt-4 relative">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Aa"
              class="w-full p-2 border border-gray-300 border-rd-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              :disabled="isCurrentRoomFinished"
            />
            <label
              class="absolute top-0 right-0 border-rd-md h-full w-fit p-x-2 bg-gray-300 text-white flex items-center justify-center"
            >
              <Send />
            </label>
          </div>
        </div>
      </div>

      <!-- User Info Modal -->
      <div
        v-if="showModal"
        class="absolute top-0 left-0 w-full h-full bg-white flex flex-col gap-2 p-4"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">{{ t('users') }}</h2>
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
              class="w-8 h-8 rounded-full object-cover border border-red"
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
    <div
      class="fixed bottom-2 right-2 md:bottom-20 md:right-20 w-[calc(100%-1rem)] md:w-1/2 lg:w-1/3 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[70vh] border-rd-md overflow-hidden"
      v-else-if="isChatOpen && isLoadingChatModule"
    >
      <div
        class="flex justify-between items-center p-4 bg-gradient-to-br from-amber-300 to-orange-400 text-white"
      >
        <h2 class="text-lg font-semibold hover:group">{{ t('chat') }}</h2>
        <button
          @click="toggleChatView"
          class="text-xl group hover:bg-white hover:bg-op-30 p-2 rounded-full"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Main Content: Gray Background (Skeleton Loader) -->
      <div
        class="flex-1 p-4 overflow-y-auto border border-t-0 flex flex-col gap-4 bg-gray-200 animate-pulse"
      >
        <!-- No User View Skeleton -->
        <div
          class="grid place-items-center w-full h-full bg-gray-300 border rounded"
        >
          <div class="text-center">
            <div class="h-4 w-40 bg-gray-400 rounded mb-2"></div>
            <div class="h-6 w-6 bg-gray-400 rounded-full mx-auto"></div>
          </div>
        </div>

        <!-- Chat List Skeleton -->
        <div class="flex flex-col gap-4">
          <div class="flex gap-2 items-center p-2 bg-gray-300 rounded">
            <div class="h-6 w-1/2 bg-gray-400 rounded"></div>
            <div class="h-6 w-1/4 bg-gray-400 rounded"></div>
          </div>
          <div class="h-4 w-32 bg-gray-400 rounded mb-4"></div>
          <div class="h-10 w-1/4 bg-gray-400 rounded mb-2"></div>
          <div class="flex flex-col gap-2">
            <div class="h-10 w-full bg-gray-300 rounded"></div>
            <div class="h-10 w-full bg-gray-300 rounded"></div>
            <div class="h-10 w-full bg-gray-300 rounded"></div>
          </div>
          <div class="h-12 w-1/3 bg-gray-400 rounded"></div>
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
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isChatOpen = ref(false)
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
const isLoadingChatModule = ref(true)

const { firebaseUser, restoreUser } = useFirebase()
const { customUser, restoreCustomUserWithChatrooms } = useCustomUser()
const router = useRouter()

const showFilterModal = ref(false)

// skeleton & placeholder purpose
const loading = ref(false)
const imageLoading = ref(true)

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
  const sortedMessage = [...messages.value].sort((a, b) => {
    return (
      new Date(a.createdAt ?? 0).getTime() -
      new Date(b.createdAt ?? 0).getTime()
    )
  })

  return sortedMessage
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

watch(customUser, async () => {
  await initialize()
})

const updateChatrooms = async () => {
  console.log('trying to update chatrooms')
  isLoadingChatModule.value = true
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

// DEPRECTAED
// const sortByActivity = () => {
//   chatrooms.value.sort((a, b) => {
//     const aLatestMessage = latestMessages.value[a.id]?.createdAt || 0
//     const bLatestMessage = latestMessages.value[b.id]?.createdAt || 0
//     return (
//       new Date(bLatestMessage).getTime() - new Date(aLatestMessage).getTime()
//     )
//   })
// }

// DEPRECATED
// const sortByTripDate = () => {
//   chatrooms.value.sort((a, b) => {
//     const aDate = new Date(splitdateFromNameReturnDate(a.name)).getTime()
//     const bDate = new Date(splitdateFromNameReturnDate(b.name)).getTime()
//     return aDate - bDate
//   })
// }

const setFilter = () => {
  if (activeFilter.value === 'all') {
    activeFilter.value = 'finished'
  } else {
    activeFilter.value = 'all'
  }
}

const initialize = async () => {
  console.log(customUser.value)
  if (customUser.value) {
    isLoadingChatModule.value = true
    await restoreUser()
    console.log('Restored user:', firebaseUser.value)
    await connect()

    await restoreCustomUserWithChatrooms()
    updateChatrooms()
    console.log('done loading the chats...')
  } else {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }
  isLoadingChatModule.value = false
}

onMounted(async () => {
  await initialize()
})
</script>
<style scoped>
::-webkit-scrollbar {
  display: none;
}
</style>
