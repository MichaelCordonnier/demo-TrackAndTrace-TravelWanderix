import { Injectable } from '@nestjs/common'
import { TripService } from 'src/trip/trip.service'
import * as trips from './data/trips.json'
// import * as bookablestrips from './data/bookableSlotsTrips.json'
import * as activities from './data/activities.json'
import { ReviewService } from 'src/review/review.service'
import { CreateReviewInput } from 'src/review/dto/create-review.input'
import { CreateDayInput } from 'src/day/dto/create-day.input'
import { DayService } from 'src/day/day.service'
import { LocationService } from 'src/location/location.service'
import { CreateTripInput } from 'src/trip/dto/create-trip.input'
import { CreateBookableTripInput } from 'src/bookable-trip/dto/create-bookable-trip.input'
import { BookableTripService } from 'src/bookable-trip/bookable-trip.service'
import { Booking, ExtraPersonInput } from 'src/booking/entities/booking.entity'
import { UsersService } from 'src/users/users.service'
import { BookingService } from 'src/booking/booking.service'
import { CreateBookingInput } from 'src/booking/dto/create-booking.input'
import { ActivitiesService } from '../activities/activities.service'
import { BookableActivityService } from 'src/bookable-activity/bookable-activity.service'
import { CreateActivityInput } from 'src/activities/dto/create-activity.input'
import { Role } from 'src/users/entities/user.entity'
import { CreateBookableActivityInput } from 'src/bookable-activity/dto/create-bookable-activity.input'
import { CreateReportInput } from 'src/report/dto/create-report.input'
import { ReportService } from 'src/report/report.service'
import { ChatroomService } from 'src/chatroom/chatroom.service'
// import * as bookableActivities from './data/bookableSlotsActivities.json'

@Injectable()
export class SeedService {
  constructor(
    private tripsService: TripService,
    private reviewService: ReviewService,
    private dayService: DayService,
    private bookingService: BookingService,
    private usersService: UsersService,
    private locationService: LocationService,
    private bookableTripService: BookableTripService,
    private activitiesService: ActivitiesService,
    private bookableActivityService: BookableActivityService,
    private userService: UsersService,
    private reportService: ReportService,
    private chatroomService: ChatroomService,
  ) {}

