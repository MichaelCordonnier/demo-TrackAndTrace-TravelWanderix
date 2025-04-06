// bookingSettings.interface.ts
export interface BookingSettings {
  max_participants: number
  min_participants: number
  auto_cancel: boolean
  auto_cancel_days_before: number
  price: number
}

export interface BookingSettingsInput {
  max_participants: number
  min_participants: number
  auto_cancel: boolean
  auto_cancel_days_before: number
  price: number
}
