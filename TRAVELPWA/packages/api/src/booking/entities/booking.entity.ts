import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql'
import { Activity } from '../../activities/entities/activity.entity'
// import { BookableActivity } from 'src/bookable-activity/entities/bookable-activity.entity'
// import { BookableTrip } from 'src/bookable-trip/entities/bookable-trip.entity'
import { Trip } from '../../trip/entities/trip.entity'
import { User } from '../../users/entities/user.entity'
import { Column, Entity, ObjectIdColumn } from 'typeorm'
import { BookableActivity } from '../../bookable-activity/entities/bookable-activity.entity'
import { BookableTrip } from '../../bookable-trip/entities/bookable-trip.entity'

// een booking is infeite een reservering van een trip of een activity
// indien trip, zal men de activitys hier ook kunnen overschrijven
// indien activity referentie naar het bookable object
// bij beide sws persoonsgegevens.

@ObjectType()
export class ExtraPerson {
  @Field(() => String)
  name: string

  @Field(() => String)
  email: string
}

@InputType()
export class ExtraPersonInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  email: string
}
@Entity()
@ObjectType()
export class Booking {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  // enkel voor deleting purpose
  @Column()
  @Field(() => String, { nullable: true })
  bookableActivityId: string

  @Column()
  @Field(() => String)
  bookableTripId: string

  @Field(() => BookableActivity, { nullable: true })
  bookableActivity: BookableActivity

  @Field(() => BookableTrip, { nullable: true })
  bookableTrip: BookableTrip

  // type of trip of activity
  @Column()
  @Field(() => String)
  type: string

  @Column()
  @Field(() => Int)
  how_many: number

  // startdate
  @Column()
  @Field(() => Date)
  startDate: Date

  // enddate
  @Column()
  @Field(() => Date)
  endDate: Date

  @Column()
  @Field(() => String)
  personId: string

  @Field()
  user: User

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  @Field(() => [ExtraPerson], { nullable: true })
  extra_persons: ExtraPerson[]

  @Column()
  @Field(() => Int)
  totalPrice: number

  // if trip then stock the trip so we can customise it later
  @Column({
    type: 'simple-json',
    nullable: true,
  })
  @Field(() => Trip, { nullable: true })
  trip: Trip

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  @Field(() => Activity, { nullable: true })
  activity: Activity

  // only applicable for an activity
  @Field(() => Booking, { nullable: true })
  parentBooking: Booking
}
