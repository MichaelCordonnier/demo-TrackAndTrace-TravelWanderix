import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-http-bearer'
import { auth } from 'firebase-admin'
import * as firebaseAdmin from 'firebase-admin'

import { FirebaseService } from 'src/authentication/services/firebase.service'

type DecodedIdToken = firebaseAdmin.auth.DecodedIdToken
export type FirebaseAuthDecodedUser = Readonly<
  Pick<DecodedIdToken, 'uid' | 'email' | 'email_verified'>
>

export const StrategyName = 'firebase-auth'

@Injectable()
export class FirebaseAuthStrategyMock extends PassportStrategy(
  Strategy,
  StrategyName,
) {
  private readonly checkRevoked = false
  private readonly logger = new Logger(FirebaseAuthStrategyMock.name)

  constructor(private readonly firebase: FirebaseService) {
    super()
  }

  async validate(jwtToken: string): Promise<auth.UserRecord> {
    // const payload = await this.authorize(jwtToken)
    // const user = await this.firebase.getAuth().getUser(payload.uid)

    // if (user.disabled) {
    //   throw new ForbiddenException()
    // }
    // return user
    if (
      jwtToken !==
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBkMGU4NmJkNjQ3NDBjYWQyNDc1NjI4ZGEyZWM0OTZkZjUyYWRiNWQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Fkdi1mdWxsLXN0YWNrLTIwMjItdGVzdCIsImF1ZCI6ImFkdi1mdWxsLXN0YWNrLTIwMjItdGVzdCIsImF1dGhfdGltZSI6MTY5NzM4OTcxOSwidXNlcl9pZCI6IjBQSVQ4RVVldVVadmJreGV6NEhWd0tzNUdWazEiLCJzdWIiOiIwUElUOEVVZXVVWnZia3hlejRIVndLczVHVmsxIiwiaWF0IjoxNjk4OTIyMTIwLCJleHAiOjE2OTg5MjU3MjAsImVtYWlsIjoic2RxZnFkc2ZxZHNmZHNkc2ZxcWZnQGRkZC5kZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJzZHFmcWRzZnFkc2Zkc2RzZnFxZmdAZGRkLmRkIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.aTZu66nOt8Sx9JeCbN_Q2cI2AnffvPok4dbcYJm8Gad0Xfz-DpUAw524i7LGpXbOraftd5PlkUjeMmD1fYpstezUdsnckoHmAmh_NaLZQ3OZ5HhjYfdtd-tsKRCnxQuWqd_QC5xo9rT8rpBb2WatXhaMZVbDgB7QbPUUJy4dLSQwAr73paAVJ3eave9R4-8c8q4FU7HXB6_Qeih5Ie-i54xEWoA-da3gHs0A_rWWwDOSgnh4pqMEWWMbe5PZQ0szjOykTS0nDafcL4_R0NdEeUYIR7RXBxy0LOO8WP8k5DF0oZlbtZBQc1UFiVKlquuSv2xZzsHQ-VALID-A'
    ) {
      throw new UnauthorizedException()
    }

    const userRec: auth.UserRecord = new Object() as auth.UserRecord

    Object.assign(userRec, {
      uid: '0PIT8EUeuUZvbkxez4HVwKs5GVk1',
      email: 'sdqfqdsfqdsfdsqfg@howest.be',
      emailVerified: false,
      displayName: '',
      photoURL: undefined,
      phoneNumber: undefined,
      disabled: false,
      metadata: {
        creationTime: 'Thu, 02 Nov 2023 14:43:19 GMT',
        lastSignInTime: 'Thu, 02 Nov 2023 14:43:19 GMT',
        lastRefreshTime: 'Thu, 02 Nov 2023 14:43:19 GMT',
      },
      providerData: [
        {
          uid: 'sdqfqdsfqdsfdsqfg@howest.be',
          displayName: '',
          email: 'sdqfqdsfqdsfdsqfg@howest.be',
          photoURL: undefined,
          providerId: 'password',
          phoneNumber: undefined,
        },
      ],
      passwordHash: undefined,
      passwordSalt: undefined,
      tokensValidAfterTime: 'Thu, 02 Nov 2023 14:43:19 GMT',
      tenantId: undefined,
    })

    return userRec
  }

  // private async authorize(jwtToken: string): Promise<DecodedIdToken> {
  //   try {
  //     return await this.firebase
  //       .getAuth()
  //       .verifyIdToken(jwtToken, this.checkRevoked)
  //   } catch (err: unknown) {
  //     const e = err as FirebaseError
  //     if (e.code === 'auth/id-token-expired') {
  //       this.logger.warn('auth/id-token-expired')
  //     } else if (e.code === 'auth/id-token-revoked') {
  //       this.logger.warn('auth/id-token-revoked')
  //     }

  //     throw new UnauthorizedException()
  //   }
  // }
}
