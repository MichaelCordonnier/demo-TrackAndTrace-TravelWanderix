import { CreateTripInput } from '../dto/create-trip.input'
import { Trip } from '../entities/trip.entity'

export const createTripInputStub = (): CreateTripInput => ({
  name: 'My Trip',
  headerImageUrl: 'https://www.example.com',
  bannerImageUrl: 'https://www.example.com',
  description: 'My Trip Description',
  ageGroup: '18-25',
  startDate: new Date('2021-01-01'),
  endDate: new Date('2021-01-03'),
  bookingSettings: {
    max_participants: 10,
    min_participants: 1,
    price: 100,
    auto_cancel: false,
    auto_cancel_days_before: 0,
  },
})

export const tripStub = (): Trip => ({
  id: '507f1f77bcf86cd799439011',
  name: 'My Example',
  headerImageUrl: 'https://www.example.com',
  bannerImageUrl: 'https://www.example.com',
  description: 'My Trip Description',
  ageGroup: '18-25',
  startDate: new Date('2021-01-01'),
  endDate: new Date('2021-01-03'),
  bookingSettings: {
    max_participants: 10,
    min_participants: 1,
    price: 100,
    auto_cancel: false,
    auto_cancel_days_before: 0,
  },
  bookableTripsIds: [],
  itinerary: [],
  reviewsIds: [],
  madeById: 'user123',
  countries: ['Country1', 'Country2'],
  reviewList: [],
  bookableTrips: [],
})

export const updatedTripStub = (): Trip => ({
  id: '507f1f77bcf86cd799439011',
  name: 'My Updated Trip',
  headerImageUrl: 'https://www.example.com',
  bannerImageUrl: 'https://www.example.com',
  description: 'My Updated Trip Description',
  ageGroup: '18-25',
  startDate: new Date('2021-01-01'),
  endDate: new Date('2021-01-03'),
  bookingSettings: {
    max_participants: 10,
    min_participants: 1,
    price: 100,
    auto_cancel: false,
    auto_cancel_days_before: 0,
  },
  bookableTripsIds: [],
  itinerary: [],
  reviewsIds: [],
  madeById: 'user123',
  countries: ['Country1', 'Country2'],
  reviewList: [],
  bookableTrips: [],
})
