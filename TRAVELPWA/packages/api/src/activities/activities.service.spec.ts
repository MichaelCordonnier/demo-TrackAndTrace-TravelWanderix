import { Test, TestingModule } from '@nestjs/testing'
import { ActivitiesService } from './activities.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Activity } from './entities/activity.entity'
import { MongoRepository } from 'typeorm'
import { activityStub } from './stubs/activity.stub'
//import { CreateActivityInput } from './dto/create-activity.input'
//import { BookingSettingsInput } from '../entities/booking-settings.entity'
import { BookableActivityService } from '../bookable-activity/bookable-activity.service'
import { LocationService } from '../location/location.service'
import { ActivitiesResolver } from './activities.resolver'
import { CreateActivityInput } from './dto/create-activity.input'
import { ReviewService } from '../review/review.service'
import { ObjectId } from 'mongodb'
import { bookableActivityStub } from './stubs/bookable-activity.stub'
import { locationStub } from './stubs/location.stub'

jest.mock('../bookable-activity/bookable-activity.service')
jest.mock('../location/location.service')
jest.mock('../review/review.service')

describe('ActivitiesService', () => {
  let service: ActivitiesService
  let mockActivityRepository: MongoRepository<Activity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            save: jest.fn().mockResolvedValue(activityStub),
            find: jest.fn().mockResolvedValue([activityStub()]),
            findOne: jest.fn().mockResolvedValue(activityStub()),
            findOneBy: jest.fn().mockResolvedValue(activityStub()),
            update: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
          },
        },
        ActivitiesResolver,
        BookableActivityService,
        LocationService,
        ReviewService,
      ],
    }).compile()

    service = module.get<ActivitiesService>(ActivitiesService)
    mockActivityRepository = module.get<MongoRepository<Activity>>(
      getRepositoryToken(Activity),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    describe('when create is called', () => {
      it('should call activityRepository.save', async () => {
        const activity = new CreateActivityInput()
        const saveSpy = jest.spyOn(mockActivityRepository, 'save')

        await service.create(activity)
        expect(saveSpy).toHaveBeenCalledTimes(1)
      })
      it('should return the created activity', async () => {
        const activity = new CreateActivityInput()
        const result = await service.create(activity)
        expect(result).toEqual(activityStub)
      })
    })
  })

  describe('findAll', () => {
    describe('when findAll is called', () => {
      it('should call activityRepository.find one time', async () => {
        const findSpy = jest.spyOn(mockActivityRepository, 'find')
        await service.findAll()
        expect(findSpy).toHaveBeenCalledTimes(1)
      })
      it('should return an array of activities', async () => {
        const result = await service.findAll()
        expect(result).toEqual([activityStub()])
      })
      it('should return an empty array if no activities are found', async () => {
        jest.spyOn(mockActivityRepository, 'find').mockResolvedValue([])
        const result = await service.findAll()
        expect(result).toEqual([])
      })
    })
  })

  describe('findOne', () => {
    describe('when findOne is called', () => {
      it('should call activityRepository.findOneBy one time', async () => {
        const findOneSpy = jest.spyOn(mockActivityRepository, 'findOneBy')
        await service.findOne('507f1f77bcf86cd799439011')
        expect(findOneSpy).toHaveBeenCalledWith({
          _id: new ObjectId('507f1f77bcf86cd799439011'),
        })
      })
      it('should return an activity', async () => {
        const result = await service.findOne('507f1f77bcf86cd799439011')
        expect(result).toEqual(activityStub())
      })
      it('should return null if no activity is found', async () => {
        jest.spyOn(mockActivityRepository, 'findOneBy').mockResolvedValue(null)
        const result = await service.findOne('507f1f77bcf86cd799439011')
        expect(result).toBeNull()
      })
    })
  })

  describe('truncate', () => {
    describe('when truncate is called', () => {
      it('should clear the activity repository', async () => {
        const clearSpy = jest.spyOn(mockActivityRepository, 'clear')
        await service.truncate()
        expect(clearSpy).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('AddBookableActivityIdToActivity', () => {
    describe('when AddBookableActivityIdToActivity is called', () => {
      it('should add a bookable activity id to an activity', async () => {
        const activityId = '507f1f77bcf86cd799439011'
        const bookableId = '507f1f77bcf86cd799439012'
        const updateSpy = jest.spyOn(mockActivityRepository, 'update')
        jest
          .spyOn(service, 'findOne')
          .mockResolvedValue(activityStub() as Activity)
        jest
          .spyOn(BookableActivityService.prototype, 'findOne')
          .mockResolvedValue(bookableActivityStub() as any)

        await service.AddBookableActivityIdToActivity(activityId, bookableId)
        expect(updateSpy).toHaveBeenCalledTimes(1)
      })

      it('should throw an error if the activity or bookable activity is not found', async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue(null)
        jest
          .spyOn(BookableActivityService.prototype, 'findOne')
          .mockResolvedValue(null)
        await expect(
          service.AddBookableActivityIdToActivity(
            '507f1f77bcf86cd799439011',
            '507f1f77bcf86cd799439012',
          ),
        ).rejects.toThrow('Activity or BookableActivity not found')
      })
    })
  })

  describe('findByLocationAndDate', () => {
    describe('when findByLocationAndDate is called', () => {
      it('should return activities filtered by location and date', async () => {
        const location = { latitude: 40.7128, longitude: -74.006 }
        const startDate = '2023-01-01'
        const endDate = '2023-12-31'
        jest
          .spyOn(mockActivityRepository, 'find')
          .mockResolvedValue([activityStub() as Activity])

        console.log('locationStub', locationStub())

        jest
          .spyOn(LocationService.prototype, 'findOne')
          .mockResolvedValue(locationStub() as any)
        jest
          .spyOn(BookableActivityService.prototype, 'findManyByIds')
          .mockResolvedValue([bookableActivityStub() as any])

        const result = await service.findByLocationAndDate(
          location,
          startDate,
          endDate,
        )
        expect(result).toEqual([activityStub()])
      })

      it('should return an empty array if no activities match the location and date', async () => {
        const location = { latitude: 40.7128, longitude: -74.006 }
        const startDate = '2021-01-01'
        const endDate = '2022-12-31'
        jest
          .spyOn(mockActivityRepository, 'find')
          .mockResolvedValue([activityStub() as Activity])
        jest
          .spyOn(LocationService.prototype, 'findOne')
          .mockResolvedValue(locationStub() as any)
        jest
          .spyOn(BookableActivityService.prototype, 'findManyByIds')
          .mockResolvedValue([bookableActivityStub()] as any)

        const result = await service.findByLocationAndDate(
          location,
          startDate,
          endDate,
        )
        expect(result).toEqual([])
      })

      it('should throw an error if fetching activities fails', async () => {
        const location = { latitude: 40.7128, longitude: -74.006 }
        const startDate = '2023-01-01'
        const endDate = '2023-12-31'
        jest
          .spyOn(mockActivityRepository, 'find')
          .mockRejectedValue(new Error('Database error'))

        await expect(
          service.findByLocationAndDate(location, startDate, endDate),
        ).rejects.toThrow('Failed to fetch activities. Please try again.')
      })
    })
  })
})
