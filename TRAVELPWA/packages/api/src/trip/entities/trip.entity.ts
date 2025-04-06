import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Day } from '../../day/entities/day.entity'
import { Review } from '../../review/entities/review.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BookingSettings } from '../../entities/booking-settings.entity'
import { BookableTrip } from '../../bookable-trip/entities/bookable-trip.entity'

@Entity()
@ObjectType({ description: 'trip' })
export class Trip {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field({ nullable: true })
  description: string

  @Column()
  @Field({ nullable: true })
  bannerImageUrl: string

  @Column()
  @Field({ nullable: true })
  headerImageUrl: string

  @Column()
  @Field({ nullable: true })
  name: string

  @Column()
  @Field({ nullable: true })
  ageGroup: string

  @Column()
  @Field({ nullable: true })
  startDate: Date

  @Column()
  @Field({ nullable: true })
  endDate: Date

  @CreateDateColumn({ type: 'timestamp', nullable: true }) // Database link - Typeorm
  @Field({ nullable: true }) // GraphQL
  createdAt?: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: true }) // Database link - Typeorm
  @Field({ nullable: true }) // GraphQL
  updatedAt?: Date

  // can have multiple days is embedded in the trip
  @Column({ type: 'simple-json', nullable: true })
  @Field(() => [Day], { nullable: true })
  itinerary: Day[]

  @Column()
  @Field({ nullable: true })
  madeById: string

  @Column()
  @Field(() => [String], { nullable: true }) // Explicitly specify that this is a list of strings => otherwise it gives an error greets mc
  countries: string[]

  @Column({ type: 'simple-json', nullable: true })
  @Field(() => BookingSettings, { nullable: true })
  bookingSettings: BookingSettings

  @Column()
  @Field(() => [String], { nullable: true })
  reviewsIds: string[]

  @Field(() => [Review], { nullable: true })
  reviewList: Review[]

  @Column()
  @Field(() => [String], { nullable: true })
  bookableTripsIds: string[]

  @Field(() => [BookableTrip], { nullable: true })
  bookableTrips: BookableTrip[]
}
