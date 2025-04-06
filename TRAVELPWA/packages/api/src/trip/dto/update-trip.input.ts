import { CreateTripInput } from './create-trip.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'
import { IsString, IsNotEmpty, Length } from 'class-validator'

@InputType()
export class UpdateTripInput extends PartialType(CreateTripInput) {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  madeById: string

  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  @Field(() => String)
  name: string
}
