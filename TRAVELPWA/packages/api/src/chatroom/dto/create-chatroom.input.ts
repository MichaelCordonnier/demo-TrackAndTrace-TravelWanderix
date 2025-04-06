import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class CreateChatroomInput {
  @Field(() => String)
  bookableId: string

  @Field(() => [String])
  usersIds: string[]

  @Field(() => String)
  name: string

  @IsNotEmpty()
  @Field(() => String)
  type: 'trip' | 'activity'
}
