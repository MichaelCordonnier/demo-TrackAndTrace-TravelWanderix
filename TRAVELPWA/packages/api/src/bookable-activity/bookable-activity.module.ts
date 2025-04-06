import { forwardRef, Module } from '@nestjs/common'
import { BookableActivityService } from './bookable-activity.service'
import { BookableActivityResolver } from './bookable-activity.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BookableActivity } from './entities/bookable-activity.entity'
import { ActivitiesModule } from 'src/activities/activities.module'
import { BookingModule } from 'src/booking/booking.module'
import { MailModule } from 'src/mailer/mailer.module'
import { ChatroomModule } from 'src/chatroom/chatroom.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([BookableActivity]),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => BookableActivityModule),
    forwardRef(() => BookingModule),
    forwardRef(() => MailModule),
    forwardRef(() => ChatroomModule),
  ],
  providers: [BookableActivityResolver, BookableActivityService],
  exports: [BookableActivityService],
})
export class BookableActivityModule {}
