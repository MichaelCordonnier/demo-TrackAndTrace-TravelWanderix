import { forwardRef, Module } from '@nestjs/common'
import { ActivitiesService } from './activities.service'
import { ActivitiesResolver } from './activities.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Activity } from './entities/activity.entity'
import { LocationModule } from 'src/location/location.module'
import { ReviewModule } from 'src/review/review.module'
import { BookableActivityModule } from 'src/bookable-activity/bookable-activity.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    forwardRef(() => LocationModule),
    forwardRef(() => ReviewModule),
    forwardRef(() => BookableActivityModule),
  ],
  providers: [ActivitiesResolver, ActivitiesService],
  exports: [ActivitiesService, TypeOrmModule],
})
export class ActivitiesModule {}
