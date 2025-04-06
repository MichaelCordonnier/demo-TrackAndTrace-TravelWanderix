import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Chatroom } from './entities/chatroom.entity'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { EmbeddedMessage } from '../entities/embedded-message'
import { UsersService } from '../users/users.service'
import { BookableTripService } from '../bookable-trip/bookable-trip.service'
import { BookableActivityService } from '../bookable-activity/bookable-activity.service'
import { PubSub } from 'graphql-subscriptions'
import { CreateChatroomInput } from './dto/create-chatroom.input'
import { Cron } from '@nestjs/schedule'
@Injectable()
export class ChatroomService {
  constructor(
    @InjectRepository(Chatroom)
    private readonly chatroomRepository: MongoRepository<Chatroom>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(forwardRef(() => BookableTripService))
    private readonly bookableTripService: BookableTripService,

    @Inject(forwardRef(() => BookableActivityService))
    private readonly bookableActivityService: BookableActivityService,

    @Inject('PUB_SUB')
    private readonly pubSub: PubSub,
  ) {}

  async createChatroom(createChatroomInput: CreateChatroomInput) {
    console.log(
      '#58 chatroom.service.ts createChatroom',
      createChatroomInput.name,
      createChatroomInput.bookableId,
      createChatroomInput.usersIds,
      createChatroomInput.type,
    )
    const chatroom = new Chatroom()
    chatroom.name = createChatroomInput.name
    chatroom.bookableTripId = createChatroomInput.bookableId
    chatroom.usersIds = createChatroomInput.usersIds
    chatroom.messages = []
    chatroom.createdAt = new Date()
    chatroom.status = 'active'

    // get the bookable trip

    const bookableTrip = await this.bookableTripService.findOne(
      createChatroomInput.bookableId,
    )

    if (!bookableTrip) {
      throw new Error(
        `Bookable trip with id ${createChatroomInput.bookableId} not found`,
      )
    }

    // check if users exist
    for (const userId of createChatroomInput.usersIds) {
      const user = await this.usersService.findById(userId)

      // append user to chatroom
      if (!chatroom.users) {
        chatroom.users = []
      }

      chatroom.users.push(user)

      if (!user) {
        throw new Error(`User with id ${userId} not found`)
      }
    }

    const newChatRoom = await this.chatroomRepository.save(chatroom)

    // add newchatroom to bookable

    bookableTrip.roomId = newChatRoom.id

    await this.bookableTripService.update(
      createChatroomInput.bookableId,
      bookableTrip,
    )

    console.log(
      '#58 chatroom.service.ts trying to update bookabletrip with roomId',
      bookableTrip,
    )

    // DEPRECATED
    // } else if (createChatroomInput.type === 'activity') {
    //   const bookableActivity = await this.bookableActivityService.findOne(
    //     createChatroomInput.bookableId,
    //   )

    //   if (!bookableActivity) {
    //     throw new Error(
    //       `Bookable activity with id ${createChatroomInput.bookableId} not found`,
    //     )
    //   }

    //   // check if users exist
    //   for (const userId of createChatroomInput.usersIds) {
    //     const user = await this.usersService.findById(userId)
    //     if (!user) {
    //       throw new Error(`User with id ${userId} not found for activity`)
    //     }
    //   }

    //   newChatRoom = await this.chatroomRepository.save(chatroom)

    //   // add newchatroom to bookable

    //   bookableActivity.roomId = newChatRoom.id

    //   await this.bookableActivityService.update(
    //     createChatroomInput.bookableId,
    //     bookableActivity,
    //   )

    //   console.log(
    //     '#58 chatroom.service.ts trying to update bookableactivity with roomId',
    //     bookableActivity,
    //   )
    // }

    for (const userId of createChatroomInput.usersIds) {
      console.log(
        '#58 chatroom.service.ts trying to add user to chatroom',
        userId,
      )
      const user = await this.usersService.findById(userId.toString())

      if (!user) {
        throw new Error(`User with id ${userId} not found`)
      }

      console.log('User chatroomIds', user.chatroomIds)

      if (!user.chatroomIds) {
        user.chatroomIds = []
      }

      console.log('User chatroomIds', user.chatroomIds)

      console.log('Chatroom ' + newChatRoom.id + ' added to user ' + user.id)
      user.chatroomIds.push(newChatRoom.id)
      console.log('tot hier ok <=>')
      await this.usersService.updateUser(user)

      // publish that their is a new chatroom
      await this.pubSub.publish(`newChatroom ${userId}`, {
        newChatroom: newChatRoom,
      })
    }

    return newChatRoom
  }

