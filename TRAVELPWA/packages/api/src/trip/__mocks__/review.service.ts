import { reviewStub } from '../stubs/review.stub'

export const ReviewService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(reviewStub()),
  findAll: jest.fn().mockResolvedValue([reviewStub()]),
  findOne: jest.fn().mockResolvedValue(reviewStub()),
  remove: jest.fn().mockResolvedValue({ affected: 1, raw: '' }),
})
