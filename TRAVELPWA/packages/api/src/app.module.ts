import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { TripModule } from './trip/trip.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivitiesModule } from './activities/activities.module'
import { SeedModule } from './seed/seed.module'
import { DayModule } from './day/day.module'
import { LocationModule } from './location/location.module'
import { AuthenticationModule } from './authentication/authentication.module'
import { ConfigModule } from '@nestjs/config'
import { ReviewModule } from './review/review.module'
import { BookableActivityModule } from './bookable-activity/bookable-activity.module'
import { BookableTripModule } from './bookable-trip/bookable-trip.module'
import { UsersModule } from './users/users.module'
import { MailModule } from './mailer/mailer.module'
import { ReportModule } from './report/report.module'
// import { NotificationsModule } from './notifications/notifications.module';
import { ChatroomModule } from './chatroom/chatroom.module'
import { NotificationsModule } from './notifications/notifications.module'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { SeedService } from './seed/seed.service'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      // disable caching for testing purpose
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req }) => ({ req }),
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
          const mongo = await MongoMemoryServer.create({
            instance: {
              dbName: process.env.DB_NAME,
            },
          })

          const mongoUri = mongo.getUri()
          console.log('🍃 mongoUri', mongoUri)

          return {
            type: 'mongodb',
            url: `${mongoUri}${process.env.DB_NAME}`,
            entities: [__dirname + '/**/*.entity.{js,ts}'],
            synchronize: process.env.NODE_ENV == 'production' ? false : true, // Careful with this in production
          }
        } else {
          return {
            type: 'mongodb',
            url: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // DOCKER
            entities: [__dirname + '/**/*.entity.{js,ts}'],
            synchronize: process.env.NODE_ENV == 'production' ? false : true, // Careful with this in production
          }
        }
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    MailModule,
    TripModule,
    ActivitiesModule,
    SeedModule,
    DayModule,
    LocationModule,
    AuthenticationModule,
    ReviewModule,
    BookableActivityModule,
    BookableTripModule,
    UsersModule,
    ReportModule,
    NotificationsModule,
    ChatroomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  async seed() {
    await this.seedService.addRootUser()
    await this.seedService.addActivitiesFromJson()
    await this.seedService.addTripsFromJson()
  }

  constructor(private seedService: SeedService) {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) this.seed()
  }
}
