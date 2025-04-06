import { forwardRef, Module } from '@nestjs/common'
import { ReportService } from './report.service'
import { ReportResolver } from './report.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from 'src/users/users.module'
import { BookableTripModule } from 'src/bookable-trip/bookable-trip.module'
import { Report } from './entities/report.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    forwardRef(() => UsersModule),
    forwardRef(() => BookableTripModule),
  ],
  providers: [ReportResolver, ReportService],
  exports: [ReportService, TypeOrmModule],
})
export class ReportModule {}
