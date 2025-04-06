import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateBookableActivityInput } from './dto/create-bookable-activity.input'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { BookableActivity } from './entities/bookable-activity.entity'
import { ActivitiesService } from '../activities/activities.service'
import { BookableSettings } from '../entities/bookable-settings.entity'
import { UpdateBookableActivityInput } from './dto/update-bookable-activity.input'
import { Activity } from '../activities/entities/activity.entity'
import { BookingService } from '../booking/booking.service'

import { MailerService } from '../mailer/mailer.service'
import { sendMailDto } from '../mailer/mail.interface'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { ChatroomService } from '../chatroom/chatroom.service'
import { Cron } from '@nestjs/schedule'
import { StatusBookables } from '../entities/statusBookables'

@Injectable()
export class BookableActivityService {
  @InjectRepository(BookableActivity)
  private readonly bookableActivityRepository: MongoRepository<BookableActivity>

  @Inject(forwardRef(() => ActivitiesService))
  private readonly activitiesService: ActivitiesService

  @Inject(forwardRef(() => BookingService))
  private readonly bookingService: BookingService

  @Inject(forwardRef(() => MailerService))
  private readonly mailerService: MailerService

  @Inject(forwardRef(() => UsersService))
  private readonly userService: UsersService

  @Inject(forwardRef(() => ChatroomService))
  private readonly chatroomService: ChatroomService

  private readonly configService: ConfigService

  async create(createBookableActivityInput: CreateBookableActivityInput) {
    // first check if the location exists
    let activity = new Activity()

    // console.log(
    //   '#49 bookable-activity-service : createBookableActivityInput',
    //   createBookableActivityInput,
    // )

    try {
      activity = await this.activitiesService.findOne(
        createBookableActivityInput.activityId,
      )
    } catch (error) {
      console.error(
        `Failed to find activity with id ${createBookableActivityInput.activityId}:`,
        error,
      )
    }

    if (!activity) {
      throw new Error(
        `Activity with id ${createBookableActivityInput.activityId} not found`,
      )
    }

    const bookableActivity = new BookableActivity()

    bookableActivity.startDate = createBookableActivityInput.startDate

    const endDate = new Date(createBookableActivityInput.startDate)

    endDate.setHours(endDate.getHours() + activity.duration)

    bookableActivity.endDate = endDate

    bookableActivity.status = StatusBookables.OPEN

    bookableActivity.name = activity.name

    bookableActivity.description = activity.description

    bookableActivity.recommended = activity.recommended
    bookableActivity.createdById = createBookableActivityInput.createdById

    bookableActivity.bookingIds = []
    // fix?
    bookableActivity.activityId = activity.id

    const bookableSettings = new BookableSettings()

    bookableSettings.max_persons = activity.bookingSettings.max_participants

    bookableSettings.price = activity.bookingSettings.price

    bookableSettings.places = activity.bookingSettings.max_participants

    bookableSettings.min_persons_required =
      activity.bookingSettings.min_participants

    //autocancel true or false
    bookableSettings.autocancel = activity.bookingSettings.auto_cancel

    if (bookableSettings.autocancel) {
      const autoCancelDate = new Date(endDate)

      autoCancelDate.setDate(
        autoCancelDate.getDate() -
          activity.bookingSettings.auto_cancel_days_before,
      )

      bookableSettings.autocancel_on = autoCancelDate
    }

    bookableActivity.bookableSettings = bookableSettings

    const bookable =
      await this.bookableActivityRepository.save(bookableActivity)

    await this.activitiesService.AddBookableActivityIdToActivity(
      activity.id,
      bookable.id,
    )

    return bookable
  }

  findAll() {
    return `This action returns all bookable activities`
  }

  findManyByIds(ids: string[]) {
    const objectIds = ids.map(id => new ObjectId(id))
    return this.bookableActivityRepository.find({
      where: { _id: { $in: objectIds } },
    })
  }

