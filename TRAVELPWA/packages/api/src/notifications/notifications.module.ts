import { forwardRef, Module } from '@nestjs/common'
import { NotificationsGateway } from './notifications.gateway'
import { ChatroomModule } from 'src/chatroom/chatroom.module'
import { AuthenticationModule } from 'src/authentication/authentication.module'

@Module({
  imports: [
    forwardRef(() => ChatroomModule),
    forwardRef(() => AuthenticationModule),
  ],
  providers: [NotificationsGateway],
})
export class NotificationsModule {}
