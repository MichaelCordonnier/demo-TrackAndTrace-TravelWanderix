import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { FirebaseService } from 'src/authentication/services/firebase.service'
import { BookableTripService } from 'src/bookable-trip/bookable-trip.service'
import { BookableActivityService } from 'src/bookable-activity/bookable-activity.service'
import { UsersService } from 'src/users/users.service'
import { Role } from 'src/users/entities/user.entity'

@Injectable()
export class FirebaseBookingGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly bookableTripService: BookableTripService,

    private readonly bookableActivityService: BookableActivityService,

    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context)
    const token = request.headers.authorization?.split(' ')[1]
    const body = request.body

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    console.log('Token:', token)

    const firebaseUser = await this.firebaseService
      .getAuth()
      .verifyIdToken(token)

    if (!firebaseUser) {
      throw new UnauthorizedException('Firebase user not found')
    }

    const customUser = await this.userService.findOneByFirebaseUid(
      firebaseUser.uid,
    )

    if (!customUser) {
      throw new UnauthorizedException('Custom user not found')
    }

    // now get the bookable trip or activity we working with graphql and its CreateBookingInput.type based on that its a bookable activity or trip
    console.log('Body:', body)

    // get the type out of the booking
    if (!body) {
      throw new UnauthorizedException('No body provided')
    }

    if (!body.variables) {
      throw new UnauthorizedException('No variables provided')
    }

    if (!body.variables.createBookingInput) {
      throw new UnauthorizedException('No createBookingInput provided')
    }

    const type = body.variables.createBookingInput.type

    if (!type) {
      throw new UnauthorizedException('No type provided')
    }

    if (type === 'trip') {
      console.log('Protecting booking a trip')
      if (!body.variables.createBookingInput.bookable_trip_id) {
        throw new UnauthorizedException('No bookable_trip_id provided')
      }

      const bookableTrip = await this.bookableTripService.findOne(
        body.variables.createBookingInput.bookable_trip_id,
      )

      if (!bookableTrip) {
        throw new UnauthorizedException('Bookable trip not found')
      }

      //   compare the date from now to the date of the bookable
      //   if the date is in the past we should not allow booking
      //   if the date is in the future 10 days before we should allow booking if less then 10 days the user should be admin
      const dateBookable = new Date(bookableTrip.startDate)

      const dateNow = new Date()

      const diffTime = dateBookable.getTime() - dateNow.getTime()

      const diffDays = diffTime / (1000 * 3600 * 24)

      console.log('Difference in days:', diffDays)

      if (diffDays < 0) {
        throw new UnauthorizedException('Bookable trip is in the past')
      }

      if (diffDays < 10) {
        if (customUser.role !== Role.ADMIN) {
          throw new UnauthorizedException(
            'Bookable trip is less then 10 days away and user is not admin',
          )
        }
      }

      return true
    } else if (type === 'activity') {
      console.log('Protecting booking a activity')

      if (!body.variables.createBookingInput.bookable_activity_id) {
        throw new UnauthorizedException('No bookable_activity_id provided')
      }

      const bookableActivity = await this.bookableActivityService.findOne(
        body.variables.createBookingInput.bookable_activity_id,
      )

      if (!bookableActivity) {
        throw new UnauthorizedException('Bookable activity not found')
      }

      //   compare the date from now to the date of the bookable
      //   if the date is in the past we should not allow booking

      const dateBookable = new Date(bookableActivity.startDate)

      const dateNow = new Date()

      const diffTime = dateBookable.getTime() - dateNow.getTime()

      const diffDays = diffTime / (1000 * 3600 * 24)

      console.log('Difference in days:', diffDays)

      if (diffDays < 0) {
        throw new UnauthorizedException('Bookable activity is in the past')
      }

      return true
    } else {
      throw new UnauthorizedException('Type not recognized')
    }

    return false
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
