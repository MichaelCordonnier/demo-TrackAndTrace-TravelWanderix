import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateReviewInput } from './dto/create-review.input'

import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'

import { ObjectId } from 'mongodb'

import { Review } from './entities/review.entity'
import { TripService } from '../trip/trip.service'

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: MongoRepository<Review>,

    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,

    // tip voor stef: hier moet er nog een activity service ;)
  ) {}

  findAll() {
    return this.reviewRepository.find()
  }

  findOne(id: string) {
    const objId = new ObjectId(id)
    return this.reviewRepository.findOneBy({ _id: objId })
  }
  async findManyByIds(ids: string[]): Promise<Review[]> {
    //('ids', ids)
    const objectIds = ids.map(id => new ObjectId(id))
    return this.reviewRepository.find({ where: { _id: { $in: objectIds } } })
  }

  async create(createReviewInput: CreateReviewInput) {
    const review = new Review()
    review.rating = createReviewInput.rating
    review.review = createReviewInput.review
    review.userId = createReviewInput.userId

    if (!createReviewInput.tripId) {
      throw new Error('tripId is required to create a review')
    }

    const trip = await this.tripService.findOne(
      createReviewInput.tripId.toString(),
    )

    //('trip', trip)

    if (!trip) {
      throw new Error('Trip not found')
    }

    const savedReview = await this.reviewRepository.save(review)

    trip.reviewsIds.push(savedReview.id)

    return this.tripService.update(trip.id, trip)
  }

  async remove(id: string, tripId: string) {
    await this.tripService.removeReviewFromTrip(id, tripId)

    const result = await this.reviewRepository.delete(id)
    if (result.affected === 0) {
      throw new Error('Review not found')
    }
    return result
  }

  // seeding functions below
  async truncate() {
    return this.reviewRepository.clear()
  }

  async saveAll(reviews: Review[]) {
    return this.reviewRepository.save(reviews)
  }
}
