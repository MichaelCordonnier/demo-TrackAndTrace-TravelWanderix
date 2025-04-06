import { bookableActivityStub } from '../stubs/bookable-activity.stub'

export const BookableActivityService = jest.fn().mockReturnValue({
  findOne: jest.fn().mockResolvedValue(bookableActivityStub()),
})
