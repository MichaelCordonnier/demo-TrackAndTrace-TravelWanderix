import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { BookableActivityService } from './bookable-activity.service'
import { BookableActivity } from './entities/bookable-activity.entity'
import { CreateBookableActivityInput } from './dto/create-bookable-activity.input'
import { Activity } from 'src/activities/entities/activity.entity'
import { ActivitiesService } from '../activities/activities.service'
import { UpdateBookableActivityInput } from './dto/update-bookable-activity.input'
import { UseGuards } from '@nestjs/common'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'
import { AllowedRoles } from '../users/decorators/roles.decorator'
import { Role } from '../users/entities/user.entity'
import { Booking } from 'src/booking/entities/booking.entity'
import { BookingService } from 'src/booking/booking.service'
// import { UpdateBookableActivityInput } from './dto/update-bookable-activity.input'

@Resolver(() => BookableActivity)
export class BookableActivityResolver {
  constructor(
    private readonly bookableActivityService: BookableActivityService,
    private readonly activitiesService: ActivitiesService,
    private readonly bookingService: BookingService,
  ) {}

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => BookableActivity)
  createBookableActivity(
    @Args('createBookableActivityInput')
    createBookableActivityInput: CreateBookableActivityInput,
  ) {
    return this.bookableActivityService.create(createBookableActivityInput)
  }

  @Query(() => [BookableActivity], { name: 'bookableActivity' })
  findAll() {
    return this.bookableActivityService.findAll()
  }

  @Query(() => BookableActivity, { name: 'bookableActivity' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.bookableActivityService.findOne(id)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => BookableActivity, { name: 'updateBookableActivity' })
  updateBookableActivity(
    @Args('updateBookableActivityInput')
    updateBookableActivityInput: UpdateBookableActivityInput,
  ) {
    const res = this.bookableActivityService.update(
      updateBookableActivityInput.id,
      updateBookableActivityInput,
    )

    // console.log('#bookable-activity.resolver.ts: res')

    return res
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @Mutation(() => BookableActivity)
  removeBookableActivity(@Args('id', { type: () => Int }) id: string) {
    return this.bookableActivityService.remove(id)
  }

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN)
  @ResolveField(() => [Booking], { nullable: true })
  async bookings(@Parent() bookableActivity: BookableActivity) {
    if (bookableActivity.bookingIds.length === 0) {
      return []
    }
    return this.bookingService.findManyByIds(bookableActivity.bookingIds)
  }

  @ResolveField(() => Activity)
  async activity(
    @Parent() bookableActivity: BookableActivity,
  ): Promise<Activity> {
    return this.activitiesService.findOne(bookableActivity.activityId)
  }
}
