import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { ActivitiesService } from './activities.service'
import { Activity } from './entities/activity.entity'
import { LocationInput } from '../location/dto/update-location.input'
import { CreateActivityInput } from './dto/create-activity.input'
import { UpdateActivityInput } from './dto/update-activity.input'
import { UseGuards } from '@nestjs/common'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'
import { ReviewService } from '../review/review.service'
import { BookableActivityService } from '../bookable-activity/bookable-activity.service'
import { Review } from '../review/entities/review.entity'
import { BookableActivity } from '../bookable-activity/entities/bookable-activity.entity'
import { LocationService } from '../location/location.service'

@Resolver(() => Activity)
export class ActivitiesResolver {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly reviewService: ReviewService,
    private readonly bookableActivityService: BookableActivityService,
    private readonly LocationService: LocationService,
  ) {}

  @UseGuards(FirebaseGuard)
  @Mutation(() => Activity)
  createActivity(
    @Args('createActivityInput') createActivityInput: CreateActivityInput,
  ) {
    return this.activitiesService.create(createActivityInput)
  }

  @Query(() => [Activity], { name: 'activities' })
  findAll() {
    return this.activitiesService.findAll()
  }

  @Query(() => Activity, { name: 'activity' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.activitiesService.findOne(id)
  }

  @Query(() => [Activity], { name: 'activitiesByLocationAndDate' })
  async findByLocationAndDate(
    @Args('location', { type: () => LocationInput }) location: LocationInput,
    @Args('endDate', { type: () => String }) endDate: string,
    @Args('startDate', { type: () => String }) startDate: string,
  ) {
    return this.activitiesService.findByLocationAndDate(
      location,
      startDate,
      endDate,
    )
  }

  // @UseGuards(FirebaseGuard)
  @Mutation(() => Activity)
  async updateActivity(
    @Args('updateActivityInput') updateActivityInput: UpdateActivityInput,
  ) {
    const res = await this.activitiesService.update(updateActivityInput)
    // console.log(res)
    return res
  }

  @UseGuards(FirebaseGuard)
  @Mutation(() => Activity)
  removeActivity(@Args('id', { type: () => Int }) id: number) {
    return this.activitiesService.remove(id)
  }

  @ResolveField(() => [Review], { nullable: true })
  async reviewList(@Parent() activity: Activity) {
    if (!activity.reviewsIds || activity.reviewsIds.length === 0) {
      return []
    }
    return this.reviewService.findManyByIds(activity.reviewsIds)
  }

  @ResolveField(() => [BookableActivity], { nullable: true })
  async bookableActivities(@Parent() activity: Activity) {
    // console.log('#89# ActivitiesResolver bookableActivities')
    if (
      !activity.bookableActivitiesIds ||
      activity.bookableActivitiesIds.length === 0
    ) {
      console.log('No bookable activities found')
      return []
    }
    return await this.bookableActivityService.findManyBookableActivities(
      activity.bookableActivitiesIds,
    )
  }

  @ResolveField(() => Location, { nullable: true })
  async location(@Parent() activity: Activity) {
    return this.LocationService.findOne(activity.locationId)
  }
}
