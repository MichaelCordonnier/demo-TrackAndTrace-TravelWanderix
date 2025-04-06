<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 overflow-hidden"
  >
    <div
      class="mx-2 sm:mx-10 md:mx-10 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl max-w-full sm:max-w-4xl w-full relative overflow-hidden"
    >
      <button
        @click="closeModal"
        class="group absolute top-2 right-2 h-10 w-10 flex items-center justify-center rounded-full text-white bg-black bg-opacity-20 hover:bg-opacity-50 transition-transform hover:scale-110"
        aria-label="Close"
      >
        <X class="text-white h-8 w-8" />
      </button>
      <div class="flex flex-col items-center mb-6">
        <img
          v-if="user.imageUrl"
          :src="user.imageUrl"
          alt="User profile picture"
          class="bg-gray-100 w-40 h-40 rounded-full object-cover outline outline-gray-200"
        />
        <div
          v-else
          class="w-40 h-40 rounded-full flex items-center justify-center p-2 bg-white outline outline-gray-200"
        >
          <img
            src="/lama.svg"
            alt="User Profile Image"
            class="w-27 h-27 object-fit"
          />
        </div>
      </div>
      <div class="mt-4">
        <ImagePicker
          v-model="user.imageUrl"
          :disable-preview="true"
          class="mt-2"
        />
      </div>

      <!-- User Info Section -->
      <div class="mb-4">
        <InputField
          v-model="user.username"
          type="text"
          label="Username"
          placeholder="Enter username"
          class="border bg-gray-100 p-2 rounded mb-2 w-full"
        />
      </div>

      <!-- Locale Section -->
      <div class="flex items-center gap-2 justify-between">
        <div class="flex items-center gap-2">
          <p class="text-md block font-semibold tracking-wider text-gray-700">
            Language:
          </p>
          <DropDown
            v-model="user.locale"
            :options="[
              { value: 'en', label: 'English' },
              { value: 'nl', label: 'Dutch' },
              { value: 'zh', label: 'Chinese' },
              { value: 'es', label: 'Spanish' },
            ]"
          />
        </div>
        <!-- Save/Discard Buttons -->
        <div class="flex gap-2 mt-4">
          <button
            @click="saveChanges"
            class="p-2 px-10 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-md hover:scale-105 hover:shadow-lg cursor-pointer duration-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DropDown from '@/components/form/dropDown.vue'
import { X } from 'lucide-vue-next'
import useCustomUser from '@/composables/useCustomUser'
import { UPDATE_USER } from '@/graphql/user/user.admin'
import { useMutation } from '@vue/apollo-composable'
import InputField from '@/components/form/inputField.vue'
import ImagePicker from '@/components/form/imagePicker.vue'
import useFirebase from '@/composables/useFirebase'
import { updateProfile } from 'firebase/auth'

// User data interface for type safety
interface User {
  imageUrl: string
  username: string
  email: string
  role: string
  locale: string
}

const { customUser, restoreCustomUser } = useCustomUser()

const { firebaseUser } = useFirebase()

// State to hold user data
const user = ref<User>({
  imageUrl: '',
  username: '',
  email: '',
  role: '',
  locale: '',
})

const originalUser = ref<User | null>(null)
const isEditing = ref(true) // Set to true by default

const emits = defineEmits(['close', 'update'])

const { mutate: updateUser } = useMutation(UPDATE_USER)

const saveChanges = async () => {
  try {
    if (customUser.value?.id) {
      console.log(
        'id',
        customUser.value.id,
        'username',
        user.value.username,
        'imageUrl',
        user.value.imageUrl,
        'locale',
        user.value.locale,
        'role',
        customUser.value.role,
      )
      await updateUser({
        updateUserInput: {
          id: customUser.value.id,
          username: user.value.username,
          imageUrl: user.value.imageUrl,
          uid: customUser.value.uid,
          locale: user.value.locale,
          role: customUser.value.role,
        },
      })

      updateProfile(firebaseUser.value!, {
        displayName: user.value.username,
        photoURL: user.value.imageUrl,
      })
    } else {
      console.error('User ID not given through customUser?')
    }
  } catch (error) {
    console.error('Failed to update user:', error)
  }
  isEditing.value = false
  emits('update')
  closeModal()
}

const closeModal = () => {
  if (originalUser.value) {
    user.value = { ...originalUser.value }
  }
  isEditing.value = false
  emits('close')
}

onMounted(async () => {
  try {
    await restoreCustomUser()
    if (customUser.value) {
      user.value = { ...customUser.value } // Create a new object
      originalUser.value = { ...customUser.value }
    } else {
      console.error('User data not found')
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
})
</script>
