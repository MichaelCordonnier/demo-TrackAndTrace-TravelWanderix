import { CreateDayInput } from './create-day.input'
import { InputType, Field, Int, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateDayInput extends PartialType(CreateDayInput) {
  @Field(() => Int)
  id: number

  @Field(() => String)
  title: string
}
