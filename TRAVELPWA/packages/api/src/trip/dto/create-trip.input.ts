import { InputType, Field } from '@nestjs/graphql'
import { BookingSettingsInput } from '../../entities/booking-settings.entity'
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  Length,
  IsDate,
  IsDefined,
  ValidateNested,
  MinDate,
} from 'class-validator'
import { Type } from 'class-transformer'

@InputType()
export class CreateTripInput {
  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  @Field()
  name: string

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Field()
  bannerImageUrl: string

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Field()
  headerImageUrl: string

  @IsString()
  @IsNotEmpty()
  @Length(20)
  @Field()
  description: string

  @IsString()
  @IsNotEmpty()
  @Field()
  ageGroup: string

  @IsDate()
  @MinDate(new Date())
  @Field()
  startDate: Date

  @IsDate()
  @MinDate(new Date())
  @Field()
  endDate: Date

  @IsDefined()
  @ValidateNested()
  @Type(() => BookingSettingsInput)
  @Field()
  bookingSettings: BookingSettingsInput
}
