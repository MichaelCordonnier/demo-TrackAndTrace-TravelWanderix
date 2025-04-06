import type { Activity } from './activity.interface'
import type {
  BookableSettings,
  BookableSettingsInput,
} from './bookableSettings.interface'
import type { Booking } from './booking.interface'

export interface BookableActivity {
  id: string
  activityId: string
  activity?: Activity
  recommended?: boolean
  name: string
  status?: string
  description: string
  startDate: Date
  endDate: Date
  location?: Location | null
  equipmentProvided?: string[] | []
  safetyMeasures?: string[] | []
  // puur voor frontend in backend zal het altijd een array van string zijn
  bookingIds?: string[] | [] | string
  bookings?: Booking[] | []
  createdById?: string
  totalPrice?: number
  bookableSettings?: BookableSettings | null
  __typename?: string
}

export interface CreateBookableActivityInput {
  activityId: string
  startDate: Date // Use string to represent time in HH:mm format
  duration: number
  status: string
  recommended: boolean
  bookableSettings: BookableSettingsInput
  bookingIds: string[]
  createdById: string
}

export interface UpdateBookableActivityInput
  extends Partial<CreateBookableActivityInput> {
  id: string
}
