import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { LocationService } from './location.service'
import { Location } from './entities/location.entity'
import { CreateLocationInput } from './dto/create-location.input'
import { UpdateLocationInput } from './dto/update-location.input'

@Resolver(() => Location)
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Mutation(() => Location)
  createLocation(
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ) {
    return this.locationService.create(createLocationInput)
  }

  @Query(() => [Location], { name: 'allLocations' })
  findAll() {
    return this.locationService.findAll()
  }

  @Query(() => Location, { name: 'LocationById' })
  findOne(@Args('id', { type: () => Int }) id: string) {
    return this.locationService.findOne(id)
  }

  @Mutation(() => Location)
  updateLocation(
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ) {
    return this.locationService.update(
      updateLocationInput.id,
      updateLocationInput,
    )
  }

  @Mutation(() => Location)
  removeLocation(@Args('id', { type: () => String }) id: string) {
    return this.locationService.remove(id)
  }
}
