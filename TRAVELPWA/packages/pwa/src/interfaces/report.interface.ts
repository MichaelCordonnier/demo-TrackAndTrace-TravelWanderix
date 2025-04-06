import type { BookableTrip } from './bookableTrip.interface'
import type { User } from './user.interface'

export interface Report {
  id: string
  title: string
  date: Date
  description: string
  guideId: string
  guide: User
  bookableTripId: string
  bookableTrip: BookableTrip
}

export interface CreateReportInput {
  id?: string
  title: string
  date: Date
  description: string
  guideId: string
  bookableTripId: string
}
