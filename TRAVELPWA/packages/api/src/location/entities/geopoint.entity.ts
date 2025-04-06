import { Field, InputType, ObjectType } from '@nestjs/graphql'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  Equals,
  IsNotEmpty,
} from 'class-validator'
import { Point } from 'geojson'

@InputType('GeoPointInput') //and use this as an input type
@ObjectType()
export class GeoPoint implements Point {
  @IsNotEmpty()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @ArrayNotEmpty()
  @Field(() => [Number], { nullable: true })
  coordinates: number[] // [longitude, latitude] [0,1]

  @IsNotEmpty()
  @Equals('Point')
  @Field()
  type: 'Point'
}
