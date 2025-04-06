import { Test, TestingModule } from '@nestjs/testing'
import { TripResolver } from './trip.resolver'
import { TripService } from './trip.service'
import { Reflector } from '@nestjs/core'
import { CreateTripInput } from './dto/create-trip.input'
import { Trip } from './entities/trip.entity'
import { ReviewService } from '../review/review.service'
import { BookableTripService } from '../bookable-trip/bookable-trip.service'
import { tripStub } from './stubs/trip.stub'

jest.mock('./trip.service.ts')
jest.mock('../review/review.service')
jest.mock('../bookable-trip/bookable-trip.service')

// reflector niet vergeten!

describe('TripResolver', () => {
  let resolver: TripResolver
  let mockedService: TripService
  //let reflector: Reflector

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripResolver,
        TripService,
        Reflector,
        ReviewService,
        BookableTripService,
      ],
    }).compile()

    resolver = module.get<TripResolver>(TripResolver)
    mockedService = module.get<TripService>(TripService)
    //reflector = module.get<Reflector>(Reflector)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('createTrip', () => {
    let createTripInput: CreateTripInput
    let result: Trip

    beforeEach(async () => {
      createTripInput = {
        name: tripStub().name,
        description: tripStub().description,
        bannerImageUrl: tripStub().bannerImageUrl,
        headerImageUrl: tripStub().headerImageUrl,
        ageGroup: tripStub().ageGroup,
        startDate: tripStub().startDate,
        endDate: tripStub().endDate,
        bookingSettings: tripStub().bookingSettings,
      }

      result = await resolver.createTrip(createTripInput)
    })

    describe('when createTrip is called', () => {
      it('should call tripservice.create one time', () => {
        expect(mockedService.create).toHaveBeenCalledTimes(1)
      })

      it('should call tripservice.create with the correct arguments', async () => {
        expect(mockedService.create).toHaveBeenCalledWith(createTripInput)
      })

      it('should return a created trip', () => {
        expect(result).toEqual(tripStub())
      })
    })
  })

  describe('findAll', () => {
    let resultResolver: Trip[]

    beforeEach(async () => {
      resultResolver = await resolver.findAll()
    })

    describe('when findAll is called', () => {
      it('should call tripservice.findAll one time', () => {
        expect(mockedService.findAll).toHaveBeenCalledTimes(1)
      })

      it('should return an array of trips', () => {
        expect(resultResolver).toEqual([tripStub()])
      })
    })
  })

  describe('findOne', () => {
    let resultResolver: Trip
    let id: string

    beforeEach(async () => {
      id = tripStub().id
      resultResolver = await resolver.findOne(id)
    })

    describe('when findOne is called', () => {
      it('should call tripservice.findOne one time', () => {
        expect(mockedService.findOne).toHaveBeenCalledTimes(1)
      })

      it('should call tripservice.findOne with the correct id', () => {
        expect(mockedService.findOne).toHaveBeenCalledWith(id)
      })

      it('should return a trip', () => {
        expect(resultResolver).toEqual(tripStub())
      })
    })
  })

  describe('removeTrip', () => {
    let result: boolean
    let id: string

    beforeEach(async () => {
      id = tripStub().id
      result = await resolver.removeTrip(id)
    })

    describe('when removeTrip is called', () => {
      it('should call tripservice.remove one time', () => {
        expect(mockedService.remove).toHaveBeenCalledTimes(1)
      })

      it('should call tripservice.remove with the correct id', () => {
        expect(mockedService.remove).toHaveBeenCalledWith(id)
      })

      it('should return true', () => {
        expect(result).toBe(true)
      })
    })
  })
})
