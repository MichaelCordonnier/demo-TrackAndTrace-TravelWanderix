import { forwardRef, Module } from '@nestjs/common'
import { BookableTripService } from './bookable-trip.service'
import { BookableTripResolver } from './bookable-trip.resolver'
import { BookableTrip } from './entities/bookable-trip.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TripModule } from 'src/trip/trip.module'
import { BookingModule } from 'src/booking/booking.module'
import { ReportModule } from 'src/report/report.module'
import { ChatroomModule } from 'src/chatroom/chatroom.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([BookableTrip]),
    forwardRef(() => TripModule),
    forwardRef(() => BookingModule),
    forwardRef(() => ReportModule),
    forwardRef(() => ChatroomModule),
  ],
  providers: [BookableTripResolver, BookableTripService],
  exports: [BookableTripService],
})
export class BookableTripModule {}
