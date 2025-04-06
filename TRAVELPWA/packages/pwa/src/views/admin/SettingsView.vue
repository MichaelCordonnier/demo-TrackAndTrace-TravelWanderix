<template>
  <div>
    <h1>User Settings - Admin</h1>

    <form @submit.prevent="updateUserName">
      <label for="username">Username:</label>
      <input
        type="text"
        id="username"
        v-model="username"
        :placeholder="placeholder"
        required
      />
      <button type="submit">Update Username</button>
    </form>

    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useFirebase from '@/composables/useFirebase'

const { firebaseUser, updateUsername } = useFirebase()

const username = ref<string | null>(firebaseUser.value?.displayName || null)
const placeholder = username.value ? '' : 'configure me...' // Placeholder text
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const updateUserName = async () => {
  errorMessage.value = null // Reset any previous error
  successMessage.value = null // Reset any previous success message

  try {
    await updateUsername(username.value || '') // Call updateUsername with the new username
    successMessage.value = 'Username updated successfully!'
    // No need for this line: username.value = username.value;
  } catch (error) {
    errorMessage.value = 'Failed to update username: ' + error
  }
}
</script>