  async update(
    id: string,
    updateBookableActivityInput: UpdateBookableActivityInput,
  ) {
    const objId = new ObjectId(id)

    console.log('updateBookableActivityInput', updateBookableActivityInput)

    // remove the field in bookableSettings.places we dont want to update this field directly from the frontend we want to update it from the backend

    // checken of we de max_persons niet lager zetten dan het aantal bookings

    const oldActivity = await this.bookableActivityRepository.findOneBy({
      _id: objId,
    })

    console.log('oldActivity:', oldActivity)

    if (!oldActivity) {
      throw new Error(`Bookable activity with id ${id} not found`)
    }

    console.log(
      'New max value is:',
      updateBookableActivityInput.bookableSettings.max_persons,
      'The current places are:',
      oldActivity.bookableSettings.places,
    )

    // check if max persons is not negative
    if (updateBookableActivityInput.bookableSettings.max_persons <= 0) {
      throw new Error(`Max persons cannot be negative`)
    }

    if (
      oldActivity.bookingIds.length >
      updateBookableActivityInput.bookableSettings.max_persons
    ) {
      throw new Error(
        `Cannot update max persons to ${updateBookableActivityInput.bookableSettings.max_persons} because there are already ${oldActivity.bookingIds.length} bookings`,
      )
    }
    // check if max persons is being updated
    if (
      updateBookableActivityInput.bookableSettings.max_persons !==
      oldActivity.bookableSettings.max_persons
    ) {
      console.log('We are going to update the max persons')

      // set the places to the new max persons - the current bookings
      updateBookableActivityInput.bookableSettings.places =
        updateBookableActivityInput.bookableSettings.max_persons

      for (const bookingId of oldActivity.bookingIds) {
        const booking = await this.bookingService.findById(bookingId)
        if (!booking) {
          continue
        }

        if (
          booking.how_many >
          updateBookableActivityInput.bookableSettings.max_persons
        ) {
          throw new Error(
            `Cannot update max persons to ${updateBookableActivityInput.bookableSettings.max_persons} because there are already ${booking.how_many} bookings`,
          )
        }

        // update the booking
        updateBookableActivityInput.bookableSettings.places -= booking.how_many
      }
    }

    // check if the activity exists

    if (!oldActivity) {
      throw new Error(`Bookable activity with id ${id} not found`)
    }

    // check if the startdate is changed
    if (
      updateBookableActivityInput.startDate &&
      new Date(updateBookableActivityInput.startDate).getTime() !==
        new Date(oldActivity.startDate).getTime()
    ) {
      console.log('We are going to update the startdate of the activity')
      const endDate = new Date(updateBookableActivityInput.startDate)

      const refActivity = await this.activitiesService.findOne(
        oldActivity.activityId,
      )

      endDate.setHours(endDate.getHours() + refActivity.duration)

      updateBookableActivityInput.endDate = endDate

      // now check evryone that is booked on this activity
      const allAffectedBookings = await this.bookingService.findByManyIds(
        oldActivity.bookingIds,
      )

      // their are bookings that are affected
      // console.log('#173 allAffectedBookings:', allAffectedBookings.length)

      // for eachone update the new starthour and endhour
      for (const booking of allAffectedBookings) {
        // update the booking
        // console.log(
        //   '#184 booking:',
        //   booking.id,
        //   'is affected has userid:' + booking.personId,
        // )

        await this.bookingService.updateStartHourAndEndHourActivityFromBookings(
          booking.id,
          {
            startDate: updateBookableActivityInput.startDate,
            endDate: updateBookableActivityInput.endDate,
          },
        )
      }
      // console.log('#193')

      // now send a mail to all the users that are booked on this activity
      for (const booking of allAffectedBookings) {
        // get user based on id
        const userAffected = await this.userService.findOneById(
          booking.personId,
        )

        // console.log('userAffected:', userAffected)

        const sendMailDto: sendMailDto = {
          from: {
            name: 'Wanderix Service',
            address: 'wanderix@info.be',
          },
          recipients: [
            {
              name: userAffected.username,
              address: userAffected.email,
            },
          ],
          subject: 'Booking Update',
          placeholderReplacements: {
            bookingId: booking.id,
            startDate: updateBookableActivityInput.startDate.toDateString(),
            endDate: updateBookableActivityInput.endDate.toDateString(),
          },
          html: '<p>Your booking {{bookingId}} has been updated. New dates: {{startDate}} to {{endDate}}</p>',
        }

        // send mail
        const confirm = await this.mailerService.sendMail(sendMailDto)

        console.log('#220 mail sent:', confirm)
      }
    }

    // we can also update it to cancelled
    if (updateBookableActivityInput.status === StatusBookables.CANCELLED) {
      console.log('We are going to cancel the activity')
      const allAffectedBookings = await this.bookingService.findByManyIds(
        oldActivity.bookingIds,
      )

      // set the bookings to zero
      updateBookableActivityInput.bookingIds = []
      updateBookableActivityInput.bookableSettings.places =
        oldActivity.bookableSettings.max_persons

      updateBookableActivityInput.status = StatusBookables.CANCELLED

      // for eachone update the new starthour and endhour
      for (const booking of allAffectedBookings) {
        const userAffected = await this.userService.findOneById(
          booking.personId,
        )

        // delete booking
        await this.bookingService.deleteBooking(booking.id)

        const sendMailDto: sendMailDto = {
          from: {
            name: 'Wanderix Service',
            address: 'wanderix@info.be',
          },
          recipients: [
            {
              name: userAffected.username,
              address: userAffected.email,
            },
          ],
          subject: 'Booking ACTIVITY has been cancelled',
          placeholderReplacements: {
            bookingId: booking.id,
            startDate: updateBookableActivityInput.startDate.toDateString(),
            endDate: updateBookableActivityInput.endDate.toDateString(),
          },
          html: '<p>Your booking {{bookingId}} has been cancelled. Contact the tour operator for more info</p>',
        }

        const confirm = await this.mailerService.sendMail(sendMailDto)

        console.log('#220 mail sent:', confirm)
      }
    }
    // console.log('#221')
    await this.bookableActivityRepository.update(
      objId,
      updateBookableActivityInput,
    )

    return this.bookableActivityRepository.findOneBy({ _id: objId })
  }

