import { forwardRef, Module } from '@nestjs/common'
import { ChatroomService } from './chatroom.service'
import { ChatroomResolver } from './chatroom.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Chatroom } from './entities/chatroom.entity'
import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'
import { BookableActivityModule } from 'src/bookable-activity/bookable-activity.module'
import { PubSubModule } from './pubsub.shared.module'
import { AuthenticationModule } from 'src/authentication/authentication.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatroom]),
    forwardRef(() => BookableTripModule),
    forwardRef(() => BookableActivityModule),
    PubSubModule,
    forwardRef(() => AuthenticationModule),
  ],
  providers: [ChatroomResolver, ChatroomService],
  exports: [ChatroomService],
})
export class ChatroomModule {}
