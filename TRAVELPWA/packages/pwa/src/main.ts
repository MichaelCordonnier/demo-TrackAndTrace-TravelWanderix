import { createApp, h, provide } from 'vue'
// main.ts
import 'virtual:uno.css'
import router from './router'
import App from './App.vue'
import '@unocss/reset/tailwind.css'
import { DefaultApolloClient } from '@vue/apollo-composable'
import useGraphql from './composables/useGraphql'
import useFirebase from './composables/useFirebase'
import { createI18n } from 'vue-i18n'
import useCustomUser from './composables/useCustomUser'
import VueDragscroll from 'vue-dragscroll'
import VueCookies from 'vue-cookies'

const { restoreUser, firebaseUser } = useFirebase()
const { restoreCustomUser } = useCustomUser()

const i18n = createI18n({
  locale: 'nl',
  fallbackLocale: 'en',
})

const app = createApp({
  setup() {
    const { apolloClient } = useGraphql()
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})
;(async () => {
  await restoreUser()
  // //('Firebase user:', firebaseUser.value)
  if (firebaseUser.value) await restoreCustomUser()
  app.use(i18n)
  app.use(router)
  app.use(VueDragscroll)
  app.use(VueCookies, { expires: '7d' })
  app.mount('#app')
})()
