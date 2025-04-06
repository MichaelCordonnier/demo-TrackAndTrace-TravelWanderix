import type { BookableTrip } from './bookableTrip.interface'
import type { BookingSettings } from './bookingSettings.interface'
import type { Day } from './day.interface'
import type { Review } from './review.interface'

export interface Trip {
  id: string
  bannerImageUrl?: string
  headerImageUrl?: string
  name?: string
  ageGroup?: string
  description: string
  startDate?: Date
  endDate?: Date
  createdAt?: Date
  updatedAt?: Date
  itinerary?: Day[]
  madeById?: string
  countries?: string[]
  bookingSettings?: BookingSettings
  reviewsIds?: string[]
  reviews?: Review[]
  bookableTripsIds?: string[]
  bookableTrips?: BookableTrip[]
  __typename?: string
}
