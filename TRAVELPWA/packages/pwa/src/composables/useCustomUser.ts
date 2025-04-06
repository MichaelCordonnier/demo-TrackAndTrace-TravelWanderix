//useCustomUser.ts
import type { CustomUser } from '@/interfaces/custom.user.interface'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'
import {
  GET_OWN_USER_ACCOUNT,
  GET_USER_WITH_CHATROOMS,
} from '@/graphql/user/user.query'

import useGraphql from './useGraphql'
import useFirebase from './useFirebase'
import type { User } from '@/interfaces/user.interface'

const { firebaseUser, logout } = useFirebase()

const customUser = ref<User>()

const { apolloClient } = useGraphql()

provideApolloClient(apolloClient)

const restoreCustomUser = async () => {
  return new Promise<void>((resolve, reject) => {
    if (!firebaseUser.value) {
      //('No firebase user found, skipping custom user restoration.')
      resolve()
      return
    }

    // //('Executing query:', GET_OWN_USER_ACCOUNT.loc?.source.body) // Log the query as a string
    apolloClient
      .query({
        query: GET_OWN_USER_ACCOUNT,
      })
      .then(result => {
        if (result.data) {
          customUser.value = result.data.ownUseraccount
        }
        // //('Custom user restored:', customUser.value)
        resolve()
      })
      .catch(error => {
        console.error('Error fetching custom user:', error)
        if (error) {
          // de user kan niet gevonden worden, dus gaan we uitloggen omdat deze user niet bestaat in de database (wel in firebase)
          customUser.value = undefined
          logout()
        }

        reject(error)
      })
  })
}

const restoreCustomUserWithChatrooms = async () => {
  return new Promise<void>((resolve, reject) => {
    if (!firebaseUser.value) {
      //('No firebase user found, skipping custom user restoration.')
      resolve()
      return
    }

    // //('Executing query:', GET_USER_WITH_CHATROOMS.loc?.source.body) // Log the query as a string
    apolloClient
      .query({
        query: GET_USER_WITH_CHATROOMS,
      })
      .then(result => {
        if (result.data) {
          customUser.value = result.data.ownUseraccount
        }
        // //('Custom user restored:', customUser.value)
        resolve()
      })
      .catch(error => {
        console.error('Error fetching custom user:', error)
        if (error) {
          // de user kan niet gevonden worden, dus gaan we uitloggen omdat deze user niet bestaat in de database (wel in firebase)
          customUser.value = undefined
          logout()
        }

        reject(error)
      })
  })
}

const logoutCustomUser = () => {
  customUser.value = undefined
}

// get all users with their mail and uid

export default () => {
  return {
    customUser,
    restoreCustomUser,
    logoutCustomUser,
    restoreCustomUserWithChatrooms,
  }
}
