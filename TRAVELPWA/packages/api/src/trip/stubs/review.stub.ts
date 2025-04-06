import { CreateReviewInput } from '../../review/dto/create-review.input'
import { Review } from '../../review/entities/review.entity'

export const createReviewInputStub = (): CreateReviewInput => {
  const review = new CreateReviewInput()
  review.rating = 5
  review.review = 'Great trip'
  review.userId = '1'
  review.tripId = '1'

  return review
}

export const reviewStub = (): Review => {
  const review = new Review()
  review.id = '1'
  review.rating = 5
  review.review = 'Great trip'
  review.userId = '1'
  return review
}
