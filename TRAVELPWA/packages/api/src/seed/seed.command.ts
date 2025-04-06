import { Command } from 'nestjs-command'
import { Injectable } from '@nestjs/common'
import { SeedService } from './seed.service'

@Injectable()
export class DatabaseSeedCommand {
  constructor(private readonly seedService: SeedService) {}
  // DEPRECATED
  // // activities
  // // npx nestjs-command seed:database:activities
  // @Command({
  //   command: 'seed:database:activities',
  //   describe: 'Seed the database with activities',
  // })
  // async seedActivities() {
  //   console.info('🪺 Start seeding of activities')
  //   const activities = await this.seedService.addActivitiesFromJson()
  //   console.info(`🐣 ${activities}`)
  // }

  // // npx nestjs-command seed:database:bookable-activities

  // @Command({
  //   command: 'seed:reset:activities',
  //   describe: 'Delete all data from the activities table',
  // })
  // async deleteActivities() {
  //   console.info('🔪 Start deleting activities')
  //   await this.seedService.deleteAllActivities()
  //   console.info('🪶 Removed activities')
  // }

  // @Command({
  //   command: 'seed:reset:bookable-activities',
  //   describe: 'Delete all data from the bookable activities table',
  // })
  // async deleteBookableActivities() {
  //   console.info('🔪 Start deleting bookable activities')
  //   await this.seedService.deleteAllBookableActivities()
  //   console.info('🪶 Removed bookable activities')
  // }

  // // npx nestjs-command seed:database:trips
  // @Command({
  //   command: 'seed:database:trips',
  //   describe: 'Seed the database with trips',
  // })
  // async seedtrips() {
  //   console.info('🪺 Start seeding of trips')
  //   const trips = await this.seedService.addTripsFromJson()
  //   console.info(`🐣 ${trips}`)
  // }

  // npx nestjs-command seed:database:complete
  @Command({
    command: 'seed:database:complete',
    describe:
      'Seed the database fully with activities, trips, bookable activities, bookable trips and bookings',
  })
  async seedComplete() {
    console.info('🪺 Start seeding of the database')
    await this.seedService.addRootUser()
    // seed activities
    await this.seedService.addActivitiesFromJson()
    await this.seedService.addTripsFromJson()
    await this.seedService.triggerBgServices()
    console.info(`🐣 Seeding of the database is complete`)
  }

  @Command({
    command: 'seed:reset:bookable-trips',
    describe: 'Delete all data from the bookable trips table',
  })
  async deleteBookableTrips() {
    console.info('🔪 Start deleting bookable trips')
    await this.seedService.deleteAllBookablesTrips()
    console.info('🪶 Removed bookable trips')
  }

  @Command({
    command: 'seed:reset:trips',
    describe: 'Delete all data from the trips table',
  })
  async delete() {
    console.info('🔪 Start deleting trips')
    await this.seedService.deleteAllTripsAndReviews()
    console.info('🪶 Removed trips')
  }
}
