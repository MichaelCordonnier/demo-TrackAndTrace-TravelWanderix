import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ChatroomService } from 'src/chatroom/chatroom.service'
import { UsersService } from 'src/users/users.service'
import { WsException } from '@nestjs/websockets'
import { FirebaseService } from 'src/authentication/services/firebase.service'

@Injectable()
export class ChatroomGuard implements CanActivate {
  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Checking if user is allowed in the chatroom')
    console.log('Context Type:', context.getType())
    console.log('Context:', context)

    const ctx = GqlExecutionContext.create(context)
    const { chatroomId } = ctx.getArgs()
    const req = ctx.getContext().req

    console.log('req', req)
    const token = await this.extractToken(req)

    // Authenticate user using the token
    let user
    try {
      user = await this.firebaseService.getAuth().verifyIdToken(token)
    } catch (error) {
      console.log('Invalid token', error)
      throw new WsException('Unauthorized')
    }

    console.log('User:', user)

    // Get custom user
    const customUser = await this.usersService.findOneByFirebaseUid(user.uid)

    if (!customUser) {
      console.log('Custom user not found')
      throw new WsException('Unauthorized')
    }

    console.log('Custom User:', customUser)

    // Check if the user is allowed to join the chatroom
    const chatroom = await this.chatroomService.getChatroomById(chatroomId)

    console.log('Chatroom:', chatroom)
    const userIdStr = customUser.id.toString()
    const isUserInChatroom = chatroom.usersIds.some(
      id => id.toString() === userIdStr,
    )

    if (!chatroom || !isUserInChatroom) {
      console.log('Forbidden because user is not in chatroom')
      throw new WsException('Forbidden')
    }

    console.log('User is allowed to join the chatroom')

    return true
  }

  private async extractToken(req: any): Promise<string> {
    console.log('Extracting token from request...')

    console.log('req Extra:', req.connectionParams.Authorization)

    // Extract token from HTTP headers
    if (req.extra) {
      return req.connectionParams.Authorization.replace('Bearer ', '')
    }

    console.log('No authorization token found')
    throw new WsException('Unauthorized')
  }
}
