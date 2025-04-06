import type { ExtraPerson } from './booking.interface'

export interface CreateBookingInput {
  type: string
  fireAuthId: string
  bookable_activity_id?: string | null
  booking_trip_id?: string | null
  bookable_trip_id?: string | null
  extraPersons?: ExtraPerson[]
}
