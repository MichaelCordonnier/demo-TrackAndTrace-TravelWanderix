import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Column, Entity, ObjectIdColumn } from 'typeorm'
import { Point } from 'geojson'
import { GeoPoint } from './geopoint.entity'

@Entity()
@ObjectType({ description: 'location' })
export class Location {
  @Field(() => ID)
  @ObjectIdColumn()
  id: string

  @Column()
  @Field({ nullable: true })
  name: string

  @Field(() => GeoPoint)
  @Column({ nullable: true, type: 'simple-json' })
  geolocation: Point
}
