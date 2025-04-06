import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { DayService } from './day.service'
import { Day } from './entities/day.entity'
import { CreateDayInput } from './dto/create-day.input'
import { LocationService } from 'src/location/location.service'
import { Location } from 'src/location/entities/location.entity'
import { ActivitiesService } from 'src/activities/activities.service'
// DEPRECTAED MAAR NIET DELETEN
// import { Activity } from 'src/activities/entities/activity.entity'
import { Booking } from 'src/booking/entities/booking.entity'
import { BookingService } from 'src/booking/booking.service'

@Resolver(() => Day)
export class DayResolver {
  constructor(
    private readonly dayService: DayService,
    private readonly locationService: LocationService,
    private readonly activityService: ActivitiesService,
    private readonly bookingService: BookingService,
  ) {}

  @Mutation(() => Day)
  createDay(
    @Args('tripId') tripId: string,
    @Args('createDayInput') createDayInput: CreateDayInput,
  ): Promise<Day> {
    return this.dayService.create(tripId, createDayInput)
  }

  // get all days of a trip
  @Query(() => [Day])
  findAllDays(@Args('tripId') tripId: string): Promise<Day[]> {
    return this.dayService.findAll(tripId)
  }

  // get a day by id
  @Query(() => Day)
  findOneDay(
    @Args('tripId') tripId: string,
    @Args('dayId') dayId: string,
  ): Promise<Day> {
    return this.dayService.findOne(tripId, dayId)
  }

  @ResolveField(() => Location, { nullable: true })
  async location(@Parent() day: Day): Promise<Location> {
    //(day)
    //(`trying to find location ${day.location_id}`)
    if (!day.location_id) {
      return null
    }
    return this.locationService.findOne(day.location_id.toString())
  }
  // DEPRECTAED MAAR NIET DELETEN
  // @ResolveField(() => Activity, { nullable: true })
  // async recommendedActivity(@Parent() day: Day): Promise<Activity> {
  //   if (!day.recommendActivityId) {
  //     return null
  //   }
  //   return this.activityService.findOne(day.recommendActivityId)
  // }

  @ResolveField(() => [Booking], { nullable: true })
  async activities(@Parent() day: Day): Promise<Booking[]> {
    // console.log(day.bookidActivitys)
    if (!day.bookidActivitys) {
      // console.log(day.bookidActivitys)

      return []
    }

    return this.bookingService.findManyByIds(day.bookidActivitys)
  }
}
