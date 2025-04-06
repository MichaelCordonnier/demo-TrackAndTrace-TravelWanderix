import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { ChatroomService } from './chatroom.service'
import { Chatroom } from './entities/chatroom.entity'
import { UsersService } from 'src/users/users.service'
import { EmbeddedMessage } from 'src/entities/embedded-message'
import { Inject, UseGuards } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { ChatroomGuard } from './guards/chatroom.guard'

@Resolver(() => Chatroom)
export class ChatroomResolver {
  constructor(
    private readonly chatroomService: ChatroomService,

    private readonly usersService: UsersService,

    @Inject('PUB_SUB')
    private readonly pubSub: PubSub,
  ) {}

  // add chatroom for ano user

  // remove chatroom function only possible on a chatroom without bookable trip

  @Mutation(() => Chatroom)
  newChatroomForUser(@Args('userId') userId: string) {
    return this.chatroomService.createChatroomForUser(userId)
  }

  @ResolveField('users')
  async users(@Parent() chatroom: Chatroom) {
    if (!chatroom.usersIds || chatroom.usersIds.length === 0) {
      return []
    }

    return this.usersService.findMultipleByIds(chatroom.usersIds)
  }

  @UseGuards(ChatroomGuard)
  @Subscription(() => EmbeddedMessage)
  latestMessage(@Args('chatroomId') chatroomId: string) {
    console.log(
      `Client connected to chatroom ${chatroomId} to receive latest message`,
    )
    return this.pubSub.asyncIterableIterator(`latestMessage ${chatroomId}`)
  }

  @Subscription(() => Chatroom)
  newChatroom(@Args('userId') userId: string) {
    return this.pubSub.asyncIterableIterator(`newChatroom ${userId}`)
  }

  @Subscription(() => String)
  chatroomDeleted(@Args('userId') userId: string) {
    return this.pubSub.asyncIterableIterator(`chatroomDeleted ${userId}`)
  }
}
