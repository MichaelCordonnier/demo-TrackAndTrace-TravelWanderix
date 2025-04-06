import { Field, InputType, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class BookableSettings {
  @Field()
  places: number

  @Field()
  autocancel: boolean

  @Field({ nullable: true })
  autocancel_on: Date

  @Field()
  min_persons_required: number

  @Field()
  max_persons: number

  @Field()
  price: number

  //   hier moet er dan reservaties komen (bookings)
}

@InputType()
export class BookableSettingsInput {
  @Field()
  places: number

  @Field()
  autocancel: boolean

  @Field({ nullable: true })
  autocancel_on: Date

  @Field()
  min_persons_required: number

  @Field()
  max_persons: number

  @Field()
  price: number
}
