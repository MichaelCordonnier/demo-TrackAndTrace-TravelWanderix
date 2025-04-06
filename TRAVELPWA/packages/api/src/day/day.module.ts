import { Module } from '@nestjs/common'
import { DayService } from './day.service'
import { DayResolver } from './day.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Day } from './entities/day.entity'
import { TripModule } from 'src/trip/trip.module'
import { LocationModule } from 'src/location/location.module'
import { ActivitiesModule } from 'src/activities/activities.module'
import { BookingModule } from 'src/booking/booking.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Day]),
    TripModule,
    LocationModule,
    ActivitiesModule,
    BookingModule,
  ],
  providers: [DayResolver, DayService],
  exports: [DayService],
})
export class DayModule {}
