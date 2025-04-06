import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'

import { FirebaseService } from 'src/authentication/services/firebase.service'
import { ChatroomService } from 'src/chatroom/chatroom.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class FirebaseWebsocketGuard implements CanActivate {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly chatroomService: ChatroomService,

    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient()
    const data = context.switchToWs().getData()
    const user = await this.validateUserFromWebSocket(client)

    const customUser = await this.usersService.findOneByFirebaseUid(user.uid)

    if (!user) {
      throw new WsException('Unauthorized')
    }

    console.log('Custom User:', customUser)

    // Attach the user to the WebSocket context
    data.user = user

    // Check if the user is allowed to join the chatroom
    if (data.roomId) {
      const chatroom = await this.chatroomService.getChatroomById(data.roomId)

      console.log('Chatroom:', chatroom)
      const userIdStr = customUser.id.toString()
      const isUserInChatroom = chatroom.usersIds.some(
        id => id.toString() === userIdStr,
      )

      if (!chatroom || !isUserInChatroom) {
        console.log('Forbidden because user is not in chatroom dummy')
        throw new WsException('Forbidden')
      }
    }

    console.log('User is allowed to join the chatroom')

    return true
  }

  private async validateUserFromWebSocket(client: any): Promise<any> {
    console.log('We trying to protect...')
    if (!client.handshake.headers.authorization) {
      console.log('No authorization header')
      throw new WsException('No authorization header')
    }
    const authToken = client.handshake.headers.authorization.replace(
      'Bearer ',
      '',
    )
    try {
      console.log('Trying to validate user...')

      const user = await this.firebase.getAuth().verifyIdToken(authToken)
      console.log('spaghetti')
      if (!user) {
        console.log('Unauthorized, user not found')
        throw new WsException('Unauthorized, user not found')
      }

      console.log('User:', user)
      return user
    } catch (err) {
      throw new WsException(err.message)
    }
  }
}
