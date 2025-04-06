import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  split,
  ApolloLink,
} from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import useFirebase from './useFirebase'
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

const { firebaseUser } = useFirebase()
// Set this to false to disable logging for debugging
const debugMode = true

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_BACKEND_URL}/graphql`,
  credentials: 'same-origin',
})

const authLink = setContext(async (_, { headers }) => {
  const token = await firebaseUser.value?.getIdToken()
  //console.log('Token sent to server:', token) // Confirm token in headers
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3000/graphql',
    connectionParams: async () => {
      const token = await firebaseUser.value?.getIdToken()
      //console.log('Token:', token) // Add logging to confirm the token
      return {
        Authorization: token ? `Bearer ${token}` : '',
      }
    },
  }),
)

const errorLink = onError(error => {
  if (import.meta.env.DEV) logErrorMessages(error)
})

// Logging middleware
const loggingLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    console.log(`GraphQL Request: ${operation.operationName}`, {
      variables: operation.variables,
      response,
    })
    return response
  })
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  from(
    debugMode
      ? [authLink, errorLink, loggingLink, httpLink]
      : [authLink, errorLink, httpLink],
  ),
)

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
})

export default () => {
  return {
    apolloClient,
  }
}
