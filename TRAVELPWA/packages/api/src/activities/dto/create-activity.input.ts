import { InputType, Field } from '@nestjs/graphql'
import { BookingSettingsInput } from '../../entities/booking-settings.entity'
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsBoolean,
  IsNumber,
  Length,
  IsArray,
  IsOptional,
} from 'class-validator'
import { Type } from 'class-transformer'

@InputType()
export class CreateActivityInput {
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  @Field()
  name: string

  @IsUrl()
  @IsNotEmpty()
  @Field()
  bannerImageUrl: string

  @IsUrl()
  @IsNotEmpty()
  @Field()
  headerImageUrl: string

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  recommended: boolean

  @IsString()
  @IsNotEmpty()
  @Field()
  ageGroup: string

  @IsString()
  @IsOptional()
  @Length(10, 500)
  @Field()
  description: string

  @IsNumber()
  @IsNotEmpty()
  @Field()
  duration: number

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  equipmentProvided: string[]

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  safetyMeasures: string[]

  @IsNotEmpty()
  @Field()
  locationId: string

  @Type(() => BookingSettingsInput)
  @Field()
  bookingSettings: BookingSettingsInput
}
