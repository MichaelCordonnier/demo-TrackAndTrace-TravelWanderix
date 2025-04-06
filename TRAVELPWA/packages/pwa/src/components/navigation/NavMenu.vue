<template>
  <div
    v-if="isNavMenuOpen"
    class="bg-white shadow-lg rounded-xl m-4 w-64 py-2 border-1 border-gray-100 border-opacity-90"
  >
    <RouterLink
      class="block focus:outline-none focus-visible:ring-4 ring-orange-400 hover:bg-neutral-100 p-2 px-6"
      :to="firebaseUser ? { name: 'myaccount' } : { name: 'login' }"
    >
      <p>{{ firebaseUser ? t('myAccount') : t('login') }}</p>
    </RouterLink>
    <!-- <div v-if="firebaseUser" class="flex items-center gap-2">
              <p>
                {{ firebaseUser.email }} ({{ customUser?.role }})
                {{ customUser?.locale }} {{ customUser?.gender }}
              </p>
              <MenuIcon class="h-6 w-6" />
              <img
                v-if="firebaseUser.photoURL"
                :src="firebaseUser.photoURL"
                alt="Profile picture"
              />
              <div
                v-else
                class="rounded-full overflow-hidden h-8 w-8 flex items-center justify-center bg-white"
              >
                <PersonIcon class="h-8 w-8 text-gray-500" />
              </div> -->

    <RouterLink
      v-if="role === 'ADMIN'"
      class="block focus:outline-none focus-visible:ring-4 ring-orange-400 hover:bg-neutral-100 p-2 px-6"
      to="/admin"
    >
      <p>{{ t('admin') }}</p>
    </RouterLink>

    <RouterLink
      v-if="role === 'GUIDE'"
      class="block focus:outline-none focus-visible:ring-4 ring-orange-400 hover:bg-neutral-100 p-2 px-6"
      to="/guide"
    >
      <p>{{ t('guide') }}</p>
    </RouterLink>

    <div v-else></div>
    <div
      v-if="firebaseUser"
      class="cursor-pointer block focus:outline-none focus-visible:ring-4 ring-orange-400 hover:bg-neutral-100 p-2 px-6"
      @click="logoutUser"
    >
      <p>{{ t('logout') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import useFirebase from '@/composables/useFirebase'
import useCustomUser from '@/composables/useCustomUser'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { useApolloClient } from '@vue/apollo-composable'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue' // Add this line to import ref
const { t } = useI18n()

const { firebaseUser, logout } = useFirebase()
const { replace } = useRouter()

const { client } = useApolloClient()

const { customUser } = useCustomUser()

const role = customUser?.value?.role

const isNavMenuOpen = ref(true) // Add this line to define the reactive property

const logoutUser = () => {
  logout().then(() => {
    customUser.value = undefined
    client.resetStore()
    replace({ path: '/' })
    isNavMenuOpen.value = false // Add this line to update the NavMenu
  })
}
</script>