  async addTripsFromJson(): Promise<string> {
    const theTrips: CreateTripInput[] = []
    let reviewCount = 0

    // dit is belangrijk omdat we infeite de seeding gaan richten voornamelijk op de root user alles kan zien en doen voor demo purposes
    // dit zal bv gebruikt worden voor createbookable waar we er van uit aan gaan dat deze user de bookable heeft gemaakt
    const rootUser = await this.userService.findOneByFirebaseUid(
      'SXPP3snyN2f3ZOaT4KkTrhiFkg03',
    )

    // const guide1 = await this.userService.findOneByFirebaseUid(
    //   '94rSRvh1tVMXewfVGLMeNx9rUzk2',
    // )

    // const guide2 = await this.userService.findOneByFirebaseUid(
    //   'qBwhiHLamwM8k80Rk1kAzH2qiSC3',
    // )

    for (const trip of trips) {
      const t = new CreateTripInput()
      t.name = trip.name
      t.headerImageUrl = trip.headerImageUrl
      t.bannerImageUrl = trip.bannerImageUrl
      t.ageGroup = trip.ageGroup
      t.description = trip.description
      t.bookingSettings = {
        max_participants: trip.bookingSettings.max_participants,
        min_participants: trip.bookingSettings.min_participants,
        auto_cancel: trip.bookingSettings.auto_cancel,
        auto_cancel_days_before: trip.bookingSettings.auto_cancel_days_before,
        price: trip.bookingSettings.price,
      }

      const savedTrip = await this.tripsService.create(t)

      let indexDay = 0

      if (trip.itinerary) {
        for (const day of trip.itinerary) {
          const d = new CreateDayInput()
          let location = await this.locationService.findByName(
            day.location.name,
          )
          if (!location) {
            location = await this.locationService.create({
              name: day.location.name,
              geolocation: {
                type: 'Point',
                coordinates: day.location.geopoint.coordinates,
              },
            })
          }
          // DEPRECATED MAAR NIET DELETEN
          // get activity based on name to fill in recommendedActivityId
          // if (day.recommendedActivity) {
          //   const activity = await this.activitiesService.findByName(
          //     day.recommendedActivity,
          //   )
          //   if (activity) {
          //     d.recommendedActivityId = activity.id
          //   }
          // }

          d.day_number = indexDay++
          d.location_id = location.id
          const savedDay = await this.dayService.create(savedTrip.id, d)
          savedDay.location = location
          savedTrip.itinerary.push(savedDay)
        }
      }

      if (trip.reviews) {
        for (const review of trip.reviews) {
          const r = new CreateReviewInput()
          r.rating = review.rating
          r.review = review.review
          r.userId = review.userId
          r.tripId = savedTrip.id
          const savedReview = await this.reviewService.create(r)
          savedTrip.reviewsIds.push(savedReview.raw)
          reviewCount++
        }
      }

      if (trip.slots) {
        for (const bookable of trip.slots) {
          const bookableCreate = new CreateBookableTripInput()
          //('tot hier ok')
          if (!trip) {
            return `Trip with date ${bookable.startDate} not found`
          }

          bookableCreate.createById = rootUser.id
          bookableCreate.tripId = savedTrip.id
          bookableCreate.startDate = new Date(bookable.startDate)

          // get guide based on firebaseuid
          const guide = await this.usersService.findOneByFirebaseUid(
            bookable.assignedGuideFireAuthID,
          )

          if (!guide) {
            return `Guide with firebaseuid ${bookable.assignedGuideFireAuthID} not found`
          }

          bookableCreate.assignedGuideId = guide.id
          // console.log('#133 seed.service.ts', guide.id)

          const createdBookable =
            await this.bookableTripService.create(bookableCreate)
          //('ook hier ok?')
          console.log(
            '#133 seed.service.ts successfully created a bookable',
            createdBookable,
          )

          // DEPRECATED zit nu in de createBookableTrip
          // voeg de bookable aan assignedd guide toe
          // if (!guide.assignedBookableTripIds) {
          //   guide.assignedBookableTripIds = []
          // }

          // guide.assignedBookableTripIds.push(createdBookable.id)
          // await this.userService.updateUser(guide)

          // console.log('#138 seed.service.ts', createdBookable)

          // now loop over each report
          if (bookable.reports) {
            for (const report of bookable.reports) {
              const reportCreateInput = new CreateReportInput()
              reportCreateInput.title = report.title
              reportCreateInput.date = new Date(report.date)
              reportCreateInput.description = report.description
              reportCreateInput.guideId = guide.id
              reportCreateInput.bookableTripId = createdBookable.id

              await this.reportService.create(reportCreateInput)
            }
          }

          for (const booking of bookable.bookings) {
            const b = new CreateBookingInput()

            let person = await this.usersService.findOneByFirebaseUid(
              booking.fireAuthId,
            )

            if (!person) {
              person = await this.usersService.createSeedingVariant({
                username: booking.username,
                uid: booking.fireAuthId,
                gender: 'apache helicopter',
                role: Role.USER,
                locale: 'nl',
                email: booking.email,
              })
            }

            b.fireAuthId = person.uid
            b.type = 'trip'
            b.bookable_trip_id = createdBookable.id
            b.extraPersons = []

            // add all the possible dates

            for (const extraPerson of booking.ExtraPersons) {
              const ep = new ExtraPersonInput()
              ep.name = extraPerson.name
              ep.email = extraPerson.email
              b.extraPersons.push(ep)
            }
            //('tot hier ook zeker ok???')
            //(b)

            const bookingTrip = (await this.bookingService.createBooking(
              b,
            )) as Booking

            console.log('bookingTrip', bookingTrip)

            // add booking to user
            const userWithtrip = await this.userService.addBookingToUser(
              person.uid,
              bookingTrip.id,
            )
            console.log(userWithtrip)

            if (!userWithtrip) {
              return `User with id ${person.uid} not found`
            }

            //(`bookingTrip: ${bookingTrip.trip.name}`)

            for (const bookActvitiy of booking.booked_activities) {
              // om een booking van een activity te maken heb je altijd twee dingen nodig, bookable activity id alsook de booking van de trip id
              // find the activity based on name

              const activity = await this.activitiesService.findByName(
                bookActvitiy.name,
              )

              console.log('activity found', activity)

              if (!activity) {
                return `Activity with name ${bookActvitiy.name} not found`
              }

              // now get al bookables of that activity
              const bookableActivity =
                await this.bookableActivityService.findManyBookableActivities(
                  activity.bookableActivitiesIds,
                )

              // now check if their is a bookable for that day if not create one
              // we can get the date from the booking of the trip and the day specified in my seeding json
              const dayNumber = parseInt(bookActvitiy.Day, 10)
              // hier issue?
              console.log('booking Trip Startdate ', bookingTrip.trip.startDate)
              const activityDate = new Date(bookingTrip.trip.startDate)
              activityDate.setDate(activityDate.getDate() + dayNumber)

              // now check if theirs a bookable for that day if not create one

              console.log('activityDate', activityDate)

              let bookableActivityForDay = bookableActivity.find(
                ba =>
                  activityDate >= ba.startDate && activityDate <= ba.endDate,
              )

              console.log('bookableActivityForDay', bookableActivityForDay)

              if (!bookableActivityForDay) {
                console.log('creating bookable activity')
                const createBookableActivity = new CreateBookableActivityInput()
                createBookableActivity.createdById = rootUser.id
                createBookableActivity.duration = activity.duration
                createBookableActivity.activityId = activity.id
                createBookableActivity.startDate = activityDate
                //('reccommended', activity.recommended)

                createBookableActivity.recommended = activity.recommended
                //('bookable', createBookableActivity.recommended)
                const createdBookableActivity =
                  await this.bookableActivityService.create(
                    createBookableActivity,
                  )
                bookableActivity.push(createdBookableActivity)
                bookableActivityForDay = createdBookableActivity
              }

              // now we can create the booking
              const b = new CreateBookingInput()
              b.fireAuthId = person.uid
              b.type = 'activity'
              b.bookable_activity_id = bookableActivityForDay.id
              b.booking_trip_id = bookingTrip.id
              b.extraPersons = []

              for (const extraPerson of booking.ExtraPersons) {
                const ep = new ExtraPersonInput()
                ep.name = extraPerson.name
                ep.email = extraPerson.email
                b.extraPersons.push(ep)
              }

              //(`activity booking ${JSON.stringify(b, null, 2)}`)

              await this.bookingService.createBooking(b)
            }
          }

          // lets seed for each day
        }
      }

      theTrips.push(t)
    }

    return `${theTrips.length} trips have been added with ${reviewCount} reviews, also each trip has been added with a bookable slot, in total ${theTrips.length} bookable slots have been added with bookings, in total ${theTrips.length} bookings have been added`
  }

