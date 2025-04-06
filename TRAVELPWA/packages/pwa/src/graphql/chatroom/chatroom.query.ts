import gql from 'graphql-tag'

export const NEW_CHATROOM_FOR_USER_MUTATION = gql`
  mutation newChatroomForUser($userId: String!) {
    newChatroomForUser(userId: $userId) {
      id
      name
      usersIds
      messages {
        type
        userId
        content
        createdAt
      }
      createdAt
      status
    }
  }
`

export const DELETE_CHATROOM_MUTATION = gql`
  mutation DeleteChatroomThatCannotBeAssignedToABookable($chatroomId: String!) {
    deleteChatroomThatCannotBeAssignedToABookable(chatroomId: $chatroomId)
  }
`

export const GET_ALL_CHATROOMS_BY_USER_ID_QUERY = gql`
  query GetAllChatroomsByUserId($userId: String!) {
    getAllChatroomsByUserId(userId: $userId) {
      id
      name
      usersIds
      messages {
        type
        userId
        content
        createdAt
      }
      createdAt
      status
    }
  }
`

export const GET_CHATROOM_BY_ID_QUERY = gql`
  query GetChatroomById($chatroomId: String!) {
    getChatroomById(chatroomId: $chatroomId) {
      id
      name
      usersIds
      messages {
        type
        userId
        content
        createdAt
      }
      createdAt
      status
    }
  }
`

export const LATEST_MESSAGE_SUBSCRIPTION = gql`
  subscription LatestMessage($chatroomId: String!) {
    latestMessage(chatroomId: $chatroomId) {
      type
      userId
      content
      createdAt
    }
  }
`

export const NEW_CHATROOM_SUBSCRIPTION = gql`
  subscription NewChatroom($userId: String!) {
    newChatroom(userId: $userId) {
      id
      name
      usersIds
      messages {
        type
        userId
        content
        createdAt
      }
      createdAt
      status
    }
  }
`

export const CHATROOM_DELETED_SUBSCRIPTION = gql`
  subscription ChatroomDeleted($userId: String!) {
    chatroomDeleted(userId: $userId)
  }
`
