import { forwardRef, Module } from '@nestjs/common'
import { TripService } from './trip.service'
import { TripResolver } from './trip.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Trip } from './entities/trip.entity'
import { ReviewModule } from 'src/review/review.module'
import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip]),
    forwardRef(() => ReviewModule),
    forwardRef(() => forwardRef(() => BookableTripModule)),
  ],
  providers: [TripResolver, TripService],
  exports: [TripService, TypeOrmModule],
})
export class TripModule {}
