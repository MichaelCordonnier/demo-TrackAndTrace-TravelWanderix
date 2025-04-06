<template>
  <div
    v-if="firebaseUser"
    class="w-full flex justify-center mb-12 pb-88 pt-88 px-4 sm:px-6 lg:px-8 bg-gray-100"
  >
    <div
      class="flex flex-col items-center justify-center border-1 p-6 sm:p-8 md:p-12 rounded-md bg-white border-gray-200 shadow-lg w-full max-w-md lg:max-w-lg xl:max-w-xl"
    >
      <p class="text-gray-500 font-bold">
        You are already logged in, redirecting to home...
      </p>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center mb-12 pb-40 pt-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-300 to-orange-400"
  >
    <div
      class="flex flex-col items-center justify-center border-1 p-6 sm:p-8 md:p-12 rounded-md bg-white border-gray-200 shadow-lg w-full max-w-md lg:max-w-lg xl:max-w-xl"
    >
      <!-- Show the login form if not logged in -->
      <div>
        <h1 class="text-4xl font-bold mb-2">Login</h1>
        <p class="text-lg text-center mb-6">
          Login to your account, check your travel
        </p>
        <form
          class="flex flex-col space-y-4 w-full"
          @submit.prevent="handleLogin()"
        >
          <div>
            <label
              for="email"
              class="text-md block font-semibold tracking-wider text-gray-700"
            >
              Email address
            </label>
            <input
              v-model="loginCred.email"
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              :class="[
                'mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400',
                err
                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                  : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
              ]"
            />
          </div>
          <div>
            <label
              for="password"
              class="text-md block font-semibold tracking-wider text-gray-700"
            >
              Password
            </label>
            <div class="relative">
              <input
                v-model="loginCred.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                id="password"
                placeholder="Enter your password"
                :class="[
                  'relative z-0 mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400',
                  err
                    ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                    : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
                ]"
              />
              <div
                @click="togglePasswordVisibility()"
                class="cursor-pointer absolute right-4 top-3 z-10"
              >
                <div v-if="!showPassword" class="text-gray-500">
                  <EyeClosed />
                </div>
                <div v-else class="text-gray-500"><Eye /></div>
              </div>
              <p v-if="err != ''" class="text-red-600">{{ err }}</p>
            </div>
            <RouterLink
              to="/auth/forgot-password"
              class="mt-1 text-orange inline-block rounded text-sm text-amber-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              Forgot password?
            </RouterLink>
          </div>

          <button type="submit" class="text-white">
            <p
              class="p-2 bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 hover:shadow-lg duration-300 rounded"
            >
              Login
            </p>
          </button>
          <div class="flex justify-center">
            <RouterLink
              class="mt-3 text-orange hover:underline inline-block rounded text-center text-sm text-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
              to="/auth/register"
            >
              Need to create an account?
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, onMounted } from 'vue'
import { EyeClosed, Eye } from 'lucide-vue-next'
import useFirebase from '@/composables/useFirebase'
import useLanguage from '@/composables/useLanguage'
import useCustomUser from '@/composables/useCustomUser'
import { useRouter } from 'vue-router'

export default {
  components: {
    EyeClosed,
    Eye,
  },
  setup() {
    const { login, firebaseUser } = useFirebase()
    const { setLocale } = useLanguage()
    const router = useRouter()
    const { restoreCustomUser, customUser } = useCustomUser()

    const loginCred = ref({
      email: 'root@root.com',
      password: 'root123',
    })
    const err = ref('')
    const showPassword = ref(false)

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    // Redirect if already logged in
    onMounted(() => {
      if (firebaseUser.value) {
        console.log(
          '#101 LoginScreen.vue - already logged in, redirecting...',
          firebaseUser.value,
        )
        setTimeout(() => {
          router.replace('/')
        }, 100) // Redirect after 100 ms
      }
    })

    const handleLogin = () => {
      login(loginCred.value.email, loginCred.value.password)
        .then(() => {
          err.value = ''
          restoreCustomUser().then(() => {
            if (customUser.value?.locale) {
              setLocale(customUser.value.locale)
            }
            router.replace('/')
          })
        })
        .catch(error => {
          console.error('Login error:', error)
          err.value = error.message || 'An error occurred during login'
          if (error.message.includes('auth/invalid-credential')) {
            err.value = 'Wrong credentials'
          } else if (error.message.includes('auth/missing-password')) {
            err.value = 'Missing password'
          }
        })
    }

    return {
      loginCred,
      err,
      showPassword,
      togglePasswordVisibility,
      handleLogin,
      firebaseUser,
    }
  },
}
</script>
