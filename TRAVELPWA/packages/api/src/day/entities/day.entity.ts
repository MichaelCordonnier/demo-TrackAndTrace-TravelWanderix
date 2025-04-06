import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Column } from 'typeorm'
import { Location } from '../../location/entities/location.entity'
import { ObjectId } from 'mongodb'
import { Booking } from '../../booking/entities/booking.entity'
// import { Activity } from 'src/activities/entities/activity.entity'
@ObjectType()
export class Day {
  @Field(() => ID)
  id: string

  @Column()
  @Field({ nullable: true })
  day_number: number

  @Column()
  @Field({ nullable: true })
  date: Date

  @Column()
  location_id: ObjectId

  @Field(() => Location, { nullable: true })
  location: Location

  // DEPRECTAED MAAR NIET DELETEN
  // @Column()
  // @Field(() => String, { nullable: true })
  // recommendActivityId: string

  // DEPRECTAED MAAR NIET DELETEN
  // DIT MAG WEL OPGEVULD WORDEN IN BOILLERPLATE WANT DIT IS RECOMMENDED, IN FRONTEND AFHANDELEN OF HET WEL EFFECTIEF BESCHIKBAAR IS OP DAT MOMENT
  // @Field(() => Activity, { nullable: true })
  // recommendedActivity: Activity

  // DIT MAG NIET OPGEVULD WORDEN IN BOILLERPLATE ENKEL BIJ EEN BOOKING
  @Column()
  @Field(() => [String], { nullable: true })
  bookidActivitys: string[]

  // DIT MAG NIET OPGEVULD WORDEN IN BOILLERPLATE ENKEL BIJ EEN BOOKING
  // @Column({
  //   type: 'simple-json',
  //   nullable: true,
  // })
  @Field(() => [Booking], { nullable: true })
  activities: Booking[]
}
