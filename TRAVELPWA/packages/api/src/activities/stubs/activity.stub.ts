import { locationStub } from './location.stub'
import { bookableActivityStub } from './bookable-activity.stub'
import { BookingSettings } from '../../entities/booking-settings.entity'

export const createActivityDtoStub = () => ({
  name: 'Test Activity',
  bannerImageUrl: 'http://example.com/banner.jpg',
  headerImageUrl: 'http://example.com/header.jpg',
  recommended: true,
  ageGroup: 'All ages',
  description: 'This is a test activity',
  duration: 120,
  equipmentProvided: ['Helmet', 'Gloves'],
  safetyMeasures: ['Wear helmet', 'Follow instructions'],
  locationId: '507f1f77bcf86cd799439011',
  bookingSettings: {
    maxParticipants: 10,
    minParticipants: 2,
    // bookingDeadline: new Date('2021-01-01T00:00:00.000Z'),
    autoCancel: true,
    autoCancelDaysBefore: 3,
    price: 100,
  },
})

export const activityStub = () => ({
  id: '507f1f77bcf86cd799439013',
  name: 'Test Activity',
  description: 'This is a test activity',
  bannerImageUrl: 'http://example.com/banner.jpg',
  headerImageUrl: 'http://example.com/header.jpg',
  recommended: true,
  ageGroup: 'All ages',
  duration: 120,
  equipmentProvided: ['Helmet', 'Gloves'],
  safetyMeasures: ['Wear helmet', 'Follow instructions'],
  locationId: '507f1f77bcf86cd799439011',
  location: locationStub(),
  bookableActivitiesIds: ['507f1f77bcf86cd799439012'],
  bookableActivities: [bookableActivityStub()],
  reviewsIds: [],
  reviewList: [],
  madeById: '507f1f77bcf86cd799439014',
  bookingSettings: new BookingSettings(),
  createdAt: new Date('2021-01-01T00:00:00.000Z'),
  updatedAt: new Date('2021-01-01T00:00:00.000Z'),
})
