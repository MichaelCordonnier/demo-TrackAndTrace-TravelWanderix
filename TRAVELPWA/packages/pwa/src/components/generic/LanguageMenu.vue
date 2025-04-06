<template>
  <div
    class="bg-white shadow-lg rounded-xl m-4 py-4 px-4 border-1 border-gray-100 border-opacity-90"
  >
    <form @submit.prevent="">
      <div>
        <label class="block mb-2">{{ t('label.language') }}</label>
        <div>
          <button
            v-for="(value, key) in SUPPORTED_LOCALES"
            :key="key"
            @click="setLanguage(key)"
            :class="{
              ' bg-gradient-to-br from-amber-300 to-orange-400 text-white font-medium shadow-lg':
                locale === key,
              'bg-gray-200': locale !== key,
            }"
            class="px-4 py-2 m-1 rounded"
          >
            {{ value }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import useFirebase from '@/composables/useFirebase'
import useLanguage from '@/composables/useLanguage'
import { useMutation } from '@vue/apollo-composable'
import { UPDATE_USER_LOCALE } from '@/graphql/user/user.mutation'
import useCustomUser from '@/composables/useCustomUser'

const { t } = useI18n()

const { firebaseUser } = useFirebase()

const { customUser } = useCustomUser()

const { SUPPORTED_LOCALES, locale, setLocale } = useLanguage()
const { mutate: updateUserLocaleMutation } = useMutation(UPDATE_USER_LOCALE)

import { defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

// Set up the event emitter
const emit = defineEmits(['closeMenu'])

const setLanguage = (key: string) => {
  setLocale(key) // Save in the composable
  console.log('Locale:', key)
  emit('closeMenu')
  if (!customUser.value) return
  updateUserLocaleMutation({
    myinput: {
      id: customUser.value!.id,
      uid: firebaseUser?.value?.uid,
      locale: key,
      username: firebaseUser?.value?.displayName,
      imageUrl: firebaseUser?.value?.photoURL,
    },
  })
}
</script>
