import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { tripStub, updatedTripStub } from 'src/trip/stubs/trip.stub'
import { TripService } from 'src/trip/trip.service'
import { FirebaseAuthStrategy } from 'src/authentication/firebase.auth.strategy'
import { FirebaseAuthStrategyMock } from './firebase.auth.strategy.mock'
import { UsersService } from 'src/users/users.service'
import { Role } from 'src/users/entities/user.entity'
import { UpdateTripInput } from 'src/trip/dto/update-trip.input'

describe('AppController (e2e)', () => {
  let app: INestApplication

  // npm run test:e2e

  const tripServiceMockData = {
    findAll: () => [tripStub()],
    findOne: () => tripStub(),
    create: () => tripStub(),
    update: (id: string, updateTripInput: UpdateTripInput) => {
      console.log(
        'Mock update called with id:',
        id,
        'updateTripInput:',
        updateTripInput,
      )
      return updatedTripStub()
    },
    remove: () => true,
  }

  const dummeJwtToken =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBkMGU4NmJkNjQ3NDBjYWQyNDc1NjI4ZGEyZWM0OTZkZjUyYWRiNWQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Fkdi1mdWxsLXN0YWNrLTIwMjItdGVzdCIsImF1ZCI6ImFkdi1mdWxsLXN0YWNrLTIwMjItdGVzdCIsImF1dGhfdGltZSI6MTY5NzM4OTcxOSwidXNlcl9pZCI6IjBQSVQ4RVVldVVadmJreGV6NEhWd0tzNUdWazEiLCJzdWIiOiIwUElUOEVVZXVVWnZia3hlejRIVndLczVHVmsxIiwiaWF0IjoxNjk4OTIyMTIwLCJleHAiOjE2OTg5MjU3MjAsImVtYWlsIjoic2RxZnFkc2ZxZHNmZHNkc2ZxcWZnQGRkZC5kZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJzZHFmcWRzZnFkc2Zkc2RzZnFxZmdAZGRkLmRkIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.aTZu66nOt8Sx9JeCbN_Q2cI2AnffvPok4dbcYJm8Gad0Xfz-DpUAw524i7LGpXbOraftd5PlkUjeMmD1fYpstezUdsnckoHmAmh_NaLZQ3OZ5HhjYfdtd-tsKRCnxQuWqd_QC5xo9rT8rpBb2WatXhaMZVbDgB7QbPUUJy4dLSQwAr73paAVJ3eave9R4-8c8q4FU7HXB6_Qeih5Ie-i54xEWoA-da3gHs0A_rWWwDOSgnh4pqMEWWMbe5PZQ0szjOykTS0nDafcL4_R0NdEeUYIR7RXBxy0LOO8WP8k5DF0oZlbtZBQc1UFiVKlquuSv2xZzsHQ-VALID-A'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TripService)
      .useValue(tripServiceMockData)
      .overrideProvider(FirebaseAuthStrategy)
      .useClass(FirebaseAuthStrategyMock)
      .overrideProvider(UsersService)
      .useValue({
        findOne: () => ({
          id: '1',
          role: Role.ADMIN,
          name: 'Admin',
          email: 'admin@wanderix.be',
          locale: 'nl',
        }),

        findOneByFirebaseUid: jest.fn(),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  const GQL_ENDPOINT = '/graphql'

  describe(GQL_ENDPOINT, () => {
    describe('Querys', () => {
      it('should return all Trips', () => {
        return request(app.getHttpServer())
          .post(GQL_ENDPOINT)
          .send({
            query: '{ trips { id, name } }',
          })
          .expect(200)
          .expect(res => {
            for (const trip of res.body.data.trips) {
              // console.log(trip)
              expect(trip.id).toBeDefined()
              expect(trip.name).toBeDefined()
            }
            expect(res.body.data.trips).toBeDefined()
          })
      })

      it('should return a Trip by ID', () => {
        return request(app.getHttpServer())
          .post(GQL_ENDPOINT)
          .send({
            query: '{ trip(id: "507f1f77bcf86cd799439011") { id, name } }',
          })
          .expect(200)
          .expect(res => {
            expect(res.body.data.trip).toBeDefined()
            expect(res.body.data.trip.id).toBe('507f1f77bcf86cd799439011')
            expect(res.body.data.trip.name).toBe('My Example')
          })
      })
    })
  })

  describe('Mutations', () => {
    it('should update a Trip', () => {
      return request(app.getHttpServer())
        .post(GQL_ENDPOINT)
        .send({
          query: `mutation {
            updateTrip(updateTripInput: { id: "1", name: "Updated Trip", madeById: "1" }) {
              id
              name
            }
          }`,
        })
        .set('Authorization', `Bearer ${dummeJwtToken}`)
        .expect(200)
        .expect(res => {
          console.log(res.body)
          expect(res.body.data.updateTrip).toBeDefined()
          expect(res.body.data.updateTrip.id).toBe('507f1f77bcf86cd799439011')
          expect(res.body.data.updateTrip.name).toBe('My Updated Trip')
        })
    })

    it('should create a Trip', () => {
      return request(app.getHttpServer())
        .post(GQL_ENDPOINT)
        .send({
          query: `mutation {
            createTrip(createTripInput: { name: "My Example", headerImageUrl: "https://www.example.com", bannerImageUrl: "https://www.example.com", description: "My Trip Description", ageGroup: "18-25", startDate: "2021-01-01", endDate: "2021-01-03", bookingSettings: { max_participants: 10, min_participants: 1, price: 100, auto_cancel: false, auto_cancel_days_before: 0 } }) {
              id
              name
            }
          }`,
        })
        .set('Authorization', `Bearer ${dummeJwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createTrip).toBeDefined()
          expect(res.body.data.createTrip.id).toBe('507f1f77bcf86cd799439011')
          expect(res.body.data.createTrip.name).toBe('My Example')
        })
    })

    it('should remove a Trip', () => {
      return request(app.getHttpServer())
        .post(GQL_ENDPOINT)
        .send({
          query: `mutation {
            removeTrip(id: "1")
          }`,
        })
        .set('Authorization', `Bearer ${dummeJwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.removeTrip).toBe(true)
        })
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
