import { Test, TestingModule } from '@nestjs/testing'
import { ActivitiesResolver } from './activities.resolver'
import { ActivitiesService } from './activities.service'
import { ReviewService } from '../review/review.service'
import { BookableActivityService } from '../bookable-activity/bookable-activity.service'
import { LocationService } from '../location/location.service'
import { activityStub } from './stubs/activity.stub'
import { CreateActivityInput } from './dto/create-activity.input'
import { Activity } from './entities/activity.entity'

jest.mock('./activities.service.ts')
jest.mock('../review/review.service')
jest.mock('../bookable-activity/bookable-activity.service')
jest.mock('../location/location.service')

describe('ActivitiesResolver', () => {
  let resolver: ActivitiesResolver
  let activitiesService: ActivitiesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesResolver,
        ActivitiesService,
        ReviewService,
        BookableActivityService,
        LocationService,
      ],
    }).compile()

    resolver = module.get<ActivitiesResolver>(ActivitiesResolver)
    activitiesService = module.get<ActivitiesService>(ActivitiesService)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('createActivity', () => {
    let createActivityInput: CreateActivityInput
    beforeEach(async () => {
      createActivityInput = {
        name: activityStub().name,
        description: activityStub().description,
        bannerImageUrl: activityStub().bannerImageUrl,
        headerImageUrl: activityStub().headerImageUrl,
        ageGroup: activityStub().ageGroup,
        bookingSettings: activityStub().bookingSettings,
        recommended: activityStub().recommended,
        duration: activityStub().duration,
        equipmentProvided: activityStub().equipmentProvided,
        safetyMeasures: activityStub().safetyMeasures,
        locationId: activityStub().locationId,
      }
    })

    describe('when createActivity is called', () => {
      it('should call activitiesService.create', () => {
        const createSpy = jest.spyOn(activitiesService, 'create')
        resolver.createActivity(createActivityInput)
        expect(createSpy).toHaveBeenCalledTimes(1)
      })

      it('should call activitiesService.create with the correct arguments', () => {
        expect(activitiesService.create).toHaveBeenCalledWith(
          createActivityInput,
        )
      })
    })
  })

  describe('findAll', () => {
    let resultResolver: Activity[]

    beforeEach(async () => {
      resultResolver = await resolver.findAll()
    })

    describe('when findAll is called', () => {
      it('should call activitiesService.findAll one time', () => {
        expect(activitiesService.findAll).toHaveBeenCalledTimes(1)
      })

      it('should return an array of activities', () => {
        expect(resultResolver).toEqual([activityStub()])
      })
    })
  })

  describe('findOne', () => {
    let resultResolver: Activity

    beforeEach(async () => {
      resultResolver = await resolver.findOne('507f1f77bcf86cd799439011')
    })

    describe('when findOne is called', () => {
      it('should call activitiesService.findOne one time', () => {
        expect(activitiesService.findOne).toHaveBeenCalledWith(
          '507f1f77bcf86cd799439011',
        )
      })

      it('should return an activity', () => {
        expect(resultResolver).toEqual(activityStub())
      })
    })
  })
})
