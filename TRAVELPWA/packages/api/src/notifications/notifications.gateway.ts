import { UseGuards, UsePipes } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatroomService } from 'src/chatroom/chatroom.service'
import { FirebaseWebsocketGuard } from 'src/authentication/guards/firebase.websocket.guard'
import { EmbeddedMessage } from 'src/entities/embedded-message'
import { UsersService } from 'src/users/users.service'
import { MyWebSocketValidationPipe } from 'src/exceptions/mywebsocket.validationpipe'

@WebSocketGateway(+process.env.WS_PORT || 3004, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.URL_FRONTEND,
    ],
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server
  numberOfUsers = 0

  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly usersService: UsersService,
  ) {}

  private activeChatrooms: Map<string, Set<string>> = new Map()

  handleConnection() {
    this.numberOfUsers++
    console.log(`Client connected`)
  }

  handleDisconnect() {
    this.numberOfUsers--
    console.log(`Client disconnected`)
  }

  @UseGuards(FirebaseWebsocketGuard)
  @UsePipes(new MyWebSocketValidationPipe())
  @SubscribeMessage('Chatroom:message')
  async handleChatRoomMessage(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message } = payload as {
      roomId: string
      message: EmbeddedMessage
    }

    if (!roomId) {
      console.log('No roomId provided')
      client.emit('error', 'No roomId provided')
      return
    }

    const chatroom = await this.chatroomService.getChatroomById(roomId)

    if (!this.activeChatrooms.has(roomId)) {
      this.activeChatrooms.set(roomId, new Set())
      console.log(`Creating a new chatroom... ${roomId}`)

      if (!chatroom) {
        client.emit('error', 'Chatroom not found')
        console.log(`Chatroom not found`)
        return
      }

      console.log('Messages: ', chatroom.messages)
    } else {
      console.log(`Chatroom already exists... ${roomId}`)
    }

    // connecting to the chatroom so their cannot be any messages

    this.activeChatrooms.get(roomId)?.add(client.id)
    client.join(roomId)

    // init functie
    if (!message) {
      console.log('No message provided')
      console.log('Messages in chatroom:', chatroom.messages)
      // sort the message in chronological order
      chatroom.messages.sort((a, b) => {
        return a.createdAt.getTime() - b.createdAt.getTime()
      })

      chatroom.messages.forEach(async message => {
        const userThatSend =
          await this.usersService.findOneByIdAlsoResolveFirebase(message.userId)

        message.user = userThatSend
        console.log('User that send:', userThatSend)

        for (const key in userThatSend) {
          if (
            key !== 'id' &&
            key !== 'username' &&
            key !== 'imageUrl' &&
            key !== 'email'
          ) {
            delete userThatSend[key]
          }
        }

        client.emit('Chatroom:message', message)
      })
    }

    if (message) {
      const embeddedMessage: EmbeddedMessage = {
        type: 'text',
        userId: message.userId,
        content: message.content,
        createdAt: new Date(),
      }

      // resolve user
      const userThatSend =
        await this.usersService.findOneByIdAlsoResolveFirebase(message.userId)

      // remove evrything from the user that we dont need for security purpose
      for (const key in userThatSend) {
        if (
          key !== 'id' &&
          key !== 'username' &&
          key !== 'imageUrl' &&
          key !== 'email'
        ) {
          delete userThatSend[key]
        }
      }

      console.log('User that send:', userThatSend)

      if (userThatSend) {
        embeddedMessage.user = userThatSend
      }

      // now emit the message to the chatroom
      this.server.to(roomId).emit('Chatroom:message', embeddedMessage)

      // remove the user field again because we aint gone save this
      // to the database
      delete embeddedMessage.user

      try {
        await this.chatroomService.addMessageToChatroom(roomId, embeddedMessage)
        console.log(`Message sent to chatroom ${roomId}: ${message.content}`)
      } catch (error) {
        client.emit('error', error.message)
        console.error(`Error sending message to chatroom ${roomId}:`, error)
      }
    }
  }
}

console.log('🚀 WS_PORT', process.env.WS_PORT)
