// bookableTrip.interface.ts
import type {
  BookableSettings,
  BookableSettingsInput,
} from './bookableSettings.interface'
import type { Report } from './report.interface'
import type { Booking } from './booking.interface'

import type { Trip } from './trip.interface'
import type { User } from './user.interface'

export interface BookableTrip {
  id: string
  tripId: string
  trip: Trip
  startDate: string
  endDate: string
  status: string
  createById: string
  bookableSettings: BookableSettings
  bookingIds: string[]
  bookings: Booking[]
  assignedGuideId: string
  assignedGuide: User

  __typename?: string
  reports: Report[]
}

export interface CreateBookableTripInput {
  tripId: string
  startDate: Date
  status: string
  bookableSettings: BookableSettingsInput
  bookingIds: string[]
  createById: string
  assignedGuideId: string
}

export interface UpdateBookableTripInput
  extends Partial<CreateBookableTripInput> {
  id: string
}
