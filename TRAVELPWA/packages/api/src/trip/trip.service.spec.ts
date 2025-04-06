import { Test, TestingModule } from '@nestjs/testing'
import { TripService } from './trip.service'
import { MongoRepository } from 'typeorm'
import { Trip } from './entities/trip.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateTripInput } from './dto/create-trip.input'
import { createTripInputStub, tripStub } from './stubs/trip.stub'
import { TripResolver } from './trip.resolver'
import { ReviewService } from '../review/review.service'
import { BookableTripService } from '../bookable-trip/bookable-trip.service'
import { ObjectId } from 'mongodb'

jest.mock('../review/review.service')
jest.mock('../bookable-trip/bookable-trip.service')

describe('TripService', () => {
  let mockService: TripService
  let mockTripRepository: MongoRepository<Trip>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: getRepositoryToken(Trip),
          useValue: {
            save: jest.fn().mockResolvedValue(tripStub),
            find: jest.fn().mockResolvedValue([tripStub()]),
            findOne: jest.fn().mockResolvedValue(tripStub()),
            findOneBy: jest.fn().mockResolvedValue(tripStub()),
            update: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
          },
        },
        TripResolver,
        ReviewService,
        BookableTripService,
      ],
    }).compile()

    mockService = module.get<TripService>(TripService)
    mockTripRepository = module.get<MongoRepository<Trip>>(
      getRepositoryToken(Trip),
    )
  })

  it('should be defined', () => {
    expect(mockService).toBeDefined()
  })

  describe('create', () => {
    describe('when create is called', () => {
      it('should call tripRepository.save', async () => {
        const bird = new Trip()
        const saveSpy = jest.spyOn(mockTripRepository, 'save')

        await mockService.create(bird)
        expect(saveSpy).toHaveBeenCalledTimes(1)
      })
      it('should create a trip in the database', async () => {
        const trip = new Trip()
        const saveSpy = jest.spyOn(mockTripRepository, 'save')

        await mockService.create(trip)

        expect(saveSpy).toHaveBeenCalledTimes(1)
      })

      it('should be called with the correct arguments', async () => {
        const trip: CreateTripInput = createTripInputStub()
        const saveSpy = jest.spyOn(mockTripRepository, 'save')

        await mockService.create(trip)
        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(trip))
      })
    })
  })

  describe('findAll', () => {
    describe('when findAll is called', () => {
      it('should call tripRepository.find one time', async () => {
        const findSpy = jest.spyOn(mockTripRepository, 'find')
        await mockService.findAll()
        expect(findSpy).toHaveBeenCalledTimes(1)
      })
      it('should return an array of trips', async () => {
        const myTrip = tripStub()
        const result = await mockService.findAll()
        expect(result).toEqual([myTrip])
      })
    })
  })

  describe('findOne', () => {
    describe('when findOne is called', () => {
      it('should call tripRepository.findOneBy one time', async () => {
        const findOneSpy = jest.spyOn(mockTripRepository, 'findOneBy')
        await mockService.findOne('507f1f77bcf86cd799439011')
        expect(findOneSpy).toHaveBeenCalledWith({
          _id: new ObjectId('507f1f77bcf86cd799439011'),
        })
      })
      it('should return a trip', async () => {
        const myTrip = tripStub()
        const result = await mockService.findOne('507f1f77bcf86cd799439011')
        expect(result).toEqual(myTrip)
      })

      it('should return an error if the trip is not found', async () => {
        try {
          await mockService.findOne('507f1f77bcf86cd799439010')
        } catch (err) {
          expect(err.message).toEqual('Invalid ObjectId')
        }
      })
    })
  })

  describe('remove', () => {
    describe('when remove is called', () => {
      it('should call tripRepository.delete one time', async () => {
        const deleteSpy = jest.spyOn(mockTripRepository, 'delete')
        await mockService.remove('507f1f77bcf86cd799439011')
        expect(deleteSpy).toHaveBeenCalledTimes(1)
      })
      it('should call tripRepository.delete with the correct id', async () => {
        const deleteSpy = jest.spyOn(mockTripRepository, 'delete')
        await mockService.remove('507f1f77bcf86cd799439011')
        expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
      })
    })
  })

  describe('removeReviewFromTrip', () => {
    it('should remove a review from a trip', async () => {
      const tripId = '507f1f77bcf86cd799439011'
      const reviewId = '507f1f77bcf86cd799439013'
      const updateSpy = jest.spyOn(mockTripRepository, 'update')
      jest.spyOn(mockService, 'findOne').mockResolvedValue(tripStub())

      await mockService.removeReviewFromTrip(tripId, reviewId)
      expect(updateSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('truncate', () => {
    it('should clear the trip repository', async () => {
      const clearSpy = jest.spyOn(mockTripRepository, 'clear')
      await mockService.truncate()
      expect(clearSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('saveAll', () => {
    it('should save all trips', async () => {
      const trips = [tripStub()]
      const saveSpy = jest.spyOn(mockTripRepository, 'save')
      await mockService.saveAll(trips)
      expect(saveSpy).toHaveBeenCalledTimes(1)
    })
  })
})
