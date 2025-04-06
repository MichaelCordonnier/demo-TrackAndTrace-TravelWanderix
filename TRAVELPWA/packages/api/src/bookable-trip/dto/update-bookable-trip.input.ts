import { CreateBookableTripInput } from './create-bookable-trip.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateBookableTripInput extends PartialType(
  CreateBookableTripInput,
) {
  @Field(() => String)
  id: string
}