  async addRootUser(): Promise<string> {
    const root = await this.userService.createAdmin({
      username: 'Stef & Mc',
      uid: 'SXPP3snyN2f3ZOaT4KkTrhiFkg03',
      gender: 'root',
      locale: 'nl',
      email: 'root@root.com',
      role: Role.ADMIN,
    })

    const docent = await this.userService.createAdmin({
      username: 'Docent',
      uid: 'mly9meCKxWf1CqeXfoiBo2KWrTV2',
      gender: 'docent',
      locale: 'nl',
      email: 'docent@howest.be',
      role: Role.ADMIN,
    })

    const Guide1 = await this.userService.createAdmin({
      username: 'Guide',
      uid: '94rSRvh1tVMXewfVGLMeNx9rUzk2',
      gender: 'guide',
      locale: 'nl',
      email: 'guide1@wanderix.be',
      role: Role.GUIDE,
    })

    const Guide2 = await this.userService.createAdmin({
      username: 'Guide',
      uid: 'qBwhiHLamwM8k80Rk1kAzH2qiSC3',
      gender: 'guide',
      locale: 'nl',
      email: 'guide2@wanderix.be',
      role: Role.GUIDE,
    })

    const Stef = await this.userService.createAdmin({
      username: 'Stef',
      uid: 'GWv2vrqZ3zfrXtbbGjsh9ovHWLl1',
      gender: 'woman',
      locale: 'nl',
      email: 'stef.pieters@student.howest.be',
      role: Role.ADMIN,
    })

    // delete all users in firebase that are not root, docent, guide1, guide2, stef

    // Fetch all users from Firebase
    const allUsersInFire = await this.userService.getAllFireBaseUsers()

    // List of UIDs to keep
    const keepUids = [
      'SXPP3snyN2f3ZOaT4KkTrhiFkg03',
      'mly9meCKxWf1CqeXfoiBo2KWrTV2',
      '94rSRvh1tVMXewfVGLMeNx9rUzk2',
      'qBwhiHLamwM8k80Rk1kAzH2qiSC3',
      'GWv2vrqZ3zfrXtbbGjsh9ovHWLl1',
    ]

    const usersToDelete = allUsersInFire.filter(
      user => !keepUids.includes(user.uid),
    )

    // Delete all users that are not in the keep list
    for (const user of usersToDelete) {
      await this.userService.deleteFireBaseUser(user.uid)
    }

    return `Root user have been added: ${root.username}, ${docent.username}, ${Guide1.username}, ${Guide2.username}, ${Stef.username}`
  }

