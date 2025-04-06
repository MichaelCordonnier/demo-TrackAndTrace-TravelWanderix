import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator'

@InputType()
export class CreateReviewInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id: string

  @IsNumber()
  @Min(1)
  @Max(5)
  @Field(() => Number)
  rating: number

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  review: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  userId: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  tripId: string

  // @Field(() => String)
  // activityId: string
}
