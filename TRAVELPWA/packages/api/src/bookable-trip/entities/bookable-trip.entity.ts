import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Booking } from '../../booking/entities/booking.entity'
// import { Booking } from 'src/booking/entities/booking.entity'
import { BookableSettings } from '../../entities/bookable-settings.entity'
// import { BookingSettings } from 'src/entities/booking-settings.entity'
import { Column, Entity, ObjectIdColumn } from 'typeorm'
import { Trip } from '../../trip/entities/trip.entity'
import { Report } from '../../report/entities/report.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
@ObjectType()
export class BookableTrip {
  // hier komt een embeded trip in
  // met settings voor de trip
  // en de prijs
  // en de beschikbaarheid

  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  // tripId
  @Column()
  @Field(() => String)
  tripId: string

  @Field(() => Trip)
  trip: Trip

  @Column()
  @Field(() => String)
  createById: string

  @Field(() => User)
  createdBy: User

  @Column()
  @Field(() => String)
  roomId: string

  @Column()
  @Field(() => String)
  status: string

  @Column()
  @Field(() => Date)
  startDate: Date

  @Column()
  @Field(() => Date)
  endDate: Date

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  @Field(() => BookableSettings, { nullable: false })
  bookableSettings: BookableSettings

  @Column()
  @Field(() => [String])
  bookingIds: string[]

  @Field(() => [Booking])
  bookings: [Booking]

  // @Field(() => BookingSettings)
  // bookingsSettings: BookingSettings

  @Column()
  @Field(() => [String], { nullable: true })
  reportIds: string[]

  @Field(() => [Report], { nullable: true })
  reports: Report[]

  @Column()
  @Field(() => String)
  assignedGuideId: string

  @Field(() => User, { nullable: true })
  assignedGuide: User
}
