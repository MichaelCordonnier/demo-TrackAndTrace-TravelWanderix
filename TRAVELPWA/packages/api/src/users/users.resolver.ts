import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { UsersService } from './users.service'
import { Role, User } from './entities/user.entity'
import { CreateUserInput } from './dto/create-user.input'
import { UseGuards } from '@nestjs/common'
import { FirebaseGuard } from 'src/authentication/guards/firebase.guard'
import { CurrentFirebaseUser } from 'src/decorators/user.decorator'
import { UserInfo } from 'firebase-admin/auth'
import { AllowedRoles } from './decorators/roles.decorator'
import { RolesGuard } from './guards/roles.guard'
import { UpdateUserInput } from './dto/update-user.input'
import { BookingService } from 'src/booking/booking.service'
import { Booking } from 'src/booking/entities/booking.entity'
import * as admin from 'firebase-admin'
import { ReportService } from 'src/report/report.service'
import { Report } from 'src/report/entities/report.entity'
import { BookableTrip } from 'src/bookable-trip/entities/bookable-trip.entity'
import { BookableTripService } from 'src/bookable-trip/bookable-trip.service'
import { Chatroom } from 'src/chatroom/entities/chatroom.entity'
import { ChatroomService } from 'src/chatroom/chatroom.service'

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly bookingService: BookingService,
    private readonly reportService: ReportService,
    private readonly bookableTripService: BookableTripService,

    private readonly chatroomService: ChatroomService,
  ) {}

  @UseGuards(FirebaseGuard)
  @Mutation(() => User)
  createOwnUseraccount(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentFirebaseUser() user: UserInfo,
  ) {
    if (user.uid !== createUserInput.uid) {
      throw new Error(
        'User not authorized to create this user. You can only create users for yourself.',
      )
    }
    if (createUserInput.role !== Role.USER) {
      throw new Error(
        'User not authorized to create this user. You can only create users with the role "user".',
      )
    }

    return this.usersService.create(createUserInput)
  }

  @UseGuards(FirebaseGuard)
  @Query(() => User, { name: 'ownUseraccount' })
  async ownUseraccount(@CurrentFirebaseUser() user: UserInfo) {
    const res = await this.usersService.findOneByFirebaseUid(user.uid)

    console.log('#users.resolver.ts: res', res)
    return res
  }

  @AllowedRoles(Role.USER, Role.ADMIN, Role.GUIDE)
  @UseGuards(FirebaseGuard, RolesGuard)
  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentFirebaseUser() user: UserInfo,
  ) {
    const userRole = await this.usersService.findOneByFirebaseUid(user.uid)
    if (
      (userRole && userRole.role === Role.USER) ||
      userRole.role === Role.GUIDE
    ) {
      if (updateUserInput.uid !== user.uid) {
        throw new Error(
          'User not authorized to update user. You can only update your own user account.',
        )
      }
      return this.usersService.updateUser(updateUserInput)
    } else if (userRole && userRole.role === Role.ADMIN) {
      return this.usersService.updateUser(updateUserInput)
    } else {
      throw new Error('No userRole found')
    }
  }
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @UseGuards(FirebaseGuard)
  @Query(() => [User], { name: 'allUsers' })
  async allUsers() {
    return this.usersService.findAll()
  }

  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @UseGuards(FirebaseGuard)
  @Query(() => [User], { name: 'allGuides' })
  async allGuides() {
    return this.usersService.findAllGuides()
  }

  @Mutation(() => User)
  async removeBookingFromUser(
    @Args('userId') userId: string,
    @Args('bookingId') bookingId: string,
  ) {
    return this.usersService.removeBookingFromUser(userId, bookingId)
  }

  @Query(() => User, { name: 'userByFirebaseUid' })
  async userByFirebaseUid(@Args('uid') uid: string) {
    return this.usersService.findOneByFirebaseUid(uid)
  }

  @Mutation(() => User)
  async addBookingToUser(
    @Args('userId') userId: string,
    @Args('bookingId') bookingId: string,
  ) {
    return this.usersService.addBookingToUser(userId, bookingId)
  }

  @ResolveField(() => [Booking], { nullable: true })
  async bookings(@Parent() user: User): Promise<Booking[]> {
    if (!user.bookingIds || user.bookingIds.length === 0) {
      return []
    }
    return this.bookingService.findManyByIds(user.bookingIds)
  }

  @ResolveField(() => String)
  async username(@Parent() user: User): Promise<string> {
    console.log('#114 userUID:', user.uid)
    try {
      const firebaseUser = await admin.auth().getUser(user.uid)
      return firebaseUser.displayName || ''
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // console.error('User not found:', error)
        return ''
      }
      // console.error('Error fetching Firebase user:', error)
      return ''
    }
  }

  @ResolveField(() => String)
  async imageUrl(@Parent() user: User): Promise<string> {
    try {
      const firebaseUser = await admin.auth().getUser(user.uid)
      return firebaseUser.photoURL || ''
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // console.error('User not found:', error)
        return ''
      }
      // console.error('Error fetching Firebase user:', error)
      return ''
    }
  }

  @ResolveField(() => [Report], { nullable: true })
  async reports(@Parent() user: User) {
    if (!user.reportIds || user.reportIds.length === 0) {
      return []
    }
    return this.reportService.findManyByIds(user.reportIds)
  }

  @ResolveField(() => [BookableTrip], { nullable: true })
  async assignedBookableTrips(@Parent() user: User) {
    if (
      !user.assignedBookableTripIds ||
      user.assignedBookableTripIds.length === 0
    ) {
      return []
    }
    return this.bookableTripService.findManyBookableTrips(
      user.assignedBookableTripIds,
    )
  }

  @ResolveField(() => [Chatroom], { nullable: true })
  async chatrooms(@Parent() user: User) {
    if (!user.chatroomIds || user.chatroomIds.length === 0) {
      return []
    }
    return this.chatroomService.getallChatroomsByUserId(user.id)
  }
}
