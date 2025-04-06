import { Field, ObjectType } from '@nestjs/graphql'
import { User } from '../users/entities/user.entity'

@ObjectType()
export class EmbeddedMessage {
  @Field(() => String)
  type?: string

  @Field(() => String)
  content: string

  @Field(() => Date)
  createdAt?: Date

  @Field(() => String)
  userId: string

  @Field(() => User, { nullable: true })
  user?: User
}
