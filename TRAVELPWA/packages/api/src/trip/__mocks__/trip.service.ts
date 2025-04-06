import { tripStub } from '../stubs/trip.stub'

export const TripService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(tripStub()),
  findAll: jest.fn().mockResolvedValue([tripStub()]),
  findOne: jest.fn().mockResolvedValue(tripStub()),
  remove: jest.fn().mockResolvedValue(true),
})
