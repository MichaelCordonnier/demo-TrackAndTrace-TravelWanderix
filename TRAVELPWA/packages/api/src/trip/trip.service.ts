import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateTripInput } from './dto/create-trip.input'
import { UpdateTripInput } from './dto/update-trip.input'
import { Trip } from './entities/trip.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { ReviewService } from '../review/review.service'
import { BookableTripService } from '../bookable-trip/bookable-trip.service'

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: MongoRepository<Trip>,

    @Inject(forwardRef(() => ReviewService))
    private readonly reviewService: ReviewService,

    @Inject(forwardRef(() => BookableTripService))
    private readonly bookableTripService: BookableTripService,
  ) {}

  create(createTripInput: CreateTripInput) {
    //(createTripInput)

    const { name, startDate, endDate, bookingSettings } = createTripInput

    const trip = new Trip()
    trip.name = name
    trip.headerImageUrl = createTripInput.headerImageUrl
    trip.bannerImageUrl = createTripInput.bannerImageUrl
    trip.description = createTripInput.description
    trip.ageGroup = createTripInput.ageGroup
    trip.startDate = startDate
    trip.endDate = endDate
    trip.reviewsIds = []
    trip.itinerary = []
    trip.bookableTripsIds = []
    trip.bookingSettings = { ...bookingSettings }

    return this.tripRepository.save(trip)
  }

  findAll() {
    return this.tripRepository.find()
  }

  async findOne(id: string): Promise<Trip | undefined> {
    try {
      const objId = new ObjectId(id)
      return await this.tripRepository.findOneBy({ _id: objId })
    } catch (error) {
      console.error(`Failed to find trip with id ${id}:`, error)
      throw new Error(`Trip not found with id ${id}`)
    }
  }

  async findOneByName(name: string): Promise<Trip | undefined> {
    return await this.tripRepository.findOne({ where: { name } })
  }

  // add bookableId to trip based on id
  async addBookableTripToTrip(tripId: string, bookableId: string) {
    //('tripId', tripId)
    const trip = await this.findOne(tripId)
    //('trip', trip)

    const bookableTrip = await this.bookableTripService.findOne(bookableId)
    //('bookableTrip', bookableTrip)
    if (!trip || !bookableTrip) {
      throw new Error('Trip or BookableTrip not found')
    }

    trip.bookableTripsIds.push(bookableId)
    return this.update(tripId, trip)
  }

  update(id: string, updateTripInput: UpdateTripInput) {
    console.log(
      'indien dit een test is, mag je dit infeite niet lezen of je bent fout bezig :)',
    )
    return this.tripRepository.update(id, updateTripInput)
  }

  async remove(id: string) {
    const trip = await this.findOne(id)

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`)
    }

    if (trip.reviewsIds && trip.reviewsIds.length > 0) {
      for (const reviewId of trip.reviewsIds) {
        await this.reviewService.remove(reviewId, trip.id)
      }
    }
    await this.tripRepository.delete(id)

    return true
  }

  // remove review from trip
  async removeReviewFromTrip(tripId: string, reviewId: string) {
    const trip = await this.findOne(tripId)

    if (!trip) {
      throw new Error('Trip not found')
    }

    trip.reviewsIds = trip.reviewsIds.filter(id => id !== reviewId)

    return this.update(tripId, trip)
  }

  // seeding functions below

  async truncate() {
    return this.tripRepository.clear()
  }

  async saveAll(trips: Trip[]) {
    return this.tripRepository.save(trips)
  }
}
