// src/composables/useFirebase.ts
import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { ref } from 'vue'

// Replace the following with your app's [Firebase project configuration](https://firebase.google.com/docs/web/learn-more#config-object)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firebaseUser = ref<User | null>(auth.currentUser) // reactive ref met de huidige user in

if (import.meta.env.VITE_EMULATOR)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099')

const login = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        firebaseUser.value = userCredential.user // ik stop die in het ref object die de user bijhoudt. ! Bij een ref object moet je altijd de value property gebruiken
        resolve(userCredential.user)
      })
      .catch(error => {
        reject(error)
      })
  })
}
const register = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  //you want to save the accountname

  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        firebaseUser.value = userCredential.user // Na het aanmaken sla ik ook de user op
        updateProfile(firebaseUser.value, { displayName: name }) // ik sla de naam van de user op
        resolve(userCredential.user)
      })
      .catch(error => {
        reject(error)
      })
  })
}
const resetPassword = async (email: string): Promise<String> => {
  return new Promise((resolve, reject) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        resolve('Email sent')
      })
      .catch(error => {
        reject(error)
        return error
      })
  })
}

const restoreUser = async (): Promise<User | null> => {
  return new Promise(resolve => {
    onAuthStateChanged(auth, user => {
      if (user) {
        firebaseUser.value = user
        resolve(user)
      } else {
        firebaseUser.value = null
        resolve(null)
      }
    })
  })
}

const reloadUser = async (): Promise<User | null> => {
  console.log('restoring User NOW... ')
  const user = auth.currentUser
  if (user) {
    console.log('User found:', user)
    try {
      await user.reload() // Refresh the user's data
      firebaseUser.value = auth.currentUser // Update the ref with the latest user data
      console.log('User reloaded:', auth.currentUser)
      return auth.currentUser
    } catch (error) {
      console.error('Failed to reload user:', error)
      throw error
    }
  } else {
    firebaseUser.value = null
    return null
  }
}

const logout = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    signOut(auth)
      .then(() => {
        firebaseUser.value = null
        resolve()
      })
      .catch(error => {
        reject(error)
      })
  })
}
const updateUsername = async (newUsername: string): Promise<void> => {
  const user = firebaseUser.value // Store the value in a local variable

  if (!user) {
    throw new Error('User is not authenticated')
  }

  return new Promise((resolve, reject) => {
    updateProfile(user, { displayName: newUsername })
      .then(() => {
        resolve()
      })
      .catch(error => {
        reject(error)
      })
  })
}

// const getUserById = async (uid: string): Promise<User | null> => {
//   const { customUser, restoreCustomUser } = useCustomUser()

//   await restoreCustomUser()

//   if (customUser.value?.role !== Role.ADMIN) {
//     console.error('Current user is not an admin ACCES DENIED')
//     return null
//   }

//   return new Promise((resolve, reject) => {
//     admin
//       .auth()
//       .getUser(uid)
//       .then(userRecord => {
//         resolve(userRecord.toJSON() as User)
//       })
//       .catch(error => {
//         reject(error)
//       })
//   })
// }

// Return hetgene wat ik later wil gebruiken in mijn componenten, views, ...
export default () => {
  // State for each composable
  return {
    firebaseUser,
    login,
    logout,
    register,
    resetPassword,
    restoreUser,
    reloadUser,
    updateUsername,
    // getUserById,
  }
}
