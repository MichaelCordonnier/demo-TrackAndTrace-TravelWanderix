import { locationStub } from '../stubs/location.stub'

export const LocationService = jest.fn().mockReturnValue({
  findOne: jest.fn().mockResolvedValue(locationStub()),
})
