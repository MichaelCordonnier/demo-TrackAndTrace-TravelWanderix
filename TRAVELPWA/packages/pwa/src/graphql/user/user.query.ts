import gql from 'graphql-tag'

export const GET_OWN_USER_ACCOUNT = gql`
  query ownUseraccount {
    ownUseraccount {
      id
      gender
      email
      username
      imageUrl
      uid
      locale
      role
    }
  }
`

export const GET_USER_WITH_CHATROOMS = gql`
  query ownUseraccount {
    ownUseraccount {
      id
      gender
      email
      username
      imageUrl
      uid
      locale
      role
      chatrooms {
        id
        name
        createdAt
        bookableTripId
        usersIds
        status
        lastMessage {
          type
          content
          createdAt
          userId
        }
        users {
          id
          username
          imageUrl
          email
        }
      }
    }
  }
`

export const GET_ALL_USERS = gql`
  query AllUsers {
    allUsers {
      email
      uid
    }
  }
`

export const GET_ALL_BOOKINGS_BY_USER = gql`
  query UserByFirebaseUid($uid: String!) {
    userByFirebaseUid(uid: $uid) {
      id
      bookings {
        id
        bookableTripId
        type
        how_many
        startDate
        endDate
        personId
        totalPrice
        bookableTrip {
          status
        }
        trip {
          id
          description
          headerImageUrl
          name
          ageGroup
          startDate
          endDate
        }
      }
    }
  }
`

export const GET_ALL_BOOKABLE_IDS_BY_USER = gql`
  query UserByFirebaseUid($uid: String!) {
    userByFirebaseUid(uid: $uid) {
      id
      bookings {
        bookableTripId
      }
    }
  }
`
