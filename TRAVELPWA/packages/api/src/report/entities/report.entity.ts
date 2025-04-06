import { Field, ID, ObjectType } from '@nestjs/graphql'
import { BookableTrip } from '../../bookable-trip/entities/bookable-trip.entity'
import { User } from '../../users/entities/user.entity'
import { Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity()
@ObjectType({ description: 'report' })
export class Report {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field(() => String)
  title: string

  @Column()
  @Field(() => Date)
  date: Date

  @Column()
  @Field(() => String)
  description: string

  @Column()
  @Field(() => String)
  guideId: string

  @Field(() => User)
  guide: User

  @Column()
  @Field(() => String)
  bookableTripId: string

  @Field(() => BookableTrip)
  bookableTrip: BookableTrip
}
