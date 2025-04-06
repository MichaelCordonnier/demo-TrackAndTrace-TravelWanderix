<template>
  <div class="font-inter font-inter-normal">
    <!-- Layout rendering -->
    <RouterView></RouterView>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

import useLanguage from './composables/useLanguage'
import useCustomUser from './composables/useCustomUser'

// Get the current route and layout
const route = useRoute()

// Composables
const { setLocale, SUPPORTED_LOCALES, locale } = useLanguage()
////('hier?')
const { customUser } = useCustomUser()
////('neen')

// Set locale based on custom user or default locale
if (customUser.value?.locale) {
  setLocale(customUser.value.locale)
} else {
  // Defer client-side code to run only in the browser
  onBeforeMount(() => {
    const browserLocale =
      navigator.languages.find(locale =>
        Object.keys(SUPPORTED_LOCALES).includes(locale),
      ) ?? locale.value
    setLocale(browserLocale)
  })
}
</script>
