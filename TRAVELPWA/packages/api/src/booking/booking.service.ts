import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateBookingInput } from './dto/create-booking.input'
import { InjectRepository } from '@nestjs/typeorm'
import { Booking } from './entities/booking.entity'
import { TripService } from '../trip/trip.service'
import { BookableTripService } from '../bookable-trip/bookable-trip.service'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { UsersService } from '../users/users.service'
// import { CreateBookableTripInput } from 'src/bookable-trip/dto/create-bookable-trip.input'
import { ActivitiesService } from '../activities/activities.service'
import { BookableActivityService } from '../bookable-activity/bookable-activity.service'
// import { CreateBookableActivityInput } from 'src/bookable-activity/dto/create-bookable-activity.input'
import { UpdateBookableTripInput } from '../bookable-trip/dto/update-bookable-trip.input'
import { UpdateBookableActivityInput } from '../bookable-activity/dto/update-bookable-activity.input'
import { ChatroomService } from '../chatroom/chatroom.service'
import { StatusBookables } from '../entities/statusBookables'

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: MongoRepository<Booking>,

    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,

    @Inject(forwardRef(() => ActivitiesService))
    private readonly ActivitiesService: ActivitiesService,

    @Inject(forwardRef(() => BookableTripService))
    private readonly bookableTripService: BookableTripService,

    @Inject(forwardRef(() => BookableActivityService))
    private readonly bookableActivitiesService: BookableActivityService,

    @Inject(forwardRef(() => ChatroomService))
    private readonly chatroomService: ChatroomService,

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async createBooking(createBookingInput: CreateBookingInput) {
    // check if user exist if not throw error
    let result

    console.log('CreateBookingInput', createBookingInput)

    if (createBookingInput.type === 'trip') {
      // get the bookable trip

      const bookableTrip = await this.bookableTripService.findOne(
        createBookingInput.bookable_trip_id,
      )

      if (!bookableTrip) {
        throw new Error('Bookable trip not found')
      }

      if (bookableTrip.status === StatusBookables.CANCELLED) {
        throw new Error('Bookable trip is cancelled')
      }

      if (bookableTrip.status === StatusBookables.FULL) {
        throw new Error('Bookable trip is full')
      }

      if (bookableTrip.status === StatusBookables.FINISHED) {
        throw new Error('Bookable trip is finished')
      }

      // now get the trip based on the bookabltripId
      const trip = await this.tripService.findOne(bookableTrip.tripId)

      if (!trip) {
        throw new Error('Trip not found')
      }

      // console.log('tot hier ookkkeee')
      // set following to null because we dont need to save this
      trip.bookingSettings = null
      trip.bookableTripsIds = null

      trip.startDate = bookableTrip.startDate
      trip.endDate = bookableTrip.endDate

      trip.itinerary.forEach((day, index) => {
        const date = new Date(bookableTrip.startDate)
        date.setDate(date.getDate() + index)
        day.date = date
      })

      // create a booking
      const booking = new Booking()
      booking.bookableTripId = bookableTrip.id
      booking.trip = trip
      booking.extra_persons = []
      // loop trough each extra person
      // and add them to the booking

      for (const person of createBookingInput.extraPersons) {
        // add person to booking
        booking.extra_persons.push(person)
      }

      // add the main person to the booking
      const person = await this.userService.findOneByFirebaseUid(
        createBookingInput.fireAuthId,
      )

      if (!person) {
        throw new Error('Person not found')
      }

      console.log('person', person)

      booking.personId = person.id

      booking.how_many = createBookingInput.extraPersons.length + 1

      booking.totalPrice =
        bookableTrip.bookableSettings.price * booking.how_many

      booking.type = createBookingInput.type

      booking.startDate = bookableTrip.startDate
      booking.endDate = bookableTrip.endDate

      // check if there are enough places left
      bookableTrip.bookableSettings.places -= booking.how_many
      if (bookableTrip.bookableSettings.places < 0) {
        throw new Error('Not enough places left')
      }

      // save the booking
      result = await this.bookingRepository.save(booking)

      if (!bookableTrip.bookingIds) {
        bookableTrip.bookingIds = []
      }
      bookableTrip.bookingIds.push(result.id)

      // add booking to the user
      await this.userService.addBookingToUser(person.uid, result.id)

      // dit is nasty, maar het is nu tijdelijk zo opgelost
      const updateBookableTripInput: UpdateBookableTripInput = {
        // fix dit <== MC
        // tripName: trip.name,
        id: bookableTrip.id,
        startDate: bookableTrip.startDate,
        tripId: trip.id,
        bookableSettings: bookableTrip.bookableSettings,
        bookingIds: bookableTrip.bookingIds,
        status: bookableTrip.status,
        createById: bookableTrip.createById,
        roomId: bookableTrip.roomId,
      }

      // save the bookable trip
      await this.bookableTripService.update(
        createBookingInput.bookable_trip_id,
        updateBookableTripInput,
      )

      // voeg user toe aan chat van die trip
      console.log(
        '#149 booking.service.ts bookableTrip.roomId',
        bookableTrip.roomId,
      )
      console.log('#149 booking.service.ts person.id', person.id)

      await this.chatroomService.addUserToChatroom(
        bookableTrip.roomId,
        person.id,
      )
    } else if (createBookingInput.type === 'activity') {
      const person = await this.userService.findOneByFirebaseUid(
        createBookingInput.fireAuthId,
      )

      if (!person) {
        throw new Error('Person not found')
      }

      if (!createBookingInput.bookable_activity_id) {
        throw new Error('No bookable_activity_id provided')
      }
      if (!createBookingInput.booking_trip_id) {
        throw new Error('No booking_trip_id provided')
      }

      const bookableActivity = await this.bookableActivitiesService.findOne(
        createBookingInput.bookable_activity_id,
      )

      console.log('bookableActivity', bookableActivity)

      if (!bookableActivity) {
        throw new Error('Bookable activity not found')
      }

      if (bookableActivity.status === StatusBookables.CANCELLED) {
        throw new Error('Bookable activity is cancelled')
      }

      if (bookableActivity.status === StatusBookables.FULL) {
        throw new Error('Bookable activity is full')
      }

      if (bookableActivity.status === StatusBookables.FINISHED) {
        throw new Error('Bookable activity is finished')
      }

      // we checken expliciet niet of het closed is omdat de admin dit kan forceren om te booken

      // get user

      // OPTIE: Chat per acitiveit
      // add user to the chatroom
      // await this.chatroomService.addUserToChatroom(
      //   bookableActivity.roomId,
      //   person.id,
      // )

      // console.log('Searching for:', createBookingInput.bookable_activity_id)
      // altijd jouw id van je trip booking meegeven
      const tripBooking = await this.bookingRepository.findOne({
        where: { _id: new ObjectId(createBookingInput.booking_trip_id) },
      })

      if (!tripBooking) {
        throw new Error(
          `No tripBooking found with id: ${createBookingInput.booking_trip_id}`,
        )
      }

      if (!tripBooking.trip) {
        throw new Error('tripBooking.trip is null or undefined')
      }

      if (!tripBooking.trip.itinerary) {
        throw new Error('tripBooking.trip.itinerary is null or undefined')
      }

      if (!bookableActivity) {
        throw new Error('Bookable activity not found')
      }

      const activity = await this.ActivitiesService.findOne(
        bookableActivity.activityId,
      )

      if (!activity) {
        throw new Error('Activity not found')
      }

      activity.bookingSettings = null
      activity.bookableActivitiesIds = null

      const booking = new Booking()
      booking.bookableActivityId = bookableActivity.id
      booking.activity = activity
      booking.extra_persons = []

      // zal automatisch ook booken voor die activiteit
      for (const personExtra of tripBooking.extra_persons) {
        booking.extra_persons.push(personExtra)
      }

      booking.personId = person.id

      if (createBookingInput.extraPersons) {
        booking.how_many = createBookingInput.extraPersons.length + 1
      } else {
        booking.how_many = 1
      }

      booking.totalPrice =
        bookableActivity.bookableSettings.price * booking.how_many

      booking.type = createBookingInput.type

      // small fix price didnt adjust to the total price
      tripBooking.totalPrice += booking.totalPrice

      booking.startDate = bookableActivity.startDate
      booking.endDate = bookableActivity.endDate

      // deze check moet vooraf gebeuren vooor dat er iets ogpeslagen wordt
      bookableActivity.bookableSettings.places -= booking.how_many

      if (bookableActivity.bookableSettings.places < 0) {
        throw new Error('Not enough places left')
      }

      // here we first gone check if their are no overlapping otherwise dont save!

      tripBooking.trip.itinerary = await Promise.all(
        tripBooking.trip.itinerary.map(async day => {
          if (!day.bookidActivitys) {
            // // console.log(
            //   'day.activities is undefined, initializing to an empty array',
            // )
            day.activities = []
          }
          day.activities = await Promise.all(
            day.activities.map(async activity => {
              return await this.bookingRepository.findOne({
                where: { id: activity.id },
              })
            }),
          )
          return day
        }),
      )

      // console.log('tripBooking.trip.itinerary', tripBooking.trip.itinerary)

      // get the day it should be planned in based on the actvitity startdate/endDate
      // console.log('tripBooking.trip.itinerary', tripBooking.trip.itinerary)

      // console.log(bookableActivity.startDate, ' - ', bookableActivity.endDate)

      const getDateOnly = date => new Date(date).toISOString().split('T')[0]

      console.log('tripBooking.trip.itinerary', tripBooking.trip.itinerary)

      const day = tripBooking.trip.itinerary.find(day => {
        const dayDate = getDateOnly(day.date)
        const startDate = getDateOnly(bookableActivity.startDate)
        const endDate = getDateOnly(bookableActivity.endDate)

        return dayDate >= startDate && dayDate <= endDate
      })

      console.log('day', day)

      if (!day) {
        throw new Error(
          'Activity date not found in trip, you sure the activity can be booked in the trip?',
        )
      }

      for (const bookedActivity of day.activities) {
        if (
          bookedActivity.startDate >= bookableActivity.startDate &&
          bookedActivity.startDate <= bookableActivity.endDate
        ) {
          throw new Error('Activity is overlapping')
        }
      }

      // dus hier sla je de booking op (aangemaakt)
      result = await this.bookingRepository.save(booking)

      // hier koppelen we de opgeslagen booking aan de bookable activity zo kunnen we opvolgen welke bookings er zijn voor die specifieke dag/activiteit
      if (!bookableActivity.bookingIds) {
        bookableActivity.bookingIds = []
      }

      bookableActivity.bookingIds.push(result.id)

      // dit in de gaten houden is recent geupdate kan zorgen voor bugs? Of niet?
      const updateBookableActivityInput: UpdateBookableActivityInput = {
        id: bookableActivity.id,
        startDate: bookableActivity.startDate,
        activityId: activity.id,
        recommended: bookableActivity.recommended,
        bookableSettings: bookableActivity.bookableSettings,
        bookingIds: bookableActivity.bookingIds,
        duration: activity.duration,
        status: bookableActivity.status,
        endDate: bookableActivity.endDate,
      }

      await this.bookableActivitiesService.update(
        createBookingInput.bookable_activity_id,
        updateBookableActivityInput,
      )

      if (!day.bookidActivitys) {
        day.bookidActivitys = []
      }

      // add the bookingid
      day.bookidActivitys.push(result.id)

      // add the day to the trip
      // niet vereist MC 03/12
      // tripBooking.trip.itinerary = tripBooking.trip.itinerary.map(tripDay => {
      //   if (
      //     tripDay.id === day.id
      //     // && tripDay.date === day.date
      //   ) {
      //     return day
      //   }
      //   return tripDay
      // })

      // update the trip

      console.log('tripBooking', tripBooking)
      for (const day of tripBooking.trip.itinerary) {
        console.log('day', day)
      }

      // update the booking
      await this.bookingRepository.update(tripBooking.id, tripBooking)

      // now fetch it for the user
      result = await this.bookingRepository.findOne({
        where: { _id: tripBooking.id },
      })
      // console.log('result', result)
    } else {
      throw new Error('Type not found')
    }

    return result
  }

  async findManyByIds(ids: string[]) {
    const objectIds = ids.map(id => new ObjectId(id))

    const result = await this.bookingRepository.find({
      where: { _id: { $in: objectIds } },
    })

    return result
  }

  async getBookingWhereBookableActivityIdIsInItinerary(
    bookableActivityId: string,
  ) {
    const bookings = await this.bookingRepository.find({
      where: { type: 'trip' },
    })

    for (const booking of bookings) {
      if (booking.trip && booking.trip.itinerary) {
        for (const day of booking.trip.itinerary) {
          if (
            day.bookidActivitys &&
            day.bookidActivitys.includes(bookableActivityId)
          ) {
            return booking
          }
        }
      }
    }

    throw new Error('Booking not found')
  }

  async getBookingTripBasedOnBookingActivity(
    childBooking: Booking,
  ): Promise<Booking> {
    const bookings = await this.bookingRepository
      .find({
        where: { personId: childBooking.personId },
      })
      .then(bookings => bookings.filter(booking => booking.type === 'trip'))

    for (const booking of bookings) {
      console.log('booking', booking.personId)
      if (booking.trip && booking.trip.itinerary) {
        for (const day of booking.trip.itinerary) {
          console.log('day', day.bookidActivitys)
          if (Array.isArray(day.bookidActivitys)) {
            for (const activityId of day.bookidActivitys) {
              if (activityId.toString() === childBooking.id.toString()) {
                console.log('found')
                return booking
              }
            }
          }
        }
      }
    }

    return null
  }

  async findById(id: string) {
    return this.bookingRepository.findOne({
      where: { _id: new ObjectId(id) },
    })
  }

  async findManyBookingsByBookableActivityId(bookableActivityId: string) {
    return this.bookingRepository.find({
      where: { bookableActivityId: bookableActivityId },
    })
  }

  async updateStartHourAndEndHourActivityFromBookings(
    id: string,
    {
      startDate,
      endDate,
    }: {
      startDate: Date
      endDate: Date
    },
  ) {
    const booking = await this.findById(id)

    if (!booking) {
      throw new Error('Booking not found')
    }

    booking.startDate = startDate
    booking.endDate = endDate

    // update the booking
    await this.bookingRepository.update(booking.id, booking)
  }

  async findAll() {
    return this.bookingRepository.find()
  }

  async deleteBooking(id: string) {
    // if actvity delete the booking from the bookable activity also update the total trip of the trip
    // if trip delete the booking from the bookable trip
    const objectId = new ObjectId(id)

    const booking = await this.bookingRepository.findOne({
      where: { _id: objectId },
    })

    // console.log('booking', booking)

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.type === 'trip') {
      const bookableTrip = await this.bookableTripService.findOne(
        booking.bookableTripId,
      )
      // console.log('bookableTrip', bookableTrip)

      // update the bookable trip places
      bookableTrip.bookableSettings.places += booking.how_many
      // console.log('tjiens')

      const bookingObjectId = new ObjectId(booking.id)
      // remove the booking from the bookable trip

      bookableTrip.bookingIds = bookableTrip.bookingIds.filter(bookingId => {
        // console.log(`trying to remove booking with ${booking.id}`)
        return !bookingObjectId.equals(bookingId)
      })

      // console.log('bookableTrip', bookableTrip)

      const updateBookableTripInput: UpdateBookableTripInput = {
        ...bookableTrip,
      }

      // update the bookable trip

      // console.log('simple')

      // also get all the booked activities
      // for that we need booking.trip.itinerary and loop overall days and collect the bookedids
      // store these in a seperate array
      const bookedActivitiesIds = []

      booking.trip.itinerary.forEach(day => {
        if (day.bookidActivitys) {
          bookedActivitiesIds.push(...day.bookidActivitys)
        }
      })

      // now we have all the booked activities
      // get for each one the bookable activity
      // and update the places
      for (const bookedActivityId of bookedActivitiesIds) {
        // console.log('bookedActivityId', bookedActivityId)
        const booking = await this.bookingRepository.findOne({
          where: { _id: bookedActivityId },
        })

        // get the bookable
        const bookableActivity = await this.bookableActivitiesService.findOne(
          booking.bookableActivityId,
        )

        // console.log('bookableActivity', bookableActivity)
        bookableActivity.bookableSettings.places += booking.how_many

        const bookingObjectId = new ObjectId(booking.id)
        bookableActivity.bookingIds = bookableActivity.bookingIds.filter(
          bookingId => {
            return !bookingObjectId.equals(bookingId)
          },
        )

        // console.log('bookableActivity', bookableActivity)

        // update de bookable van een trip
        await this.bookableTripService.update(
          bookableTrip.id,
          updateBookableTripInput,
        )
        // update alle activites bookables
        await this.bookableActivitiesService.update(
          bookableActivity.id,
          bookableActivity,
        )

        // delete the bookings from the booking repository

        await this.bookingRepository.delete(booking.id)
      }

      await this.bookingRepository.delete(booking.id)
    } else if (booking.type === 'activity') {
      // get the bookable activity
      const bookableActivity = await this.bookableActivitiesService.findOne(
        booking.bookableActivityId,
      )

      bookableActivity.bookableSettings.places += booking.how_many

      await this.bookableActivitiesService.update(
        bookableActivity.id,
        bookableActivity,
      )

      // but we also need to delete the activity from the trip

      await this.bookingRepository.delete(booking.id)

      const trip = await this.getTripBookingByBookedActivityId(booking.id)

      if (!trip) {
        throw new Error('Actiity not bound to a trip?')
      }

      // now update the totalprice
      trip.totalPrice -= booking.totalPrice

      // find the day where the activity is in and remove it from the day

      console.log('booking.id' + booking.id)
      trip.trip.itinerary = trip.trip.itinerary.map(day => {
        if (day.bookidActivitys) {
          day.bookidActivitys = day.bookidActivitys.filter(activityId => {
            console.log('activityId', activityId)
            const activityObjectId = new ObjectId(activityId)
            const bookingObjectId = new ObjectId(booking.id)
            return !activityObjectId.equals(bookingObjectId)
          })
        }
        return day
      })

      await this.bookingRepository.update(trip.id, trip)
    }
    //send mail to user that booking is cancelled/deleted
    return booking
  }

  async findByManyIds(ids: string[]) {
    const objectIds = ids.map(id => new ObjectId(id))
    return this.bookingRepository.find({
      where: { _id: { $in: objectIds } },
    })
  }

  async getTripBookingByBookedActivityId(bookedActivityId: string) {
    const bookings = await this.bookingRepository.find({
      where: { type: 'trip' },
    })
    console.log('refBookingId', bookedActivityId)

    const objectId = new ObjectId(bookedActivityId)

    for (const booking of bookings) {
      if (booking.trip && booking.trip.itinerary) {
        for (const day of booking.trip.itinerary) {
          console.log('day', day.bookidActivitys)
          if (
            day.bookidActivitys &&
            day.bookidActivitys.some((id: any) =>
              new ObjectId(id).equals(objectId),
            )
          ) {
            return booking
          }
        }
      }
    }

    return null
  }

  async findBookingsByUserId(userId: string) {
    const bookings = await this.bookingRepository.find({
      where: { personId: userId },
      select: ['id'], // Select only the 'id' field
    })
    return bookings.map(booking => booking.id) // Return an array of booking IDs
  }
}
