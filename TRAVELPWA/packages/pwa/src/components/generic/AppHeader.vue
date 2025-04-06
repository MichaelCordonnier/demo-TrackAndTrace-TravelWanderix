<template>
  <header>
    <div class="flex items-center justify-between mx-4 md:mx-12 lg:mx-32">
      <RouterLink
        class="flex items-center m-4 ml-0 opacity-100 hover:opacity-70"
        to="/"
      >
        <LogoSite class="h-10" />
      </RouterLink>

      <nav>
        <ul class="flex items-center space-x-4">
          <li class="hidden lg:block">
            <RouterLink
              class="block rounded-full focus:outline-none focus-visible:ring-2 ring-black hover:bg-neutral-100 p-3 px-4 cursor-pointer"
              to="/infomail"
            >
              <p class="font-medium">{{ t('navigation.tripleader') }}</p>
            </RouterLink>
          </li>
          <li>
            <div
              v-if="firebaseUser"
              class="block rounded-full focus:outline-none focus-visible:ring-2 ring-black hover:bg-neutral-100 p-3 cursor-pointer"
              @click="openLanguageMenu"
            >
              <GlobeIcon class="h-6 w-6" />
            </div>
          </li>
          <li>
            <div
              :class="{
                'border-1 border-gray-300 shadow-md': isNavMenuOpen,
                'hover:shadow-md rounded-full cursor-pointer focus:outline-none focus-visible:ring-4 ring-orange-400 p-2 border-1 border-gray-300': true,
              }"
              @click="toggleNavMenu"
            >
              <div v-if="firebaseUser" class="flex items-center gap-2">
                <p>
                  <!-- {{ firebaseUser.email }} ({{ customUser?.role }})
                {{ customUser?.locale }} {{ customUser?.gender }} -->
                </p>
                <MenuIcon class="h-6 w-6" />
                <img
                  v-if="firebaseUser.photoURL"
                  :src="firebaseUser.photoURL"
                  alt="Profile picture"
                  class="rounded-full h-8 w-8 object-cover"
                />
                <div
                  v-else
                  class="w-8 h-8 flex justify-center items-center bg-gray-100 border-1 border-gray-200 border-rd-[50%] flex"
                >
                  <img
                    src="/lama.svg"
                    alt="User Profile Image"
                    class="w-20px h-20px object-fit"
                  />
                </div>
              </div>
              <div v-else class="flex items-center gap-2">
                <MenuIcon class="h-6 w-6" />
                <div
                  class="rounded-full overflow-hidden h-8 w-8 flex items-center justify-center bg-white"
                >
                  <PersonIcon class="h-8 w-8 text-gray-500" />
                </div>
              </div>
            </div>
            <transition name="fade">
              <NavMenu
                v-if="isNavMenuOpen"
                ref="menu"
                class="absolute right-2 mx-4 md:mx-12 lg:mx-32 z-50"
              />
            </transition>

            <transition name="fade">
              <LanguageMenu
                v-if="isLanguageMenuOpen"
                ref="languageMenu"
                @closeMenu="isLanguageMenuOpen = false"
                class="absolute right-2 mx-4 md:mx-12 lg:mx-32 z-50"
              />
            </transition>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LogoSite from '@/components/generic/LogoSite.vue'
import { RouterLink } from 'vue-router'
import useFirebase from '@/composables/useFirebase'
import { Globe as GlobeIcon } from 'lucide-vue-next'
import { CircleUserRound as PersonIcon } from 'lucide-vue-next'
import { Menu as MenuIcon } from 'lucide-vue-next'
import LanguageMenu from './LanguageMenu.vue'
//import MyAccount from '@/views/MyAccount.vue'
//import useCustomUser from '@/composables/useCustomUser'
import { onClickOutside } from '@vueuse/core'
import NavMenu from '../navigation/NavMenu.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { firebaseUser } = useFirebase()

const isNavMenuOpen = ref(false)
const menu = ref(null)

const isLanguageMenuOpen = ref(false)
const languageMenu = ref(null)

onClickOutside(menu, event => {
  event.stopPropagation()
  if (isNavMenuOpen.value) {
    isNavMenuOpen.value = false
  }
})

onClickOutside(languageMenu, event => {
  event.stopPropagation()
  if (isLanguageMenuOpen.value) {
    isLanguageMenuOpen.value = false
  }
})

const openLanguageMenu = () => {
  isLanguageMenuOpen.value = !isLanguageMenuOpen.value
}

const toggleNavMenu = () => {
  isNavMenuOpen.value = !isNavMenuOpen.value
}
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
