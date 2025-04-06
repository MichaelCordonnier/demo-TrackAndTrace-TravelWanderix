import gql from 'graphql-tag'

export const ACTIVITIES_BY_LOCATION_AND_DATE = gql`
  query ActivitiesByLocationAndDate(
    $location: LocationInput!
    $startDate: String!
    $endDate: String!
  ) {
    activitiesByLocationAndDate(
      location: $location
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      bannerImageUrl
      headerImageUrl
      ageGroup
      name
      duration
      recommended
      bookingSettings {
        max_participants
        min_participants
        auto_cancel
        auto_cancel_days_before
        price
      }
      bookableActivities {
        id
        activityId
        recommended
        name
        status
        description
        startDate
        endDate
        equipmentProvided
        safetyMeasures
        bookingIds
        activity {
          id
          bannerImageUrl
          headerImageUrl
          ageGroup
          name
          duration
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
  }
`
