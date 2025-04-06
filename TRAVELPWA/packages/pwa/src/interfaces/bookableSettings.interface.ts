// bookableSettings.interface.ts
export interface BookableSettings {
  places: number
  autocancel: boolean
  autocancel_on: Date
  min_persons_required: number
  max_persons: number
  price: number
}

export interface BookableSettingsInput {
  places: number
  autocancel: boolean
  autocancel_on?: Date
  min_persons_required: number
  max_persons: number
  price: number
}
