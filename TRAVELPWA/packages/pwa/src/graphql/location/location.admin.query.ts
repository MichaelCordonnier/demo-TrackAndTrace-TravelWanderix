import gql from 'graphql-tag'

export const ALL_LOCATIONS_QUERY = gql`
  query AllLocations {
    allLocations {
      id
      name
      geolocation {
        coordinates
        type
      }
    }
  }
`

export const CREATE_LOCATION_MUTATION = gql`
  mutation CreateLocation($createLocationInput: CreateLocationInput!) {
    createLocation(createLocationInput: $createLocationInput) {
      id
      name
      geolocation {
        coordinates
        type
      }
    }
  }
`
