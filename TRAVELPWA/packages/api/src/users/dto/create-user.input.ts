import { InputType, Field } from '@nestjs/graphql'
import { Role } from '../entities/user.entity'
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsEmail,
  Length,
  IsOptional,
} from 'class-validator'

@InputType()
export class CreateUserInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  uid: string // Firebase UID

  @IsEmail()
  @Field()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  @Field()
  username: string

  @IsString()
  @IsNotEmpty()
  @Field()
  gender: string

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  locale?: string

  @IsEnum(Role)
  @Field(() => String)
  role: Role
}