  async getallChatroomsByUserId(userId: string) {
    const user = await this.usersService.findById(userId)

    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    const chatroomIds = user.chatroomIds

    if (!chatroomIds || chatroomIds.length === 0) {
      return []
    }
    console.log('#108 chatroom.service.ts chatroomIds', chatroomIds)

    const chatrooms = await this.chatroomRepository.find({
      where: { _id: { $in: chatroomIds.map(id => new ObjectId(id)) } },
    })

    return chatrooms
  }

  async getChatroomById(id: string) {
    const objId = new ObjectId(id)
    return this.chatroomRepository.findOneBy({ _id: objId })
  }

  async addUserToChatroom(chatroomId: string, userId: string) {
    const chatroom = await this.getChatroomById(chatroomId)

    if (!chatroom) {
      throw new Error(`Chatroom with id ${chatroomId} not found`)
    }

    // get user

    if (chatroom.usersIds.includes(userId)) {
      console.log('DIKKE PANNEKOEK MAG NIET')
      return chatroom
    }

    // get user by id
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    console.log('#108 chatroom.service.ts user chatroomids', user.chatroomIds)
    if (!user.chatroomIds) {
      console.log('resetten naar zero ')
      user.chatroomIds = []
    }

    user.chatroomIds.push(chatroomId)

    // console.log('#108  trying to add user to chatroom', user)
    await this.usersService.updateUser(user)

    // console.log('#111 chatroom.service.ts user added to chatroom', user)

    // zou in theorie niet mogen
    if (!chatroom.usersIds) {
      chatroom.usersIds = []
    }

    chatroom.usersIds.push(userId)

    // publish that their is a new chatroom

    const res = await this.chatroomRepository.save(chatroom)

    await this.pubSub.publish(`newChatroom ${userId}`, {
      newChatroom: chatroom,
    })

    return res
  }

  async removeUserFromChatroom(chatroomId: string, userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }

    user.chatroomIds = user.chatroomIds.filter(id => id !== chatroomId)

    await this.usersService.updateUser(user)

    const chatroom = await this.getChatroomById(chatroomId)
    if (!chatroom) {
      throw new Error(`Chatroom with id ${chatroomId} not found`)
    }

