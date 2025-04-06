import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BookingService } from './booking.service'
import { Booking } from './entities/booking.entity'
import { TripModule } from 'src/trip/trip.module' // Import TripModule
import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'
import { UsersModule } from 'src/users/users.module'
import { BookableActivityModule } from 'src/bookable-activity/bookable-activity.module'
import { ActivitiesModule } from 'src/activities/activities.module'
import { BookingResolver } from './booking.resolver'
import { ChatroomModule } from 'src/chatroom/chatroom.module'
import { AuthenticationModule } from 'src/authentication/authentication.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    forwardRef(() => TripModule),
    ActivitiesModule,
    forwardRef(() => BookableTripModule),
    BookableActivityModule,
    UsersModule,
    forwardRef(() => ChatroomModule),
    forwardRef(() => AuthenticationModule),
  ],
  providers: [BookingResolver, BookingService],
  exports: [BookingService],
})
export class BookingModule {}
