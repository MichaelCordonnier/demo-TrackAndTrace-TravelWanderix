// user.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Booking } from '../../booking/entities/booking.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BookableTrip } from '../../bookable-trip/entities/bookable-trip.entity'
import { Report } from '../../report/entities/report.entity'
import { Chatroom } from '../../chatroom/entities/chatroom.entity'

export enum Role {
  // kan trips, activites en bookings aanmaken
  ADMIN = 'ADMIN',
  // kan booking bekijken en activities/trips booken
  USER = 'USER',
  // kan reports maken en chatten met users
  GUIDE = 'GUIDE',
}

@Entity()
@ObjectType()
export class User {
  @ObjectIdColumn() // Database link - TypeORM
  @Field(() => ID) // GraphQL
  id: string

  @Column()
  @Field(() => String, { nullable: true })
  gender: string

  @Column()
  @Field(() => String)
  email: string

  @Field(() => String)
  username: string

  @Field(() => String)
  imageUrl: string

  @Column()
  @Field()
  uid: string // Firebase UID

  @Column()
  @Field({ nullable: true }) // Can return null in GraphQL if the user has no locale
  locale?: string

  @Column({ default: Role.USER })
  @Field(() => String)
  role: Role

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  createdAt?: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  updatedAt?: Date

  @Column({ nullable: true })
  @Field(() => [String])
  bookingIds = []

  @Field(() => [Booking])
  bookings: [Booking]

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  reportIds: string[]

  @Field(() => [Report], { nullable: true })
  reports: Report[]

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  assignedBookableTripIds: string[]

  @Field(() => [BookableTrip], { nullable: true })
  assignedBookableTrips: BookableTrip[]

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  chatroomIds: string[]

  @Field(() => [Chatroom], { nullable: true })
  chatrooms: Chatroom[]
}
