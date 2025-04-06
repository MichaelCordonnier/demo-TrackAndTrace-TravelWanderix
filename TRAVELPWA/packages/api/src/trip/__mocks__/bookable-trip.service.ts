import { bookableTripStub } from '../stubs/bookable-trip.stub'

export const BookableTripService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(bookableTripStub()),
  findAll: jest.fn().mockResolvedValue([bookableTripStub()]),
  findOne: jest.fn().mockResolvedValue(bookableTripStub()),
  remove: jest.fn().mockResolvedValue({ affected: 1, raw: '' }),
})
