import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { CreateBookableActivityInput } from './create-bookable-activity.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateBookableActivityInput extends PartialType(
  CreateBookableActivityInput,
) {
  @IsNotEmpty()
  @Field(() => String)
  id: string

  @IsDate()
  @IsOptional()
  @Field(() => String, { nullable: true })
  endDate: Date | null | undefined

  @IsArray()
  @Field(() => [String], { nullable: true })
  bookingIds: string[]

  @IsString()
  @Field(() => String, { nullable: true })
  status: string
}
