import gql from 'graphql-tag'

export const GET_TRIPS_ADMIN = gql`
  query GetTrips {
    trips {
      id
      name
      bannerImageUrl
      headerImageUrl
    }
  }
`

export const GET_TRIP_BY_ID = gql`
  query GetTripById($id: String!) {
    trip(id: $id) {
      id
      description
      bannerImageUrl
      headerImageUrl
      ageGroup
      name
      startDate
      endDate
      bookingSettings {
        max_participants
        min_participants
        auto_cancel
        auto_cancel_days_before
        price
      }
      reviews {
        id
        review
        rating
        userId
        createDate
      }

      bookableTrips {
        id
        status
        startDate
        endDate
        assignedGuideId
        assignedGuide {
          username
        }
        bookableSettings {
          places
          autocancel
          autocancel_on
          min_persons_required
          max_persons
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
    }
  }
`

export const CREATE_BOOKABLE_TRIP_MUTATION = gql`
  mutation CreateBookableTrip(
    $createBookableTripInput: CreateBookableTripInput!
  ) {
    createBookableTrip(createBookableTripInput: $createBookableTripInput) {
      id
      tripId
      assignedGuideId
      status
      startDate
      endDate
      bookingIds
      reportIds
      assignedGuide {
        username
      }
      bookableSettings {
        places
        autocancel
        autocancel_on
        min_persons_required
        max_persons
        price
      }
    }
  }
`
export const UPDATE_BOOKABLE_TRIP_MUTATION = gql`
  mutation UpdateBookableTrip(
    $updateBookableTripInput: UpdateBookableTripInput!
  ) {
    updateBookableTrip(updateBookableTripInput: $updateBookableTripInput) {
      id
      status
      startDate
      endDate
      assignedGuideId
      assignedGuide {
        username
      }
      bookableSettings {
        places
        autocancel
        autocancel_on
        min_persons_required
        max_persons
        price
      }
    }
  }
`