    chatroom.usersIds = chatroom.usersIds.filter(id => id !== userId)
    return this.chatroomRepository.save(chatroom)
  }

  async addMessageToChatroom(chatroomId: string, message: EmbeddedMessage) {
    console.log('#202 chatroom.service.ts adding message to chatroom', message)

    const chatroom = await this.getChatroomById(chatroomId)

    console.log('#205 chatroom.service.ts chatroom', chatroom)
    if (!chatroom) {
      throw new Error(`Chatroom with id ${chatroomId} not found`)
    }

    // convert id to objectId
    const newObjectIdUserId = new ObjectId(message.userId)

    // Convert ObjectId to string for comparison
    const userIds = chatroom.usersIds.map(userId => userId.toString())

    if (!userIds.includes(newObjectIdUserId.toString())) {
      throw new Error(`User with id ${message.userId} is not in chatroom`)
    }

    chatroom.lastMessage = message
    chatroom.status = 'active'

    const resultpublish = await this.pubSub.publish(
      `latestMessage ${chatroomId}`,
      {
        latestMessage: message,
      },
    )

    console.log('#228 chatroom.service.ts resultpublish', resultpublish)

    chatroom.messages.unshift(message)
    return this.chatroomRepository.save(chatroom)
  }

  async createChatroomForUser(userId: string) {
    // attach to root for demo purpose this is the leader
    const root = await this.usersService.findOneByFirebaseUid(
      'SXPP3snyN2f3ZOaT4KkTrhiFkg03',
    )

    const user = await this.usersService.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    if (!root) {
      throw new Error('Root user not found')
    }

    const chatroom = new Chatroom()
    const currentDate = new Date()

    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`

    chatroom.name = `${formattedDate} - Chatroom met Tour Operator`
    chatroom.usersIds = [user.id, root.id]

    // get root user
    const sendWelcomeUser = await this.usersService.findById(root.id)

    chatroom.messages = [
      {
        type: 'text',
        userId: root.id,
        content: 'Stel jouw vraag, ik neem zo snel mogelijk contact met je op!',
        createdAt: new Date(),
        user: sendWelcomeUser,
      },
    ]

    chatroom.createdAt = new Date()
    chatroom.status = 'active'

    const result = await this.chatroomRepository.save(chatroom)
    if (!root.chatroomIds) {
      root.chatroomIds = []
    }
    if (!user.chatroomIds) {
      user.chatroomIds = []
    }

    // add chatroom to user
    root.chatroomIds.push(chatroom.id)
    await this.usersService.updateUser(root)

    // add chatroom to other user
    user.chatroomIds.push(chatroom.id)
    await this.usersService.updateUser(user)

    // now for each user in chatroom publish that their is a new chatroom
    await this.pubSub.publish(`newChatroom ${userId}`, {
      newChatroom: chatroom,
    })

    await this.pubSub.publish(`newChatroom ${root.id}`, {
      newChatroom: chatroom,
    })

    return result
  }

  async deleteChatroomThatHasNoBookableTrip(chatroomId: string) {
    const chatroom = await this.getChatroomById(chatroomId)

    if (!chatroom) {
      throw new Error(`Chatroom with id ${chatroomId} not found`)
    }

    if (chatroom.bookableTripId) {
      throw new Error(
        `Chatroom with id ${chatroomId} has a bookable trip attached`,
      )
    }

    // get all users

    for (const userId of chatroom.usersIds) {
      const user = await this.usersService.findById(userId)

      if (user) {
        user.chatroomIds = user.chatroomIds.filter(id => id !== chatroomId)
        await this.usersService.updateUser(user)

        this.pubSub.publish(`chatroomDeleted for ${userId}`, {
          chatroomId: chatroomId,
        })
      } else {
        this.pubSub.publish(`chatroomDeleted for ${userId}`, {
          chatroomId: chatroomId,
        })
      }
    }

    return this.chatroomRepository.delete(chatroomId)
  }

  // bg service to check if chatrooms are inactive
  // @Cron('* * * * *')
  // for demo purpose every 5 minutes
  @Cron('*/5 * * * *')
  async deleteInactiveChatrooms() {
    // first get all chatrooms
    console.log('Checking chatrooms... ')
    const chatrooms = await this.chatroomRepository.find()

    for (const chatroom of chatrooms) {
      if (chatroom.bookableTripId) {
        // get the bookable trip
        console.log('Checking chatroom that has bookabletrip', chatroom.id)
        const bookableTrip = await this.bookableTripService.findOne(
          chatroom.bookableTripId,
        )

        if (bookableTrip.endDate < new Date()) {
          // put the status to closed
          chatroom.status = 'finished'
          await this.chatroomRepository.save(chatroom)
        }
      } else {
        // check if the lastmessage is older than 3 days put it to finsihed  if  its older then 7 days delete
        console.log('Checking chatroom that has no bookabletrip', chatroom.id)
        if (chatroom.lastMessage) {
          const lastMessageDate = new Date(chatroom.lastMessage.createdAt)
          console.log('lastMessageDate', lastMessageDate)
          console.log('now', new Date())
          const diff = new Date().getTime() - lastMessageDate.getTime()
          console.log('diff', diff)

          if (diff > 1000 * 60 * 60 * 24 * 7) {
            // delete chatroom
            console.log('Deleting chatroom', chatroom.id)
            await this.deleteChatroomThatHasNoBookableTrip(chatroom.id)
          } else if (diff > 1000 * 60 * 60 * 24 * 3) {
            // put the status to finished
            console.log('Closing chatroom', chatroom.id)
            chatroom.status = 'finished'
            await this.chatroomRepository.save(chatroom)
          }
        } else {
          // check the createdatdate if older then 3 hours delete
          const createdAtDate = new Date(chatroom.createdAt)
          console.log('createdAtDate', createdAtDate)
          console.log('now', new Date())

          const diff = new Date().getTime() - createdAtDate.getTime()

          console.log('diff', diff)

          if (diff > 1000 * 60 * 60 * 3) {
            // delete chatroom
            console.log('Deleting chatroom', chatroom.id)
            await this.deleteChatroomThatHasNoBookableTrip(chatroom.id)
          }
        }
      }
    }
  }
}
