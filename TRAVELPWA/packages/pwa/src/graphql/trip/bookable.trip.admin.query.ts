import gql from 'graphql-tag'

export const GET_BOOKABLE_TRIP_BY_ID = gql`
  query GetBookableTripById($id: String!) {
    bookableTrip(id: $id) {
      id
      tripId
      startDate
      endDate
      status
      trip {
        headerImageUrl
        name
      }
      bookings {
        id
        how_many
        totalPrice
        user {
          id
          username
          email
          imageUrl
        }
      }
      bookableSettings {
        places
        price
        max_persons
      }
      assignedGuide {
        id
        username
        email
        imageUrl
      }
      reports {
        id
        title
        date
        description
        guideId
        guide {
          email
          username
        }
        bookableTripId
        bookableTrip {
          id
          status
          startDate
          endDate
          trip {
            id
            startDate
            endDate
            name
          }
        }
      }
    }
  }
`
