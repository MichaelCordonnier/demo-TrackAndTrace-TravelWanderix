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
      equipmentProvided
      safetyMeasures
      name
      duration
      description
      recommended
      bookingSettings {
        max_participants
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
          equipmentProvided
          safetyMeasures
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
export const GET_ACTIVITY_BY_ID = gql`
  query Activity($id: String!) {
    activity(id: $id) {
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
      location {
        id
        name
      }
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
        name
        status
        description
        startDate
        endDate
        equipmentProvided
        safetyMeasures
        bookingIds
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

export const GET_ALL_ACTIVITIES = gql`
  query Activities {
    activities {
      id
      bannerImageUrl
      headerImageUrl
      ageGroup
      name
      duration
      description
      recommended
      equipmentProvided
      safetyMeasures
      createdAt
      updatedAt
      madeById
      locationId
      location {
        id
        name
      }
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
export const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($updateActivityInput: UpdateActivityInput!) {
    updateActivity(updateActivityInput: $updateActivityInput) {
      id
      bannerImageUrl
      headerImageUrl
      ageGroup
      name
      duration
      description
      recommended
      equipmentProvided
      safetyMeasures
      bookableActivitiesIds
      reviewsIds
      location {
        id
        name
        geolocation {
          coordinates
          type
        }
      }
      locationId
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
      }
      reviewList {
        id
        rating
        userId
        review
        createDate
      }
    }
  }
`

export const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($createActivityInput: CreateActivityInput!) {
    createActivity(createActivityInput: $createActivityInput) {
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
      location {
        id
        name
        geolocation {
          coordinates
          type
        }
      }
      bookingSettings {
        max_participants
        min_participants
        auto_cancel
        auto_cancel_days_before
        price
      }
      reviewsIds
      bookableActivitiesIds
    }
  }
`

export const CREATE_BOOKABLE_ACTIVITY_MUTATION = gql`
  mutation CreateBookableActivity(
    $createBookableActivityInput: CreateBookableActivityInput!
  ) {
    createBookableActivity(
      createBookableActivityInput: $createBookableActivityInput
    ) {
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

export const UPDATE_BOOKABLE_ACTIVITY_MUTATION = gql`
  mutation UpdateBookableActivity(
    $updateBookableActivityInput: UpdateBookableActivityInput!
  ) {
    updateBookableActivity(
      updateBookableActivityInput: $updateBookableActivityInput
    ) {
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

export const GET_BOOKABLE_ACTIVITY_BY_ID = gql`
  query BookableActivity($id: String!) {
    bookableActivity(id: $id) {
      id
      activityId
      activity {
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
        id
        reviewList {
          id
          rating
          userId
          review
          createDate
        }
      }
      recommended
      name
      status
      description
      startDate
      endDate
      equipmentProvided
      safetyMeasures
      bookingIds
      createdById
      roomId
      bookings {
        id
        how_many
        startDate
        endDate
        personId
        totalPrice
        user {
          email
          username
          imageUrl
        }
        parentBooking {
          id
        }
      }
    }
  }
`
