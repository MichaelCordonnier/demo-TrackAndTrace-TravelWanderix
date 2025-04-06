import { Injectable } from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'
import { MongoRepository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { CreateLocationInput } from './dto/create-location.input'
import { Location } from './entities/location.entity'
import { UpdateLocationInput } from './dto/update-location.input'
@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: MongoRepository<Location>,
  ) {}

  // find by id
  findOne(id: string) {
    const objId = new ObjectId(id) // Correctly create ObjectId
    return this.locationRepository.findOneBy({ _id: objId })
  }

  async findAll(): Promise<Location[]> {
    return this.locationRepository.find()
  }

  // find location by name
  async findByName(name: string): Promise<Location> {
    return this.locationRepository
      .findOne({ where: { name: name } })
      .then(location => {
        return location
      })
  }

  async create(createLocationInput: CreateLocationInput): Promise<Location> {
    const location = new Location()
    location.name = createLocationInput.name
    location.geolocation = createLocationInput.geolocation
    return this.locationRepository.save(location)
  }

  async remove(id: string) {
    return this.locationRepository.delete(id)
  }

  async update(id: string, updateLocationInput: UpdateLocationInput) {
    return this.locationRepository.update(id, updateLocationInput)
  }

  async truncate() {
    return this.locationRepository.clear()
  }

  async saveAll(location: Location[]) {
    return this.locationRepository.save(location)
  }
}
