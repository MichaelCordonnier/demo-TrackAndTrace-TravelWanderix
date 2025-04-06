import { Field, InputType, ObjectType } from '@nestjs/graphql'

// zou hier niet meer in bij steken dit is meer dan voldoende voor nu

@ObjectType()
export class BookingSettings {
  @Field()
  max_participants: number

  @Field()
  min_participants: number

  // mag er auto cancel zijn?
  @Field()
  auto_cancel: boolean

  @Field()
  auto_cancel_days_before: number

  @Field()
  price: number
}

@InputType()
export class BookingSettingsInput {
  @Field()
  max_participants: number

  @Field()
  min_participants: number

  @Field()
  auto_cancel: boolean

  @Field()
  auto_cancel_days_before: number

  @Field()
  price: number
}
