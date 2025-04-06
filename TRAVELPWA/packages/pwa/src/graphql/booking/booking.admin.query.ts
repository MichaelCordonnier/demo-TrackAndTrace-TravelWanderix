import gql from 'graphql-tag'

export const GET_BOOKING_BY_ID = gql`
  query Booking($id: String!) {
    booking(id: $id) {
      id
      type
      how_many
      startDate
      endDate
      totalPrice
      bookableTrip {
        status
      }
      trip {
        id
        bannerImageUrl
        headerImageUrl
        name
        ageGroup
        startDate
        endDate
        madeById
        countries
        reviewsIds
        bookableTripsIds
        itinerary {
          id
          day_number
          date
          bookidActivitys
          location {
            id
            name
            geolocation {
              coordinates
              type
            }
          }
          activities {
            id
            startDate
            endDate
            bookableActivityId
            bookableActivity {
              id
              activity {
                headerImageUrl
              }
              bookableSettings {
                price
              }
              recommended
            }
            type
            startDate
            personId
            totalPrice
            endDate
            how_many
            activity {
              id
              bannerImageUrl
              headerImageUrl
              ageGroup
              name
              duration
              locationId
              description
              recommended
              equipmentProvided
              safetyMeasures
              createdAt
              updatedAt
              madeById
              bookableActivitiesIds
              reviewsIds
            }
          }
        }
        description
      }
      extra_persons {
        name
        email
      }
      user {
        id
        gender
        email
        uid
        locale
        role
        createdAt
        updatedAt
        bookingIds
      }
    }
  }
`

export const CREATE_BOOKING = gql`
  mutation CreateBooking($createBookingInput: CreateBookingInput!) {
    createBooking(createBookingInput: $createBookingInput) {
      id
      how_many
      totalPrice
      user {
        id
        email
        gender
        imageUrl
        uid
      }
      trip {
        id
        description
        bannerImageUrl
        headerImageUrl
        name
        ageGroup
        startDate
        endDate
        createdAt
        updatedAt
        madeById
        countries
        reviewsIds
        bookableTripsIds
        itinerary {
          id
          day_number
          date
          activities {
            id
            bookableActivityId
            type
            how_many
            startDate
            endDate
            personId
            totalPrice
          }
        }
      }
    }
  }
`

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: String!) {
    deleteBooking(id: $id) {
      id
    }
  }
`

export const DEPRECATED_GET_BOOKING_BY_ID = gql`
  query Booking($id: String!) {
    booking(id: $id) {
      id
      type
      how_many
      startDate
      endDate
      totalPrice
      trip {
        id
        bannerImageUrl
        headerImageUrl
        name
        ageGroup
        startDate
        endDate
        madeById
        countries
        reviewsIds
        bookableTripsIds
        itinerary {
          id
          day_number
          date
          location {
            id
            name
            geolocation {
              coordinates
              type
            }
          }
          recommendedActivity {
            id
            bannerImageUrl
            headerImageUrl
            ageGroup
            name
            duration
            description
            reviewsIds
          }
          activities {
            id
            bookableId
            type
            startDate
            personId
            totalPrice
            endDate
            how_many
            activity {
              name
            }
          }
        }
        description
      }
      extra_persons {
        name
        email
      }
      user {
        id
        gender
        email
        uid
        locale
        role
        createdAt
        updatedAt
        bookingIds
      }
    }
  }
`
