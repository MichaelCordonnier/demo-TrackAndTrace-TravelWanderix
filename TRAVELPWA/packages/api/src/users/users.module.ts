import { Global, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersResolver } from './users.resolver'
import { User } from './entities/user.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BookingModule } from 'src/booking/booking.module'
import { forwardRef } from '@nestjs/common'
import { ReportModule } from '../report/report.module'
import { BookableTripModule } from '../bookable-trip/bookable-trip.module'
import { ChatroomModule } from 'src/chatroom/chatroom.module'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => BookingModule),
    forwardRef(() => ReportModule),
    forwardRef(() => BookableTripModule),
    forwardRef(() => ChatroomModule),
  ],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
