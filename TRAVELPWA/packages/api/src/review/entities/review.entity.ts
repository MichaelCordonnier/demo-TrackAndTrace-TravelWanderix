import { ObjectType, Field, Int, ID } from '@nestjs/graphql'
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from 'typeorm'

@Entity()
@ObjectType()
export class Review {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field(() => Int, { description: 'Rating out of 5' })
  rating: number

  @Column()
  @Field({ description: 'User ID of the reviewer' })
  userId: string

  @Column()
  @Field({ description: 'Comment by the reviewer' })
  review: string

  @CreateDateColumn({ type: 'timestamp' })
  @Field({ description: 'Date when the review was created' })
  createDate: Date
}

// a review is a review of a trip/acitity by a user Focus first on the activity/trip and then on the review
