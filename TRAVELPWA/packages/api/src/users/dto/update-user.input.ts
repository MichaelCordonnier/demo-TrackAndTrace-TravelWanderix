import { CreateUserInput } from './create-user.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator'

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @IsString()
  @IsNotEmpty()
  @Field()
  id: string

  @IsString()
  @IsUrl()
  @Field()
  imageUrl: string

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  assignedBookableTripIds: string[]

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  chatroomIds: string[]

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  reportIds: string[]
}
