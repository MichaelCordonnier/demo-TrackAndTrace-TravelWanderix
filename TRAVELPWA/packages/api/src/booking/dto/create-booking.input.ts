import { InputType, Field } from '@nestjs/graphql'
import { ExtraPersonInput } from '../entities/booking.entity'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class CreateBookingInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  type: string

  @Field()
  fireAuthId: string

  // dit zal je enkem moeten gebruiken bij activity booking
  // we doen hier | null omdat dit nullable mag zijn of leeg
  @Field({ nullable: true })
  booking_trip_id: string

  // dit gebruik je enkel voor het aanmaken van een trip booking

  @Field({ nullable: true })
  bookable_trip_id: string

  // dit gebruik je enkel voor het aanmaken van een activity booking
  @Field({ nullable: true })
  bookable_activity_id: string

  @Field(() => [ExtraPersonInput], { nullable: true })
  extraPersons: ExtraPersonInput[]
}
