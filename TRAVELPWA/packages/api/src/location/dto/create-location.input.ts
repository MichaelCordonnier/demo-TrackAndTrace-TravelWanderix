import { InputType, Field } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { GeoPoint } from '../entities/geopoint.entity'

@InputType()
export class CreateLocationInput {
  @Field()
  name: string

  @IsNotEmpty()
  @ValidateNested() //validation
  //class-transfomer, do not forget this, otherwise validation of nested object will not work
  @Type(type => GeoPoint) // eslint-disable-line
  @Field(() => GeoPoint)
  geolocation: GeoPoint
}
