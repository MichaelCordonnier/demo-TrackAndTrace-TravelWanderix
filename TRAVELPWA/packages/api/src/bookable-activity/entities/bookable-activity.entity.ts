import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Column, Entity, ObjectIdColumn } from 'typeorm'
// import { BookingSettings } from '../../entities/booking-settings.entity'
import { BookableSettings } from '../../entities/bookable-settings.entity'
import { Booking } from '../../booking/entities/booking.entity'
import { Location } from '../../location/entities/location.entity'
import { Activity } from '../../activities/entities/activity.entity'
import { Chatroom } from '../../chatroom/entities/chatroom.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
@ObjectType()
export class BookableActivity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field()
  activityId: string

  @Field(() => Activity)
  activity: Activity

  @Column()
  @Field()
  recommended: boolean

  @Column()
  @Field()
  name: string

  @Column()
  @Field(() => String)
  status: string

  @Column()
  @Field()
  description: string

  @Column()
  @Field()
  startDate: Date

  @Column()
  @Field()
  endDate: Date

  @Column()
  @Field(() => Location)
  location: Location

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  equipmentProvided: string[]

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  safetyMeasures: string[]

  // niet nodig!
  // @Field(() => BookingSettings, { nullable: false })
  // bookingSettings: BookingSettings

  //booking ids
  @Column()
  @Field(() => [String], { nullable: true })
  bookingIds: string[]

  @Field(() => [Booking], { nullable: true })
  bookings: Booking[]

  @Column({ type: 'simple-json', nullable: false })
  @Field(() => BookableSettings, { nullable: false })
  bookableSettings: BookableSettings

  @Column()
  @Field()
  createdById: string

  @Field()
  createdBy: User

  @Column()
  @Field(() => String, { nullable: true })
  roomId: string

  @Field(() => Chatroom, { nullable: true })
  chatroom: Chatroom
}
