import { forwardRef, Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewResolver } from './review.resolver'
import { Review } from './entities/review.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TripModule } from 'src/trip/trip.module'

import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => TripModule),
    forwardRef(() => BookableTripModule),
  ],
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService, TypeOrmModule],
})
export class ReviewModule {}
