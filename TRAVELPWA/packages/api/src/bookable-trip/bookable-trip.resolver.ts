import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { BookableTripService } from './bookable-trip.service'
import { BookableTrip } from './entities/bookable-trip.entity'
import { CreateBookableTripInput } from './dto/create-bookable-trip.input'
import { Booking } from '../booking/entities/booking.entity'
import { BookingService } from '../booking/booking.service'
import { Trip } from '../trip/entities/trip.entity'
import { TripService } from '../trip/trip.service'
import { UpdateBookableTripInput } from './dto/update-bookable-trip.input'
import { User } from '../users/entities/user.entity'
import { ReportService } from '../report/report.service'
import { UsersService } from '../users/users.service'
import { AllowedRoles } from '../users/decorators/roles.decorator'
import { UseGuards } from '@nestjs/common'
import { Role } from '../users/entities/user.entity'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'

@Resolver(() => BookableTrip)
export class BookableTripResolver {
  constructor(
    private readonly bookableTripService: BookableTripService,
    private readonly bookingService: BookingService,
    private readonly tripService: TripService,
    private readonly reportService: ReportService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => BookableTrip)
  createBookableTrip(
    @Args('createBookableTripInput')
    createBookableTripInput: CreateBookableTripInput,
  ) {
    console.log('createBookableTripInput:', createBookableTripInput)
    return this.bookableTripService.create(createBookableTripInput)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => BookableTrip, { name: 'updateBookableTrip' })
  updateBookableTrip(
    @Args('updateBookableTripInput')
    updateBookableTripInput: UpdateBookableTripInput,
  ) {
    return this.bookableTripService.update(
      updateBookableTripInput.id,
      updateBookableTripInput,
    )
  }

  @Query(() => [BookableTrip], { name: 'bookableTrips' })
  findAll() {
    return this.bookableTripService.findAll()
  }

  @Query(() => BookableTrip, { name: 'bookableTrip' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.bookableTripService.findOne(id)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => Boolean)
  removeBookableTrip(@Args('id', { type: () => String }) id: string) {
    return this.bookableTripService.remove(id)
  }

  @ResolveField(() => [Booking], { nullable: true })
  async bookings(@Parent() bookableTrip: BookableTrip) {
    {
      if (bookableTrip.bookingIds.length === 0) {
        return []
      }
      return this.bookingService.findManyByIds(bookableTrip.bookingIds)
    }
  }

  @ResolveField(() => Trip, { nullable: true })
  async trip(@Parent() bookableTrip: BookableTrip) {
    return await this.tripService.findOne(bookableTrip.tripId)
  }

  @ResolveField(() => User, { nullable: true })
  async assignedGuide(@Parent() bookableTrip: BookableTrip) {
    const { assignedGuideId } = bookableTrip

    // Validate assignedGuideId format (example for MongoDB ObjectId)
    if (!assignedGuideId || !/^[0-9a-fA-F]{24}$/.test(assignedGuideId)) {
      console.error('Invalid assignedGuideId:', assignedGuideId)
      return null
    }

    try {
      const res = await this.userService.findById(assignedGuideId)
      console.log('assignedGuide:', res)
      return res
    } catch (error) {
      console.error('Error fetching assignedGuide:', error)
      return null
    }
  }

  @ResolveField(() => [Report], { nullable: true })
  async reports(@Parent() bookableTrip: BookableTrip) {
    if (!bookableTrip.reportIds || bookableTrip.reportIds.length === 0) {
      return []
    }
    return this.reportService.findManyByIds(bookableTrip.reportIds)
  }
}