  findOne(id: string) {
    // //(id)
    const objId = new ObjectId(id)
    return this.bookableActivityRepository.findOneBy({ _id: objId })
  }

  findManyBookableActivities(ids: string[]) {
    const objectIds = ids.map(id => new ObjectId(id))
    return this.bookableActivityRepository.find({
      where: { _id: { $in: objectIds } },
    })
  }

  async remove(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new Error(`Bookable activity ID is required`)
      }

      await this.bookableActivityRepository.delete(id)
      return true
    } catch (error) {
      console.error(`Failed to remove bookable activity with id ${id}:`, error)
      return false
    }
  }

  async truncate() {
    return this.bookableActivityRepository.clear()
  }

  async saveAll(bookableActivities: BookableActivity[]) {
    return this.bookableActivityRepository.save(bookableActivities)
  }

  // cron job to check if the activity is still bookable
  // @Cron('0 0 * * * *')
  // for demo purpose evry 5 minutes
  @Cron('0 0 * * * *')
  async checkBookablesAndUpdateStatusIfNecessary() {
    const bookabels = await this.bookableActivityRepository.find()

    for (const bookable of bookabels) {
      if (bookable.status === StatusBookables.CANCELLED) {
        continue
      }

      if (bookable.status === StatusBookables.FINISHED) {
        continue
      }

      const now = new Date()
      // if startdate is less then 10 days set state to closed

      const diffTime = bookable.startDate.getTime() - now.getTime()

      const diffDays = diffTime / (1000 * 3600 * 24)

      // first lets check if autocancl is on
      if (bookable.bookableSettings.autocancel) {
        if (now > bookable.bookableSettings.autocancel_on) {
          // check if we have required minimum persons
          if (
            bookable.bookingIds.length <
            bookable.bookableSettings.min_persons_required
          ) {
            bookable.status = StatusBookables.CANCELLED

            await this.update(bookable.id, bookable)

            continue
          }
        }
      }

      if (diffDays < 0) {
        bookable.status = StatusBookables.FINISHED
        await this.bookableActivityRepository.save(bookable)
      }

      if (diffDays < 10) {
        if (bookable.status !== StatusBookables.CLOSED) {
          bookable.status = StatusBookables.CLOSED
          await this.bookableActivityRepository.save(bookable)
        }
      }
    }
  }
}
