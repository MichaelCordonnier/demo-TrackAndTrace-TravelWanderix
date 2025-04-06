import gql from 'graphql-tag'

export const GET_TRIPS = gql`
  query GetTrips {
    trips {
      id
      name
      startDate
      endDate
      createdAt
      itinerary {
        id
        day_number
        date
        location {
          id
          name
        }
      }
    }
  }
`

export const GET_SIMPLE_TRIPS = gql`
  query GetTrips {
    trips {
      id
      name
      ageGroup
      headerImageUrl
      bookingSettings {
        price
      }
      reviews {
        id
        rating
      }
      bookableTrips {
        id
        tripId
        startDate
        status
        endDate
        bookingIds
      }
    }
  }
`
export const GET_TRIP_BY_ID = gql`
  query GetTripById($id: String!) {
    trip(id: $id) {
      id
      bannerImageUrl
      headerImageUrl
      description
      name
      ageGroup
      createdAt
      updatedAt
      reviews {
        id
        rating
        userId
        review
        createDate
      }
      bookableTrips {
        id
        startDate
        endDate
        status
        bookableSettings {
          price
        }
      }
      itinerary {
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
        id
      }
      bookingSettings {
        max_participants
        min_participants
        auto_cancel
        auto_cancel_days_before
        price
      }
    }
  }
`

export const GET_BOOKABLE_TRIP_BY_ID = gql`
  query BookableTrip($id: String!) {
    bookableTrip(id: $id) {
      id
      tripId
      status
      startDate
      endDate
      status
      bookings {
        id
        how_many
        totalPrice
      }
      bookableSettings {
        places
        autocancel
        autocancel_on
        min_persons_required
        max_persons
        price
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
          bookidActivitys
          location {
            id
            name
            geolocation {
              coordinates
              type
            }
          }
        }
      }
    }
  }
`
