import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { Review } from './entities/review.entity'
import { CreateReviewInput } from './dto/create-review.input'
import { UseGuards } from '@nestjs/common'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'
import { AllowedRoles } from '../users/decorators/roles.decorator'
import { Role } from '../users/entities/user.entity'

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.USER, Role.GUIDE)
  @Mutation(() => Review)
  createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ) {
    return this.reviewService.create(createReviewInput)
  }

  @Query(() => [Review], { name: 'reviews' })
  findAll() {
    return this.reviewService.findAll()
  }

  @Query(() => Review, { name: 'review' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.reviewService.findOne(id)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.USER, Role.GUIDE)
  @Mutation(() => Boolean) // Returning Boolean to confirm deletion success
  removeReview(
    @Args('id', { type: () => String }) id: string,
    @Args('tripId', { type: () => String }) tripId: string,
  ) {
    return this.reviewService.remove(id, tripId)
  }
}
