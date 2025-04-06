import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateActivityInput } from './dto/create-activity.input'
import { UpdateActivityInput } from './dto/update-activity.input'
import { Activity } from './entities/activity.entity'
import { LocationInput } from 'src/location/dto/update-location.input'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { BookableActivityService } from '../bookable-activity/bookable-activity.service'
import { LocationService } from '../location/location.service'
@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: MongoRepository<Activity>,

    @Inject(forwardRef(() => BookableActivityService))
    private readonly bookableActivitiesService: BookableActivityService,

    private readonly locationService: LocationService,
  ) {}

  create(createactivityInput: CreateActivityInput) {
    // console.log(createactivityInput)
    if (!createactivityInput) {
      throw new Error('No input provided')
    }

    const activity = new Activity()
    activity.name = createactivityInput.name
    activity.bannerImageUrl = createactivityInput.bannerImageUrl
    activity.headerImageUrl = createactivityInput.headerImageUrl
    activity.ageGroup = createactivityInput.ageGroup
    activity.description = createactivityInput.description
    activity.bookingSettings = createactivityInput.bookingSettings
    activity.recommended = createactivityInput.recommended
    activity.safetyMeasures = createactivityInput.safetyMeasures
    activity.locationId = createactivityInput.locationId
    activity.equipmentProvided = createactivityInput.equipmentProvided
    activity.duration = createactivityInput.duration
    activity.bookableActivitiesIds = []
    activity.reviewsIds = []

    return this.activityRepository.save(activity)
  }

  async findByLocationAndDate(
    location: LocationInput,
    startDate: string,
    endDate: string,
  ) {
    try {
      // Step 1: Fetch all activities by location.
      let activities = await this.activityRepository.find()
      console.log('activities', activities)
      //now resolve the location for each activity

      for (const activity of activities) {
        activity.location = await this.locationService.findOne(
          activity.locationId,
        )
      }

      console.log('activities Location', activities[0].location)

      activities = activities.filter(activity => {
        console.log(
          'activity.location.geolocation.coordinates',
          activity.location.geolocation.coordinates,
        )
        return (
          activity.location.geolocation.coordinates[0] >=
            location.longitude - 0.2 &&
          activity.location.geolocation.coordinates[0] <=
            location.longitude + 0.2 &&
          activity.location.geolocation.coordinates[1] >=
            location.latitude - 0.2 &&
          activity.location.geolocation.coordinates[1] <=
            location.latitude + 0.2
        )
      })

      console.log('activities after filter', activities)

      if (!activities.length) {
        return [] // Return early if no activities are found.
      }

      for (const activity of activities) {
        //  resolve their bookable
        activity.bookableActivities =
          await this.bookableActivitiesService.findManyByIds(
            activity.bookableActivitiesIds,
          )
      }

      // console.log('startDate', startDate)
      // console.log('endDate', endDate)

      console.log('activities after inject Activity based on Id ', activities)

      const startDateObj =
        typeof startDate === 'string' ? new Date(startDate) : startDate
      const endDateObj =
        typeof endDate === 'string' ? new Date(endDate) : endDate
      // console.log('#Activities.service.ts @ 123')
      // console.log('startDateObj', startDateObj)
      // console.log('endDateObj', endDateObj)

      const filteredBookableActivities = activities
        .map(activity => {
          activity.bookableActivities = activity.bookableActivities.filter(
            bookableActivity => {
              const bookableStartDate = new Date(bookableActivity.startDate)

              const bookableEndDate = new Date(bookableActivity.endDate)

              // console.log('Checking:', {
              //   bookableStartDate: bookableStartDate.toISOString(),
              //   bookableEndDate: bookableEndDate.toISOString(),
              //   startDateObj: startDateObj.toISOString(),
              //   endDateObj: endDateObj.toISOString(),
              // })

              return (
                bookableStartDate >= startDateObj &&
                bookableEndDate <= endDateObj
              )
            },
          )
          return activity
        })
        .filter(activity => activity.bookableActivities.length > 0)

      console.log(
        'filteredBookableActivities with time',
        filteredBookableActivities,
      )

      // DEBUG PURPOSE
      for (const activity of filteredBookableActivities) {
        // console.log('activity:', activity.name)
        const newArrayFilterIdIds = []
        for (const bookableActivity of activity.bookableActivities) {
          // ow chatgpt become my blade once more, cook for me
          // fix a new array of ids
          newArrayFilterIdIds.push(bookableActivity.id)
        }

        activity.bookableActivitiesIds = newArrayFilterIdIds
      }

      console.log(
        'filteredBookableActivities before ending',
        filteredBookableActivities,
      )

      return filteredBookableActivities
    } catch (error) {
      console.log('Error fetching activities by location and date:', error)
      throw new Error('Failed to fetch activities. Please try again.')
    }
  }

  findByName(name: string) {
    return this.activityRepository.findOneBy({ name })
  }

  findAll() {
    return this.activityRepository.find()
  }

  async AddBookableActivityIdToActivity(
    activityId: string,
    bookableId: string,
  ) {
    const activity = await this.findOne(activityId)

    const bookableActivity =
      await this.bookableActivitiesService.findOne(bookableId)

    if (!activity || !bookableActivity) {
      throw new Error('Activity or BookableActivity not found')
    }

    activity.bookableActivitiesIds.push(bookableId)
    return this.update(activity)
  }

  findOne(id: string) {
    // kies object id van mongoDB!
    const objId = new ObjectId(id)
    return this.activityRepository.findOneBy({ _id: objId })
  }

  // find by many ids
  async findManyByIds(ids: string[]): Promise<Activity[]> {
    const objectIds = ids.map(id => new ObjectId(id))
    return this.activityRepository.find({ where: { _id: { $in: objectIds } } })
  }

  async update(updateActivityInput: UpdateActivityInput): Promise<Activity> {
    await this.activityRepository.update(
      updateActivityInput.id,
      updateActivityInput,
    )
    return await this.findOne(updateActivityInput.id)
  }

  remove(id: number) {
    return this.activityRepository.delete(id)
  }

  truncate() {
    return this.activityRepository.clear()
  }
}
