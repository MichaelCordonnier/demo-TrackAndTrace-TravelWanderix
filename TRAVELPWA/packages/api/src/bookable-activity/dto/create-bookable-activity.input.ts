import { InputType, Field } from '@nestjs/graphql'
import { BookableSettingsInput } from '../../entities/bookable-settings.entity'
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsPositive,
  IsString,
  Max,
  Min,
  IsArray,
  IsOptional,
} from 'class-validator'

@InputType()
export class CreateBookableActivityInput {
  @IsDefined()
  @Field(() => String, { description: 'Unique identifier for the trip' })
  activityId: string

  @IsDate()
  @IsNotEmpty()
  @Field()
  startDate: Date // Use string to represent time in HH:mm format

  @IsPositive()
  @Min(-1)
  @Max(12)
  @Field()
  duration: number

  @IsString()
  @IsNotEmpty()
  @Field()
  status: string

  @IsBoolean()
  @Field()
  recommended: boolean

  // Bookable Settings
  @Field(() => BookableSettingsInput, {
    description: 'Settings related to booking the trip',
  })
  bookableSettings: BookableSettingsInput

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Field(() => [String], { description: 'List of booking IDs' })
  bookingIds: string[]

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Created by id' })
  createdById: string
}
