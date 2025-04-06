import gql from 'graphql-tag'

export const GET_ALL_USERS = gql`
  query AllUsers {
    allUsers {
      id
      gender
      email
      username
      imageUrl
      uid
      locale
      role
      createdAt
      updatedAt
      bookingIds
      bookings {
        id
        startDate
        endDate
        activity {
          id
          bannerImageUrl
          headerImageUrl
          name
          duration
        }
        trip {
          id
          description
          bannerImageUrl
          headerImageUrl
          name
          startDate
          endDate
        }
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
      assignedBookableTripIds
      reportIds
      assignedBookableTrips {
        id
        tripId
        status
        startDate
        endDate
        bookingIds
        reportIds
        assignedGuideId
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
        }
      }
    }
  }
`
export const GET_ALL_GUIDES = gql`
  query AllGuides {
    allGuides {
      id
      gender
      email
      username
      imageUrl
      uid
      locale
      role
      createdAt
      updatedAt
      bookingIds
      reportIds
      assignedBookableTripIds
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      gender
      email
      uid
      username
      imageUrl
      locale
      role
      createdAt
      updatedAt
      bookingIds
    }
  }
`
