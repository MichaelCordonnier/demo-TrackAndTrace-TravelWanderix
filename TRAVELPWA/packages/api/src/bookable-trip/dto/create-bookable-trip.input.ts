import { InputType, Field } from '@nestjs/graphql'
import { BookableSettingsInput } from '../../entities/bookable-settings.entity'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator'
@InputType()
export class CreateBookableTripInput {
  // Trip ID
  @Field(() => String, { description: 'Unique identifier for the trip' })
  tripId: string

  // // Trip Name
  // @Field(() => String, {
  //   description: 'Name of the trip (for seeding purposes)',
  // })
  // tripName: string

  @IsNotEmpty()
  @IsOptional()
  @Field(() => String, { description: 'User that creates the trip' })
  createById: string

  // Start Date
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'The starting date of the trip' })
  startDate: Date

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  roomId: string

  @IsString()
  @IsOptional()
  @Field()
  status: string

  // Bookable Settings

  @Field(() => BookableSettingsInput, {
    description: 'Settings related to booking the trip',
  })
  bookableSettings: BookableSettingsInput // Changed to BookableSettingsInput

  // Booking IDs
  // @IsArray()
  // @IsOptional()
  @Field(() => [String], {
    description: 'List of booking IDs associated with the trip',
  })
  bookingIds: string[]

  @Field(() => String)
  assignedGuideId: string
}
