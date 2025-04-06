import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateBookableTripInput } from './dto/create-bookable-trip.input'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { BookableTrip } from './entities/bookable-trip.entity'
import { TripService } from '../trip/trip.service'
import { BookableSettings } from '../entities/bookable-settings.entity'
import { UpdateBookableTripInput } from './dto/update-bookable-trip.input'
import { ChatroomService } from '../chatroom/chatroom.service'
import { UsersService } from '../users/users.service'
import { CreateChatroomInput } from '../chatroom/dto/create-chatroom.input'
import { StatusBookables } from '../entities/statusBookables'
import { BookingService } from '../booking/booking.service'
import { MailerService } from '@nestjs-modules/mailer'
import { sendMailDto } from '../mailer/mail.interface'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class BookableTripService {
  // first create a bookable trip based on a trip id
  @InjectRepository(BookableTrip)
  private readonly bookableTripRepository: MongoRepository<BookableTrip>

  @Inject(forwardRef(() => TripService))
  private readonly tripService: TripService

  @Inject(forwardRef(() => UsersService))
  private readonly userService: UsersService

  @Inject(forwardRef(() => ChatroomService))
  private readonly chatroomService: ChatroomService

  @Inject(forwardRef(() => BookingService))
  private readonly bookingService: BookingService

  @Inject(forwardRef(() => MailerService))
  private readonly mailerService: MailerService

  async create(createBookableTripInput: CreateBookableTripInput) {
    if (
      !createBookableTripInput.createById &&
      !createBookableTripInput.assignedGuideId
    ) {
      throw new Error(
        'User ID that creates this is required and assigned guide ID is required',
      )
    }

    // first check if the trip exists
    // //('gaat in create <=')
    // //(createBookableTripInput.tripId)
    let trip = null
    // //()
    try {
      trip = await this.tripService.findOne(
        createBookableTripInput.tripId.toString(),
      )
    } catch (error) {
      console.error(
        `Failed to find trip with id ${createBookableTripInput.tripId}:`,
        error,
      )
    }

    if (!trip) {
      throw new Error(`Trip not found`)
    }

    const bookableTrip = new BookableTrip()

    // we gebruiken de startdatum van de bookable trip
    bookableTrip.startDate = createBookableTripInput.startDate

    // je kopieert de settings van de trip
    // bookableTrip.bookingsSettings = trip.bookingSettings

    // a.h.v. de trip.ittenary en hoeveel dagen de trip duurt bereken je de einddatum
    const endDate = new Date(bookableTrip.startDate)
    endDate.setDate(bookableTrip.startDate.getDate() + trip.itinerary.length)

    // console.log(
    //   '#52 bookabel-trip-service guide: ',
    //   createBookableTripInput.assignedGuideId,
    // )

    bookableTrip.createById = createBookableTripInput.createById
    bookableTrip.endDate = endDate
    bookableTrip.bookingIds = []
    bookableTrip.tripId = trip.id
    bookableTrip.status = StatusBookables.OPEN
    bookableTrip.assignedGuideId = createBookableTripInput.assignedGuideId
    // nu vullen we de bookable settings aan a.h.v. de bookingsettings van de trip

    const bookableSettings = new BookableSettings()
    bookableSettings.max_persons = trip.bookingSettings.max_participants

    // we vullen de prijs in
    bookableSettings.price = trip.bookingSettings.price

    // we vullen de places a.h.v. max_participants
    bookableSettings.places = trip.bookingSettings.max_participants

    // we vullen de min participants in
    bookableSettings.min_persons_required =
      trip.bookingSettings.min_participants

    // we vullen de auto cancel in
    bookableSettings.autocancel = trip.bookingSettings.auto_cancel

    if (bookableSettings.autocancel) {
      // we vullen de auto cancel datum in (autocancel_on)
      const autoCancelDate = new Date(endDate)

      autoCancelDate.setDate(
        endDate.getDate() - trip.bookingSettings.auto_cancel_days_before,
      )

      bookableSettings.autocancel_on = autoCancelDate
    }

    bookableTrip.bookableSettings = bookableSettings

    // save de bookable trip, je hebt nu een bookable trip
    const bookable = await this.bookableTripRepository.save(bookableTrip)

    // add bookable trip to trip.id
    await this.tripService.addBookableTripToTrip(trip.id, bookable.id)

    // make a new chatroom for the bookable trip
    // make a new chatroom for the bookable trip
    // console.log(
    //   '#108 bookable-trip.service.ts create chatroom with Guide:' +
    //     createBookableTripInput.assignedGuideId +
    //     ' and root: ' +
    //     createBookableTripInput.createById,
    // )

    // console.log(
    //   'Creating a chatroom where following users will be added Guide and User with id:',
    //   createBookableTripInput.assignedGuideId,
    //   createBookableTripInput.createById,
    // )

    // convert date to string dd/mm/yyyy
    const startDate = new Date(bookableTrip.startDate)

    const createChatroomInput = new CreateChatroomInput()
    // format startdate to dd/mm/yyyy

    const formatDate = (date: Date) => {
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      return `${day}/${month}/${year}`
    }

    const stringForChatroom = formatDate(startDate)

    createChatroomInput.name = `${stringForChatroom} - ${trip.name}`
    createChatroomInput.bookableId = bookable.id
    createChatroomInput.usersIds = [
      createBookableTripInput.assignedGuideId,
      createBookableTripInput.createById,
    ]

    await this.chatroomService.createChatroom(createChatroomInput)

    // get the guide user
    const guide = await this.userService.findById(
      createBookableTripInput.assignedGuideId,
    )

    if (
      !guide.assignedBookableTripIds ||
      guide.assignedBookableTripIds.length === 0
    ) {
      guide.assignedBookableTripIds = []
    }

    guide.assignedBookableTripIds.push(bookable.id)
    await this.userService.updateUser(guide)

    return bookable
  }

  findAll() {
    return this.bookableTripRepository.find()
  }

  async update(id: string, updateBookableTripInput: UpdateBookableTripInput) {
    // //('trying to update')
    // //(updateBookableTripInput.bookableSettings)
    const objId = new ObjectId(id)

    const refBookableTrip = await this.findOne(id)

    if (!refBookableTrip) {
      throw new Error('Bookable trip not found')
    }

    console.log(
      'Current bookings: ',
      refBookableTrip.bookingIds.length,
      'Max persons: ',
      updateBookableTripInput.bookableSettings.max_persons,
    )

    if (updateBookableTripInput.bookableSettings) {
      if (
        refBookableTrip.bookingIds.length >
        updateBookableTripInput.bookableSettings.max_persons
      ) {
        throw new Error(
          'You cannot reduce the number of places below the current number of bookings',
        )
      }
    }

    // check if we updating the max persons
    if (
      updateBookableTripInput.bookableSettings.max_persons !==
      refBookableTrip.bookableSettings.max_persons
    ) {
      // all bookings should be deducted from the max persons but a booking has a .howmany for that

      updateBookableTripInput.bookableSettings.places =
        updateBookableTripInput.bookableSettings.max_persons

      for (const bookingId of refBookableTrip.bookingIds) {
        const booking = await this.bookingService.findById(bookingId)

        if (!booking) {
          continue
        }

        if (
          booking.how_many >
          updateBookableTripInput.bookableSettings.max_persons
        ) {
          throw new Error(
            `You cannot reduce the number of places below the current number of bookings`,
          )
        }

        updateBookableTripInput.bookableSettings.places -= booking.how_many
      }
    }

    console.log('refBookableTrip:', refBookableTrip)
    console.log('updateBookableTripInput:', updateBookableTripInput)

    if (updateBookableTripInput.status === StatusBookables.CANCELLED) {
      const allAffectedBookings = await this.bookingService.findByManyIds(
        refBookableTrip.bookingIds,
      )

      console.log('All affected bookings:', allAffectedBookings)

      // cancel all bookings

      updateBookableTripInput.bookingIds = []
      updateBookableTripInput.bookableSettings.places =
        refBookableTrip.bookableSettings.max_persons

      updateBookableTripInput.status = StatusBookables.CANCELLED

      for (const booking of allAffectedBookings) {
        const userAffected = await this.userService.findById(booking.personId)

        console.log('User affected:', userAffected)

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
          subject: 'Booking TRIP has been cancelled',
          placeholderReplacements: {
            bookingId: booking.id,
            startDate: refBookableTrip.startDate.toDateString(),
            endDate: refBookableTrip.endDate.toDateString(),
          },
          html: 'booking-cancelled',
        }

        // console.log('sendMailDtoBefore:', sendMailDto)

        try {
          await this.mailerService.sendMail(sendMailDto)
        } catch (error) {
          console.error(
            'Failed to send email, the mail recipient doesnt exist this can happen because we use fictive data:',
            error,
          )
        }

        console.log('Mail sent:', sendMailDto)
      }
    }

    await this.bookableTripRepository.update(objId, updateBookableTripInput)

    return this.findOne(id)
  }

  findOne(id: string) {
    const objId = new ObjectId(id)
    return this.bookableTripRepository.findOneBy({ _id: objId })
  }

  async findManyBookableTrips(ids: string[]) {
    const objectIds = ids.map(id => new ObjectId(id))
    return this.bookableTripRepository.find({
      where: { _id: { $in: objectIds } },
    })
  }

  // geen update nodig een booking kunje of openzetten of verwijderen VOOR NU LIGT DAAR NIET DE FOCUS

  async remove(id: string): Promise<boolean> {
    try {
      // verwijder bookable-trip by id

      if (!id) {
        throw new Error(`Bookable trip ID is required`)
      }

      await this.bookableTripRepository.delete(id)

      return true
    } catch (error) {
      console.error(`Failed to remove bookable trip with id ${id}:`, error)
      return false
    }
  }

  // seeding
  async truncate() {
    return this.bookableTripRepository.clear()
  }

  async saveAll(bookableTrips: BookableTrip[]) {
    return this.bookableTripRepository.save(bookableTrips)
  }

  // @Cron('0 0 * * * *')
  // for demo purpose evry 5 minutes
  @Cron('*/5 * * * *')
  async checkBookablesTripsAndUpdateStatusIfNecessary() {
    const bookableTrips = await this.bookableTripRepository.find()

    for (const bookableTrip of bookableTrips) {
      if (bookableTrip.status === StatusBookables.CANCELLED) {
        continue
      }

      if (bookableTrip.status === StatusBookables.FINISHED) {
        continue
      }

      const now = new Date()

      const diffTime = bookableTrip.startDate.getTime() - now.getTime()

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (bookableTrip.bookableSettings.autocancel) {
        if (now > bookableTrip.bookableSettings.autocancel_on) {
          if (bookableTrip.bookingIds.length > 0) {
            bookableTrip.status = StatusBookables.CANCELLED
            await this.update(bookableTrip.id, bookableTrip)
            continue
          }
        }
      }

      if (diffDays < 0) {
        bookableTrip.status = StatusBookables.FINISHED
        await this.update(bookableTrip.id, bookableTrip)
        continue
      }

      if (diffDays < 10) {
        if (bookableTrip.status !== StatusBookables.CLOSED) {
          bookableTrip.status = StatusBookables.CLOSED
          await this.update(bookableTrip.id, bookableTrip)
        }
      }
    }
  }
}
