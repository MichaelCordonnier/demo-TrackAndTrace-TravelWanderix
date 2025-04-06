import { BookableTrip } from '../../bookable-trip/entities/bookable-trip.entity'
import { CreateBookableTripInput } from '../../bookable-trip/dto/create-bookable-trip.input'

export const createBookableTripInputStub = (): CreateBookableTripInput => {
  const bookableTrip = new CreateBookableTripInput()
  bookableTrip.tripId = '1'
  bookableTrip.startDate = new Date()
  bookableTrip.status = 'open'
  bookableTrip.bookableSettings = {
    max_persons: 10,
    price: 100,
    places: 10,
    min_persons_required: 5,
    autocancel: true,
    autocancel_on: new Date(),
  }
  bookableTrip.bookingIds = ['1']

  return bookableTrip
}

export const bookableTripStub = (): BookableTrip => {
  const bookableTrip = new BookableTrip()
  bookableTrip.id = '1'
  bookableTrip.tripId = '1'
  bookableTrip.startDate = new Date()
  bookableTrip.endDate = new Date()
  bookableTrip.status = 'open'
  bookableTrip.bookableSettings = {
    max_persons: 10,
    price: 100,
    places: 10,
    min_persons_required: 5,
    autocancel: true,
    autocancel_on: new Date(),
  }
  bookableTrip.bookingIds = ['1']

  return bookableTrip
}
