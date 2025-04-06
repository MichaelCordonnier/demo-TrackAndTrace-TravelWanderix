import { Trip } from 'src/trip/entities/trip.entity'
import { CreateBookingInput } from './create-booking.input'
import { Field, ID, InputType, Int, PartialType } from '@nestjs/graphql'
import { Activity } from 'src/activities/entities/activity.entity'
import { ExtraPersonInput } from '../entities/booking.entity'
import { IsNotEmpty, IsNumber } from 'class-validator'

// dit moet nog gecleaned worden door mc
@InputType()
export class UpdateBookingInput extends PartialType(CreateBookingInput) {
  @Field(() => ID)
  id: string // Ensure that the `id` is required for updating a booking

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int, { nullable: true })
  how_many?: number

  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  personId?: string

  @Field(() => [ExtraPersonInput], { nullable: true })
  extra_persons?: ExtraPersonInput[]

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int, { nullable: true })
  totalPrice?: number

  @Field(() => Trip, { nullable: true })
  trip?: Trip

  @Field(() => Activity, { nullable: true })
  activity?: Activity
}