  async triggerBgServices(): Promise<string> {
    await this.bookableActivityService.checkBookablesAndUpdateStatusIfNecessary()

    await this.bookableTripService.checkBookablesTripsAndUpdateStatusIfNecessary()

    await this.chatroomService.deleteInactiveChatrooms()

    return `Background services have been triggered`
  }

  // DEPRECATED
  // async addBookablesAndBookingsForTripsFromJson(): Promise<string> {
  //   let bookableCount = 0

  //   for (const bookable of bookablestrips) {
  //     const b = new CreateBookableTripInput()
  //     const trip = await this.tripsService.findOneByName(bookable.name)

  //     if (!trip) {
  //       return `Trip with name ${bookable.name} not found`
  //     }

  //     b.tripId = trip.id
  //     b.startDate = new Date(bookable.startDate)
  //     const createdBookable = await this.bookableTripService.create(b)

  //     for (const booking of bookable.bookings) {
  //       const b = new CreateBookingInput()
  //       let person = await this.usersService.findOneByFirebaseUid(
  //         booking.fireAuthId,
  //       )

  //       if (!person) {
  //         person = await this.usersService.create({
  //           uid: booking.fireAuthId,
  //           gender: 'apache helicopter',
  //           role: Role.USER,
  //         })
  //       }

  //       b.fireAuthId = person.id
  //       b.type = 'trip'
  //       b.bookable_trip_id = createdBookable.id
  //       b.extraPersons = []

  //       for (const extraPerson of booking.ExtraPersons) {
  //         const ep = new ExtraPersonInput()
  //         ep.name = extraPerson.name
  //         ep.email = extraPerson.email
  //         b.extraPersons.push(ep)
  //       }

  //       await this.bookingService.createBooking(b)
  //     }

  //     bookableCount++
  //   }

  //   return `${bookableCount} bookables have been added`
  // }

  // Activities

