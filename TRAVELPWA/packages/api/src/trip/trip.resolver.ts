import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { TripService } from './trip.service'
import { Trip } from './entities/trip.entity'
import { CreateTripInput } from './dto/create-trip.input'
import { UpdateTripInput } from './dto/update-trip.input'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'
import { UseGuards } from '@nestjs/common'
// import { CurrentFirebaseUser } from '../decorators/user.decorator'
// import { UserRecord } from 'firebase-admin/auth'
import { ReviewService } from '../review/review.service'
import { Review } from '../review/entities/review.entity'
import { BookableTrip } from '../bookable-trip/entities/bookable-trip.entity'
import { BookableTripService } from '../bookable-trip/bookable-trip.service'
import { AllowedRoles } from '../users/decorators/roles.decorator'
import { Role } from '../users/entities/user.entity'
// import { SkipThrottle } from '@nestjs/throttler'

@Resolver(() => Trip)
export class TripResolver {
  constructor(
    private readonly tripService: TripService,
    private readonly reviewService: ReviewService,
    private readonly bookableTripsService: BookableTripService,
  ) {}

  @UseGuards(FirebaseGuard)
  @Mutation(() => Trip)
  createTrip(@Args('createTripInput') createTripInput: CreateTripInput) {
    return this.tripService.create(createTripInput)
  }

  // @SkipThrottle()
  @Query(() => [Trip], { name: 'trips' })
  // @AllowedRoles(Role.USER)
  findAll() {
    return this.tripService.findAll()
  }

  @Query(() => Trip, { name: 'trip' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.tripService.findOne(id)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => Trip)
  updateTrip(@Args('updateTripInput') updateTripInput: UpdateTripInput) {
    // if (updateTripInput.madeById !== user.uid) {
    //   throw new Error('Unauthorized')
    // }

    console.log(updateTripInput)
    return this.tripService.update(updateTripInput.id, updateTripInput)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => Boolean) // Assuming Boolean to indicate success
  removeTrip(@Args('id', { type: () => String }) id: string) {
    return this.tripService.remove(id)
  }

  @ResolveField(() => [Review], { nullable: true })
  async reviews(@Parent() trip: Trip) {
    if (!trip.reviewsIds || trip.reviewsIds.length === 0) {
      return []
    }
    return this.reviewService.findManyByIds(trip.reviewsIds)
  }

  @ResolveField(() => [BookableTrip], { nullable: true })
  async bookableTrips(@Parent() trip: Trip) {
    if (!trip.bookableTripsIds || trip.bookableTripsIds.length === 0) {
      return []
    }
    return await this.bookableTripsService.findManyBookableTrips(
      trip.bookableTripsIds,
    )
  }
}
