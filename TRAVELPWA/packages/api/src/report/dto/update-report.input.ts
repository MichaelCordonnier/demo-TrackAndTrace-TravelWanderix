import { CreateReportInput } from './create-report.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'
import { IsString, IsNotEmpty, IsDate } from 'class-validator'

@InputType()
export class UpdateReportInput extends PartialType(CreateReportInput) {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  id: string

  @IsString()
  @Field(() => String)
  title: string

  @IsDate()
  @Field(() => Date)
  date: Date

  @IsString()
  @Field(() => String)
  description: string

  @IsString()
  @Field(() => String)
  guideId: string

  @IsString()
  @Field(() => String)
  bookableTripId: string
}
