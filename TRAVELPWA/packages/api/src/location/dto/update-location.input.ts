import { CreateLocationInput } from './create-location.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateLocationInput extends PartialType(CreateLocationInput) {
  @Field(() => String)
  id: string

  @Field(() => String)
  name: string
}

@InputType()
export class LocationInput {
  @Field()
  latitude: number

  @Field()
  longitude: number
}
