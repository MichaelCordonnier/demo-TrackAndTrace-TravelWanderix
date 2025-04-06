import { Module } from '@nestjs/common'
import { CommandModule } from 'nestjs-command'
import { SeedService } from './seed.service'
import { DatabaseSeedCommand } from './seed.command'
import { TripModule } from 'src/trip/trip.module'
import { ReviewModule } from 'src/review/review.module'
import { DayModule } from 'src/day/day.module'
import { LocationModule } from 'src/location/location.module'
import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'
import { UsersModule } from 'src/users/users.module'
import { BookingModule } from 'src/booking/booking.module'
import { ActivitiesModule } from 'src/activities/activities.module'
import { BookableActivityModule } from 'src/bookable-activity/bookable-activity.module'
import { ReportModule } from 'src/report/report.module'
import { ChatroomModule } from 'src/chatroom/chatroom.module'

@Module({
  imports: [
    TripModule,
    CommandModule,
    ReviewModule,
    DayModule,
    LocationModule,
    BookableTripModule,
    BookableActivityModule,
    ActivitiesModule,
    UsersModule,
    BookingModule,
    ReportModule,
    ChatroomModule,
  ],
  providers: [DatabaseSeedCommand, SeedService],
  exports: [SeedService],
})
export class SeedModule {}
