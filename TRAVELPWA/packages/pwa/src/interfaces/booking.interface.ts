import type { Activity } from './activity.interface'
import type { BookableActivity } from './bookableActivity.interface'
import type { BookableTrip } from './bookableTrip.interface'
import type { Trip } from './trip.interface'
import type { User } from './user.interface'

export interface ExtraPerson {
  name: string
  email: string
}

export interface Booking {
  id: string
  type: string
  how_many: number
  bookableTrip?: BookableTrip
  startDate: string
  endDate: string
  personId: string
  extra_persons?: ExtraPerson[]
  totalPrice: number
  trip?: Trip
  user?: User
  activity?: Activity
  bookableTripId?: string
  bookableActivityId?: string
  bookableActivity?: BookableActivity
  parentBooking?: Booking
}