  async addActivitiesFromJson(): Promise<string> {
    const rootUser = await this.userService.findOneByFirebaseUid(
      'SXPP3snyN2f3ZOaT4KkTrhiFkg03',
    )
    console.log(
      '#447 Seed.service.ts root user found ',
      rootUser,
      ' with id ',
      rootUser.id,
    )

    const theActivities: CreateActivityInput[] = []

    for (const activity of activities) {
      const a = new CreateActivityInput()
      a.name = activity.name
      a.bannerImageUrl = activity.bannerImageUrl
      a.headerImageUrl = activity.headerImageUrl
      a.ageGroup = activity.ageGroup
      a.recommended = activity.recommended
      a.description = activity.description
      a.equipmentProvided = activity.equipmentProvided
      a.safetyMeasures = activity.safetyMeasures
      a.recommended = activity.recommended
      a.duration = activity.duration
      a.bookingSettings = {
        max_participants: activity.bookingSettings.max_participants,
        min_participants: activity.bookingSettings.min_participants,
        auto_cancel: activity.bookingSettings.auto_cancel,
        auto_cancel_days_before:
          activity.bookingSettings.auto_cancel_days_before,
        price: activity.bookingSettings.price,
      }
      // location
      let location = await this.locationService.findByName(
        activity.location.name,
      )
      if (!location) {
        location = await this.locationService.create({
          name: activity.location.name,
          geolocation: {
            type: 'Point',
            coordinates: activity.location.geopoint.coordinates,
          },
        })
      }
      a.locationId = location.id

      const savedActivity = await this.activitiesService.create(a)
      theActivities.push(savedActivity)

      // now create bookable for each slot
      for (const slot of activity.slots) {
        const bookable = new CreateBookableActivityInput()
        bookable.activityId = savedActivity.id
        bookable.startDate = new Date(slot.startDate)
        bookable.duration = savedActivity.duration
        bookable.createdById = rootUser.id
        bookable.recommended = slot.recommend
        const createdBookable =
          await this.bookableActivityService.create(bookable)
        savedActivity.bookableActivitiesIds.push(createdBookable.id)
      }
    }

    return `${theActivities.length} activities have been added.`
  }

  // DEPRECATED
  // async addBookablesAndBookingsForActivitiesFromJson(): Promise<string> {
  //   let bookableCount = 0

  //   //(bookableActivities)

  //   for (const bookable of bookableActivities) {
  //     const b = new CreateBookableActivityInput()
  //     const activity = await this.activitiesService.findByName(bookable.name)

  //     //(activity)

  //     if (!activity) {
  //       return `Activity with name ${bookable.name} not found`
  //     }

  //     b.activityId = activity.id
  //     b.startDate = new Date(bookable.startDate)

  //     const createdBookable = await this.bookableActivityService.create(b)
  //     //(createdBookable)

  //     for (const booking of bookable.bookings) {
  //       const b = new CreateBookingInput()
  //       let person = await this.usersService.findOneByFirebaseUid(
  //         booking.fireAuthId,
  //       )

  //       if (!person) {
  //         person = await this.usersService.create({
  //           uid: booking.fireAuthId,
  //           gender: 'apache helicopter',
  //           role: Role.USER,
  //         })
  //       }

  //       b.fireAuthId = person.id
  //       b.type = 'activity'
  //       b.bookable_activity_id = createdBookable.id
  //       b.extraPersons = []

  //       for (const extraPerson of booking.ExtraPersons) {
  //         const ep = new ExtraPersonInput()
  //         ep.name = extraPerson.name
  //         ep.email = extraPerson.email
  //         b.extraPersons.push(ep)
  //       }

  //       await this.bookingService.createBooking(b)
  //     }

  //     bookableCount++
  //   }
  //   return `${bookableCount} bookables have been added`
  // }

  async deleteAllBookablesTrips(): Promise<void> {
    await this.bookableTripService.truncate()
  }

  async deleteAllTripsAndReviews(): Promise<void> {
    await this.tripsService.truncate()
    await this.reviewService.truncate()
  }

  async deleteAllActivities(): Promise<void> {
    await this.activitiesService.truncate()
  }

  async deleteAllBookableActivities(): Promise<void> {
    await this.bookableActivityService.truncate()
  }
}
