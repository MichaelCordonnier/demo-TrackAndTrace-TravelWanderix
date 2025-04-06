import { Injectable } from '@nestjs/common'
import { CreateDayInput } from './dto/create-day.input'
import { Day } from './entities/day.entity'
import { MongoRepository } from 'typeorm'
import { TripService } from 'src/trip/trip.service'
import { InjectRepository } from '@nestjs/typeorm'
import { LocationService } from 'src/location/location.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class DayService {
  constructor(
    @InjectRepository(Day)
    private readonly dayRepository: MongoRepository<Day>,

    private readonly tripService: TripService,

    private readonly locationService: LocationService,
  ) {}

  async create(tripId: string, createDayInput: CreateDayInput): Promise<Day> {
    const trip = await this.tripService.findOne(tripId)
    const day = new Day()
    day.id = uuidv4()
    // day.location = location
    Object.assign(day, createDayInput)
    trip.itinerary.push(day)
    await this.tripService.update(tripId, trip)
    return day
  }

  // get all days of a trip
  async findAll(tripId: string): Promise<Day[]> {
    const trip = await this.tripService.findOne(tripId)
    return trip.itinerary
  }

  // get a day by id
  async findOne(tripId: string, dayId: string): Promise<Day> {
    const trip = await this.tripService.findOne(tripId)
    const day = trip.itinerary.find(day => day.id === dayId)
    if (day && day.location_id) {
      day.location = await this.locationService.findOne(
        day.location_id.toString(),
      )
    }
    return day
  }
}
