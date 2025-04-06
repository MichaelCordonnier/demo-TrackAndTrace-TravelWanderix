import { CreateActivityInput } from './create-activity.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateActivityInput extends PartialType(CreateActivityInput) {
  @Field(() => String)
  id: string
}
