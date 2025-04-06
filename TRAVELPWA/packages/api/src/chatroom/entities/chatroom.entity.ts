import { ObjectType, Field, ID } from '@nestjs/graphql'
import { BookableTrip } from '../../bookable-trip/entities/bookable-trip.entity'
import { EmbeddedMessage } from '../../entities/embedded-message'
import { User } from '../../users/entities/user.entity'
import { Column, Entity, ObjectIdColumn } from 'typeorm'

@Entity()
@ObjectType()
export class Chatroom {
  @ObjectIdColumn()
  @Field(() => ID)
  id: string

  @Field()
  @Column()
  name: string

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  @Field(() => [EmbeddedMessage])
  messages: EmbeddedMessage[]

  @Field(() => Date)
  @Column()
  createdAt: Date

  @Column()
  @Field(() => String, { nullable: true })
  bookableTripId: string

  @Field(() => BookableTrip, { nullable: true })
  bookkableTrip: BookableTrip

  @Field(() => [String])
  @Column()
  usersIds: string[]

  @Field(() => [User])
  users: User[]

  @Column()
  @Field(() => EmbeddedMessage, { nullable: true })
  lastMessage: EmbeddedMessage

  @Column()
  @Field(() => String)
  status: string
}
