<template>
  <div
    class="flex flex-col items-center justify-center mb-12 pb-20 pt-20 px-4 sm:px-6 lg:px-8 bg-gray-100"
  >
    <div
      class="flex flex-col items-start justify-center border-1 p-6 sm:p-8 md:p-12 rounded-md bg-white border-gray-200 shadow-lg w-full max-w-md lg:max-w-lg xl:max-w-xl"
    >
      <h1 class="text-4xl font-bold mb-2">Register</h1>
      <p class="text-lg text-center mb-6">
        Create an account and keep track of your Trips.
      </p>
      <form
        class="flex flex-col space-y-4 w-full"
        @submit.prevent="handleRegister"
      >
        <div>
          <p class="text-red-600" v-if="error">{{ error.message }}</p>
        </div>
        <div>
          <label
            for="username"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Create Username</label
          >
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            :class="[
              'mt-1 block w-full rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
              usernameError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
            v-model="newUser.username"
          />
          <p class="text-red-600" v-if="usernameError">{{ usernameError }}</p>
        </div>
        <div>
          <label
            for="email"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Email address</label
          >
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Enter your email"
            :class="[
              'mt-1 block w-full rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
              emailError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
            v-model="newUser.email"
          />
          <p class="text-red-600" v-if="emailError">{{ emailError }}</p>
        </div>
        <div>
          <label
            for="locale"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Choose your language</label
          >
          <select
            name="locale"
            id="locale"
            v-model="newUser.locale"
            class="mt-1 block w-full rounded-md border-2 border-gray-300 p-2 focus:outline-none focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <option
              v-for="locale in mylocales"
              :value="locale.value"
              :key="locale.value"
            >
              {{ locale.label }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="gender"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Choose your gender</label
          >
          <select
            name="gender"
            id="gender"
            v-model="newUser.gender"
            :class="[
              'mt-1 block w-full rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
              genderError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
          >
            <option
              v-for="gender in mygenders"
              :value="gender.value"
              :key="gender.value"
            >
              {{ gender.label }}
            </option>
          </select>
          <p class="text-red-600" v-if="genderError">{{ genderError }}</p>
        </div>
        <div>
          <label
            for="password"
            class="text-md block font-semibold tracking-wider text-gray-700"
            >Password</label
          >
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            :class="[
              'mt-1 block w-full rounded-md border-2 p-2 focus:outline-none focus-visible:ring-2',
              passwordError
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-400'
                : 'border-gray-300 focus-visible:border-amber-500 focus-visible:ring-amber-400',
            ]"
            v-model="newUser.password"
          />
          <p class="text-red-600" v-if="passwordError">{{ passwordError }}</p>
        </div>
        <button type="submit" class="text-white">
          <p
            class="p-2 bg-gradient-to-br from-amber-300 to-orange-400 hover:scale-105 hover:shadow-lg duration-300 rounded"
          >
            Register
          </p>
        </button>
        <div class="flex justify-center">
          <RouterLink
            class="mt-3 text-orange hover:underline inline-block rounded text-center text-sm text-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            to="/auth/login"
          >
            Already have an account?
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import useCustomUser from '@/composables/useCustomUser'
import useFirebase from '@/composables/useFirebase'
import useLanguage from '@/composables/useLanguage'
import { ADD_NEW_USER } from '@/graphql/user/user.mutation'
import { useMutation } from '@vue/apollo-composable'
import type { AuthError } from 'firebase/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const { register } = useFirebase()
    const { replace } = useRouter()
    const newUser = ref({
      username: '',
      email: '',
      password: '',
      locale: 'en',
      gender: '',
    })

    const mylocales = [
      { value: 'en', label: 'English' },
      { value: 'nl', label: 'Nederlands' },
      { value: 'es', label: 'Español' },
      { value: 'cz', label: 'Chinese' },
    ]

    const mygenders = [
      { value: 'female', label: 'female' },
      { value: 'male', label: 'male' },
      { value: 'other', label: 'other' },
    ]

    const { mutate: addUserMutation, loading: addUserLoadingMutation } =
      useMutation(ADD_NEW_USER)

    const error = ref<AuthError | null>(null)
    const usernameError = ref<string | null>(null)
    const emailError = ref<string | null>(null)
    const passwordError = ref<string | null>(null)
    const genderError = ref<string | null>(null)
    const { customUser } = useCustomUser()
    const { setLocale } = useLanguage()

    const handleRegister = async (event: Event) => {
      event.preventDefault()
      let hasError = false

      if (!newUser.value.username) {
        usernameError.value = 'Username is required'
        hasError = true
      } else {
        usernameError.value = null
      }

      if (!newUser.value.email) {
        emailError.value = 'Email is required'
        hasError = true
      } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(newUser.value.email)) {
          emailError.value = 'Please enter a valid email address'
          hasError = true
        } else {
          emailError.value = null
        }
      }

      if (newUser.value.password.length < 8) {
        passwordError.value = 'Password must be at least 8 characters long'
        hasError = true
      } else {
        passwordError.value = null
      }

      if (!newUser.value.gender) {
        genderError.value = 'Please choose an option'
        hasError = true
      } else {
        genderError.value = null
      }

      if (hasError) {
        return
      }

      register(
        newUser.value.username,
        newUser.value.email,
        newUser.value.password,
      )
        .then(newFirebaseUser => {
          //('User registered', newFirebaseUser)

          //call a mutation to add a custom user
          addUserMutation({
            myinput: {
              uid: newFirebaseUser.uid,
              email: newUser.value.email,
              username: newUser.value.username,
              locale: newUser.value.locale,
              role: 'USER',
              gender: newUser.value.gender,
            },
          }).then(result => {
            //('User added', result)
            customUser.value = result?.data.createOwnUseraccount // <------ Update the customUser with the new user
            replace('/myaccount')

            setLocale(result?.data.createOwnUseraccount.locale)
          })

          //replace('/myaccount')
        })
        .catch((err: AuthError) => {
          error.value = err
        })
    }

    return {
      newUser,
      mylocales,
      mygenders,
      handleRegister,
      error,
      usernameError,
      emailError,
      passwordError,
      genderError,
    }
  },
}
</script>
