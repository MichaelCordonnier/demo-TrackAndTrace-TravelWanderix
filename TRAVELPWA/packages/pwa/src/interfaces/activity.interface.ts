import type { BookableActivity } from './bookableActivity.interface'
import type {
  BookingSettings,
  BookingSettingsInput,
} from './bookingSettings.interface'
import type { Review } from './review.interface'

export interface Activity {
  id: string
  bannerImageUrl?: string
  headerImageUrl?: string
  ageGroup?: string
  name: string
  duration?: number
  locationId?: string
  location?: Location
  description?: string
  recommended: boolean
  equipmentProvided?: string[]
  safetyMeasures?: string[]
  createdAt?: Date
  updatedAt?: Date
  madeById?: string
  bookingSettings?: BookingSettings
  bookableActivitiesIds?: string[]
  bookableActivities?: BookableActivity[]
  reviewsIds?: string[]
  reviewList?: Review[]
  __typename?: string
}

export interface CreateActivityInput {
  name: string
  bannerImageUrl: string
  headerImageUrl: string
  recommended: boolean
  ageGroup: string
  description: string
  duration: number
  equipmentProvided?: string[]
  safetyMeasures?: string[]
  locationId: string
  bookingSettings: BookingSettingsInput
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  id: string
}
