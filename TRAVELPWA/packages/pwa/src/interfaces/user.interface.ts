import type { BookableTrip } from './bookableTrip.interface'
import type { Booking } from './booking.interface'
import type { Chatroom } from './Chatroom.interface'
import type { Report } from './report.interface'

export interface User {
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
  reportIds?: string[]
  reports?: Report[]
  assignedBookableTripIds?: string[]
  assignedBookableTrips?: BookableTrip[]
  chatroomIds?: string[]
  chatrooms?: Chatroom[]
}
