import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsNotEmpty, IsDate } from 'class-validator'

@InputType()
export class CreateReportInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  title: string

  @IsDate()
  @Field(() => Date)
  date: Date

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  description: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  guideId: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  bookableTripId: string
}
