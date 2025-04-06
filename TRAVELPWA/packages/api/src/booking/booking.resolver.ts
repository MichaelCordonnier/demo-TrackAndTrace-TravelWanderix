import {
  Resolver,
  Mutation,
  Args,
  Query,
  Parent,
  ResolveField,
} from '@nestjs/graphql'
import { BookingService } from './booking.service'
import { Booking } from './entities/booking.entity'
import { CreateBookingInput } from './dto/create-booking.input'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'

import { FirebaseBookingGuard } from 'src/authentication/guards/firebase.booking.guard'
import { BookableActivity } from 'src/bookable-activity/entities/bookable-activity.entity'
import { BookableActivityService } from 'src/bookable-activity/bookable-activity.service'
import { BookableTripService } from 'src/bookable-trip/bookable-trip.service'
import { BookableTrip } from 'src/bookable-trip/entities/bookable-trip.entity'
import { UseGuards } from '@nestjs/common'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'
import { AllowedRoles } from '../users/decorators/roles.decorator'
import { Role } from '../users/entities/user.entity'

@Resolver(() => Booking)
export class BookingResolver {
  constructor(
    private readonly bookingService: BookingService,
    private readonly userService: UsersService,
    private readonly bookableActivityService: BookableActivityService,

    private readonly bookableTripService: BookableTripService,
  ) {}

  @Query(() => Booking, { name: 'booking' })
  async findById(@Args('id') id: string): Promise<Booking> {
    const result = await this.bookingService.findById(id)

    return result
  }

  @Query(() => [Booking], { name: 'bookings' })
  async findAll(): Promise<Booking[]> {
    return await this.bookingService.findAll()
  }

  @UseGuards(FirebaseBookingGuard)
  @Mutation(() => Booking)
  createBooking(
    @Args('createBookingInput') createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    return this.bookingService.createBooking(createBookingInput)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.USER)
  @Mutation(() => Booking)
  async deleteBooking(@Args('id') id: string): Promise<Booking> {
    return await this.bookingService.deleteBooking(id)
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() booking: Booking): Promise<User> {
    return this.userService.findById(booking.personId)
  }

  @ResolveField(() => BookableActivity, { nullable: true })
  async bookableActivity(
    @Parent() booking: Booking,
  ): Promise<BookableActivity> {
    return this.bookableActivityService.findOne(booking.bookableActivityId)
  }

  @ResolveField(() => BookableTrip, { nullable: true })
  async bookableTrip(@Parent() booking: Booking): Promise<BookableTrip> {
    return this.bookableTripService.findOne(booking.bookableTripId)
  }

  @ResolveField(() => Booking, { nullable: true })
  async parentBooking(@Parent() booking: Booking): Promise<Booking> {
    return this.bookingService.getBookingTripBasedOnBookingActivity(booking)
  }
}
