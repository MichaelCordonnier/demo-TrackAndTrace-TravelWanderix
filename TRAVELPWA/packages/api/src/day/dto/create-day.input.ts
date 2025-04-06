import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateDayInput {
  @Field(() => Int)
  day_number: number

  @Field()
  date: Date

  @Field()
  location_id: string

  // DEPRECTAED MAAR NIET DELETEN
  // @Field()
  // recommendedActivityId: string
}
