import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { Report } from './entities/report.entity'
import { CreateReportInput } from './dto/create-report.input'
import { UsersService } from 'src/users/users.service'
import { BookableTripService } from 'src/bookable-trip/bookable-trip.service'
import { UpdateReportInput } from './dto/update-report.input'

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: MongoRepository<Report>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(forwardRef(() => BookableTripService))
    private readonly bookableTripService: BookableTripService,
  ) {}

  // all reports KLAAR
  async findAll(): Promise<Report[]> {
    return await this.reportRepository.find()
  }

  // one report based on id KLAAR
  async findOne(id: string): Promise<Report | undefined> {
    try {
      const objId = new ObjectId(id)
      return await this.reportRepository.findOneBy({ _id: objId })
    } catch (error) {
      console.error(`Failed to find report with id ${id}:`, error)
      throw new Error(`Report not found with id ${id}`)
    }
  }

  // find by many ids DIT IS NODIG VOOR HET RESOLVEN IN BOOKABLETRIP / USER
  findManyByIds = async (ids: string[]): Promise<Report[]> => {
    const objIds = ids.map(id => new ObjectId(id))
    return await this.reportRepository.find({ where: { _id: { $in: objIds } } })
  }

  // all reports by guide ID - KLAAR
  async findAllByGuideId(id: string): Promise<Report[]> {
    return this.reportRepository.find({ where: { guideId: id } })
  }

  // reports based on bookableTripId - KLAAR
  async findByBookableTripId(bookableTripId: string): Promise<Report[]> {
    return this.reportRepository.find({ where: { bookableTripId } })
  }

  // reports based on guideId - KLAAr
  async findByGuideId(guideId: string): Promise<Report[]> {
    return this.reportRepository.find({ where: { guideId } })
  }

  // create report
  async create(createReportInput: CreateReportInput): Promise<Report> {
    const report = new Report()
    report.title = createReportInput.title
    report.date = createReportInput.date
    report.description = createReportInput.description
    report.guideId = createReportInput.guideId
    report.bookableTripId = createReportInput.bookableTripId

    // nu fetchen we de guide a.h.v. de guideId
    const guide = await this.usersService.findById(report.guideId)

    if (!guide) {
      throw new Error(`Guide not found with id ${report.guideId}`)
    }

    // nu fetchen we de bookableTrip a.h.v. de bookableTripId
    const bookableTrip = await this.bookableTripService.findOne(
      report.bookableTripId,
    )

    if (!bookableTrip) {
      throw new Error(`BookableTrip not found with id ${report.bookableTripId}`)
    }

    // check if guide is assignedd to that bookableTrip
    // extra security layer
    if (
      !new ObjectId(bookableTrip.assignedGuideId).equals(new ObjectId(guide.id))
    ) {
      throw new Error(
        `Guide with id ${guide.id} is not assignedd to bookableTrip with id ${bookableTrip.id} because assignedGuideId is ${bookableTrip.assignedGuideId}`,
      )
    }

    // nu gaan we de report opslaan
    const res = await this.reportRepository.save(report)

    // nu gaan we de guide deze report toevoegen aan zijn reports
    if (!guide.reportIds) {
      // init array als deze nog niet bestaat
      guide.reportIds = []
    }
    guide.reportIds.push(res.id)

    // update de guide
    await this.usersService.updateUser(guide)

    // nu gaan we de bookableTrip deze report toevoegen aan zijn reports
    if (!bookableTrip.reportIds) {
      // init array als deze nog niet bestaat
      bookableTrip.reportIds = []
    }

    bookableTrip.reportIds.push(report.id)

    // update de bookableTrip
    await this.bookableTripService.update(bookableTrip.id, bookableTrip)

    return res
  }

  // update report
  async updateReport(updateReportInput: UpdateReportInput): Promise<Report> {
    // report fetchen met bestaande service
    const report = await this.findOne(updateReportInput.id)
    if (!report) {
      throw new Error(`Report not found with id ${updateReportInput.id}`)
    }
    // variables updaten
    report.title = updateReportInput.title
    report.description = updateReportInput.description

    // nu gaan we de report updaten
    const res = await this.reportRepository.save(report)

    return res
  }

  // delete report
  async removeReport(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new Error(`Report ID is required`)
      }

      // find report by id
      const report = await this.findOne(id)
      if (!report) {
        throw new Error(`Report not found with id ${id}`)
      }

      //guide updaten
      // nu gaan we de guide deze report verwijderen van zijn reports
      const guide = await this.usersService.findById(report.guideId)
      // console.log(
      //   '------------guide met id',
      //   report.guideId,
      //   ':',
      //   guide,
      //   'reportId:',
      //   id,
      // )
      // if (!guide) {
      //   throw new Error(`Guide not found with id ${report.guideId}`)
      // }

      // filter en verwijder reportId van guide
      guide.reportIds = guide.reportIds.filter(
        reportId => reportId.toString() !== id,
      )
      //console.log('----------updated guide met id ', report.guideId,':', guide)

      // update de guide
      await this.usersService.updateUser(guide)

      //bookableTrip updaten
      // nu gaan we de bookableTrip deze report verwijderen van zijn reports
      const bookableTrip = await this.bookableTripService.findOne(
        report.bookableTripId,
      )
      if (!bookableTrip) {
        throw new Error(
          `BookableTrip not found with id ${report.bookableTripId}`,
        )
      }

      //console.log('------------bookableTrip met id', report.bookableTripId, ':', bookableTrip, 'reportId:', id)

      // filter en verwijder report van bookableTrip
      bookableTrip.reportIds = bookableTrip.reportIds.filter(
        reportId => reportId.toString() !== id,
      )

      //console.log('----------updated bookableTrip met id ', report.bookableTripId,':', bookableTrip)
      // update de bookableTrip
      await this.bookableTripService.update(bookableTrip.id, bookableTrip)

      // verwijder report by id
      await this.reportRepository.delete(id)

      return true
    } catch (error) {
      console.error(`Failed to remove report with id ${id}:`, error)
      return false
    }
  }
  // indien je een report delete, zal je dit ook moeten deleten bij de guide en de bookableTrip je kan dit doen a.h.v. de correcte update te gebruiken zie create ;)
}
