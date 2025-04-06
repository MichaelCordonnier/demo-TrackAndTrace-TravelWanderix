import type { Booking } from './booking.interface'

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUIDE = 'GUIDE',
}

export interface CustomUser {
  id: string | undefined
  gender: string
  email: string
  username: string
  imageUrl: string
  uid: string // Firebase UID
  locale: string
  role: string
  createdAt?: Date
  updatedAt?: Date
  bookingIds: string[]
  bookings: Booking[]
}
