// @ts-ignore
import type { ObjectId } from 'mongodb'
import type { Activity } from './activity.interface'
import type { Booking } from './booking.interface'
import type { Location } from './location.interface'

export interface Day {
  label: any
  id: string
  day_number?: number
  date: Date
  location_id: ObjectId
  location?: Location
  bookidActivitys: string[]
  activities?: Booking[]
}
