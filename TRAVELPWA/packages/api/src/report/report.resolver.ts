import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql'
import { ReportService } from './report.service'
import { Report } from './entities/report.entity'
import { Query } from '@nestjs/graphql'
import { CreateReportInput } from './dto/create-report.input'
import { UsersService } from 'src/users/users.service'
import { User } from 'src/users/entities/user.entity'
import { Parent } from '@nestjs/graphql'
import { BookableTripService } from 'src/bookable-trip/bookable-trip.service'
import { BookableTrip } from 'src/bookable-trip/entities/bookable-trip.entity'
import { UpdateReportInput } from './dto/update-report.input'
import { UseGuards } from '@nestjs/common'
import { FirebaseGuard } from '../authentication/guards/firebase.guard'
import { AllowedRoles } from '../users/decorators/roles.decorator'
import { Role } from '../users/entities/user.entity'

@Resolver(() => Report)
export class ReportResolver {
  constructor(
    private readonly reportService: ReportService,
    private readonly usersService: UsersService,
    private readonly bookableTripService: BookableTripService,
  ) {}

  // querie all reports a.h.v.service
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Query(() => [Report], { name: 'reports' })
  findAll() {
    return this.reportService.findAll()
  }

  // querie one report a.h.v. service
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Query(() => Report, { name: 'report' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.reportService.findOne(id)
  }

  // querie reports op basis van bookableTripId dit returned een array van reports a.h.v. service
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Query(() => [Report], { name: 'reportsByBookableTripId' })
  findByBookableTripId(
    @Args('bookableTripId', { type: () => String }) bookableTripId: string,
  ) {
    return this.reportService.findByBookableTripId(bookableTripId)
  }

  // querie reports op basis van guideId dit returned een array van reports a.h.v. service
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Query(() => [Report], { name: 'reportsByGuideId' })
  findByGuideId(@Args('guideId', { type: () => String }) guideId: string) {
    return this.reportService.findByGuideId(guideId)
  }

  // create report a.h.v. service
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Mutation(() => Report)
  createReport(
    @Args('createReportInput') createReportInput: CreateReportInput,
  ) {
    return this.reportService.create(createReportInput)
  }

  // resolve field guide a.h.v. user.service.findoneby
  @ResolveField('guide')
  async guide(@Parent() report: Report): Promise<User> {
    return this.usersService.findOneById(report.guideId)
  }

  // resolve field bookableTrip a.h.v. bookable-trip.service.findoneby
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @ResolveField('bookableTrip')
  async bookableTrip(@Parent() report: Report): Promise<BookableTrip> {
    return this.bookableTripService.findOne(report.bookableTripId)
  }

  // update report a.h.v. service een update moet altijd het laatste geupdate report terug geven. m.a.w. indien je update save je dit in je service doeje een findoneby op het id van de report en geef je die terug => dit allemaal afhandelen in je service layer

  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Mutation(() => Report)
  updateReport(
    @Args('updateReportInput') updateReportInput: UpdateReportInput,
  ) {
    return this.reportService.updateReport(updateReportInput)
  }

  // delete report a.h.v. service
  @UseGuards(FirebaseGuard)
  @AllowedRoles(Role.ADMIN, Role.GUIDE)
  @Mutation(() => Boolean)
  removeReport(@Args('id', { type: () => String }) id: string) {
    return this.reportService.removeReport(id)
  }
}
