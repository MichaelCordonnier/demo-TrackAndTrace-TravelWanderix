import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Review } from '../../review/entities/review.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm'

import { BookingSettings } from '../../entities/booking-settings.entity'
import { BookableActivity } from '../../bookable-activity/entities/bookable-activity.entity'
import { Location } from '../../location/entities/location.entity'

@Entity()
@ObjectType({ description: 'activity' })
export class Activity {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field({ nullable: true })
  bannerImageUrl: string

  @Column()
  @Field({ nullable: true })
  headerImageUrl: string

  @Column()
  @Field({ nullable: true })
  ageGroup: string

  @Column()
  @Field({ nullable: true })
  name: string

  @Column()
  @Field({ nullable: true })
  duration: number

  @Column()
  @Field({ nullable: true })
  locationId: string

  @Field({ nullable: true })
  location: Location

  @Column()
  @Field({ nullable: true })
  description: string

  @Column()
  @Field({ nullable: false })
  recommended: boolean

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  equipmentProvided: string[]

  @Column({ nullable: true })
  @Field(() => [String], { nullable: true })
  safetyMeasures: string[]

  @CreateDateColumn({ type: 'timestamp', nullable: true }) // Database link - Typeorm
  @Field({ nullable: true }) // GraphQL
  createdAt?: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: true }) // Database link - Typeorm
  @Field({ nullable: true }) // GraphQL
  updatedAt?: Date

  @Column()
  @Field({ nullable: true })
  madeById: string

  @Column({ type: 'simple-json', nullable: true })
  @Field(() => BookingSettings, { nullable: true })
  bookingSettings: BookingSettings

  @Column()
  @Field(() => [String], { nullable: true })
  bookableActivitiesIds: string[]

  @Field(() => [BookableActivity], { nullable: true })
  bookableActivities: BookableActivity[]

  @Column()
  @Field(() => [String], { nullable: true })
  reviewsIds: string[]

  @Field(() => [Review], { nullable: true })
  reviewList: Review[]
}
