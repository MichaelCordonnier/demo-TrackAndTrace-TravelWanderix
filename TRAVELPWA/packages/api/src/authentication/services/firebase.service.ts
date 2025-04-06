import { Injectable } from '@nestjs/common'
import { App, applicationDefault, initializeApp } from 'firebase-admin/app'
import { Auth } from 'firebase-admin/lib/auth/auth'
import { getAuth } from 'firebase-admin/auth'

@Injectable()
export class FirebaseService {
  private firebaseApp: App

  constructor() {
    this.firebaseApp = initializeApp({
      credential: applicationDefault(), // Environment variable GOOGLE_APPLICATION_CREDENTIALS
    })

    if (!(this.firebaseApp.options.credential as any).projectId) {
      throw new Error(
        '\n\n⛔️ Firebase app not initialized.\nYou probably forgot to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.\n',
      )
    }
  }

  getAuth = (): Auth => getAuth()

  verifyToken = async (token: string) => {
    const decodedToken = await this.getAuth().verifyIdToken(token)
    return decodedToken
  }
}
