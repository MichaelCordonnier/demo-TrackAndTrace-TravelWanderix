<template>
  <nav class="flex">
    <!-- this is the spacing for the navX -->
    <div
      :class="[
        ' h-[100vh]   w-0/12 md:w-2/12  ',
        isMobile
          ? isCollapsed
            ? 'hidden'
            : ''
          : isCollapsed
            ? 'md:w-2/12 lg:w-1/12'
            : ' md:w-4/12 lg:w-2/12',
        'transition-all duration-300 transform',
      ]"
    ></div>
    <div
      :class="[
        'content w-12/12 md:w-10/12 lg:w-10/12 bg-[#F7F7F7]',
        isMobile
          ? isCollapsed
            ? ''
            : ''
          : isCollapsed
            ? 'md:w-10/12 lg:w-11/12'
            : ' lg:w-10/12',
        'transition-all duration-300',
      ]"
    >
      <header class="p-5 pt-8 p-b-2.5">
        <div
          class="flex flex-col md:flex-row flex-wrap gap-2 md:gap-6 items-end md:items-center text-end md:text-start"
        >
          <div class="p-l-2 md:m-l-1">
            <p class="opacity-70 font-light">Welcome,</p>
            <h3>{{ displayName }}</h3>
          </div>

          <RouterLink
            to="/"
            class="flex items bg-gradient-to-br from-amber-300 to-orange-400 p-x-4 p-y-2 border-rd-md text-white ml-auto hover:scale-105 transition-all duration-300"
          >
            Leave Admin Dashboard
          </RouterLink>

          <!-- search input -->
        </div>
      </header>
      <main class="p-4 relative">
        <slot></slot>
      </main>
    </div>

    <div
      :class="[
        'nav fixed h-[100vh] bg-[#F7F7F7] w-8/12',
        isMobile
          ? isCollapsed
            ? '-translate-x-full'
            : 'translate-x-0'
          : isCollapsed
            ? 'md:w-2/12 lg:w-1/12'
            : 'md:w-4/12 lg:w-2/12',
        'transition-all duration-300 transform',
      ]"
    >
      <div
        class="p-l-2 p-r-2 pb-4 pt-4 flex flex-col justify-between h-full overflow-scroll"
      >
        <div>
          <div class="w-full mb-10">
            <!-- Navbar Header -->

            <RouterLink
              to="/"
              class="w-full h-full block flex justify-center items-center"
            >
              <LogoSiteV2 class="" :small-logo="isCollapsed" />
            </RouterLink>
          </div>
          <ul class="">
            <NavLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              :text="link.text"
              :icon="link.icon"
              :collapsed="isCollapsed"
            />
          </ul>
        </div>
        <div>
          <div class="flex flex-col w-full gap-4">
            <button
              class="hover:border-gray-200 hover:shadow-md border border-white w-full flex flex-col p-2 bg-white gap-2 border-rd-2xl truncate justify-center items-center"
              @click="toggleProfileSettings"
            >
              <img
                v-if="firebaseUser?.photoURL"
                :src="firebaseUser?.photoURL"
                alt="User Profile Image"
                class="w-40px h-40px object-cover border-rd-[50%]"
              />
              <div
                v-else
                class="w-40px h-40px flex justify-center items-center bg-gray-200 border-rd-[50%] flex"
              >
                <img
                  src="/lama.svg"
                  alt="User Profile Image"
                  class="w-20px h-20px object-fit"
                />
              </div>
              <div class="w-full">
                <p class="truncate w-full">{{ firebaseUser?.displayName }}</p>
              </div>
            </button>
            <div
              class="text-center w-full bg-gradient-to-br from-red-400 to-red-600 border-rd-md hover:scale-102 hover:shadow-lg transform duration-300"
            >
              <button class="w-full p-2 text-white" @click="handleLogout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      :class="[
        'fixed absolute top-9 w-40px h-40px bg-white border-radius flex justify-center items-center -m-l-5 drop-shadow-md border-rd-md ',
        isMobile
          ? isCollapsed
            ? 'left-1/12 '
            : 'left-8/12  '
          : isCollapsed
            ? 'md:left-2/12 lg:left-1/12 '
            : 'left-4/12 md:left4/12 lg:left-2/12',
        'transition-all duration-300 transform',
      ]"
      @click="isCollapsed = !isCollapsed"
    >
      <ChevronLeft v-if="!isCollapsed" />
      <ChevronRight v-else />
    </button>
  </nav>
  <div v-if="openProfileSettings">
    <ProfileForm @close="closeProfileSettings"></ProfileForm>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import NavLink from '@/components/admin/NavBarLink.vue'
import {
  Menu,
  Home,
  Map,
  RollerCoaster,
  BookCheck,
  UserSearch,
  MessageCircle,
  UserCog,
  Search,
  PanelRightClose,
  PanelRightOpen,
  Image,
  ChevronRight,
  ChevronLeft,
} from 'lucide-vue-next'
import useFirebase from '@/composables/useFirebase'
import useCustomUser from '@/composables/useCustomUser'
import { useRouter } from 'vue-router'
import ProfileForm from '../reusable/profileForm.vue'
import LogoSite from '../generic/LogoSite.vue'
import LogoSiteV2 from '../generic/LogoSiteV2.vue'

const isCollapsed = ref(true)
// State for mobile view detection
const isMobile = ref(window.innerWidth <= 768)

const openProfileSettings = ref(false)

const toggleProfileSettings = () => {
  openProfileSettings.value = !openProfileSettings.value
}

const closeProfileSettings = async () => {
  openProfileSettings.value = false
  // await restoreCustomUser()
  // await reloadUser()
  console.log('New username:', firebaseUser.value?.displayName)

  console.log('New PhotoUrl:', firebaseUser.value?.photoURL)
}

// Window resize listener to detect mobile view
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const links = ref([
  { to: '/admin/dashboard', text: 'Dashboard', icon: Home },
  { to: '/admin/trips', text: 'Trips', icon: Map },
  {
    to: '/admin/activities',
    text: 'Activities',
    icon: RollerCoaster,
  },
  {
    to: '/admin/clients',
    text: 'Clients',
    icon: UserSearch,
  },
  {
    to: '/admin/chat',
    text: 'Chat',
    icon: MessageCircle,
  },
])

// get the username from the firebase user
const { firebaseUser, logout, reloadUser } = useFirebase()
const { logoutCustomUser, restoreCustomUser } = useCustomUser()
const router = useRouter()

const displayName = computed(() => firebaseUser.value?.displayName)
const photoURL = computed(() => firebaseUser.value?.photoURL)

const handleLogout = async () => {
  try {
    await logout()
    await logoutCustomUser()
    router.replace('/login')
    // go back to the login page
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// log when the button is clicked
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}
</style>
