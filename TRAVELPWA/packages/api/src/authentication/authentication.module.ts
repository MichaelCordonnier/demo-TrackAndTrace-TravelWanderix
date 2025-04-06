import { forwardRef, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { FirebaseService } from './services/firebase.service'
import { FirebaseAuthStrategy } from './firebase.auth.strategy'
import { ChatroomModule } from 'src/chatroom/chatroom.module'
import { UsersModule } from 'src/users/users.module'
import { BookableActivityModule } from 'src/bookable-activity/bookable-activity.module'
import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'

@Module({
  imports: [
    forwardRef(() => PassportModule),
    forwardRef(() => ChatroomModule),
    forwardRef(() => UsersModule),
    forwardRef(() => BookableActivityModule),
    forwardRef(() => BookableTripModule),
  ],
  providers: [FirebaseService, FirebaseAuthStrategy],
  exports: [FirebaseService],
})
export class AuthenticationModule {}
