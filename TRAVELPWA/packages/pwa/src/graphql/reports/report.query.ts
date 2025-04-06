import gql from 'graphql-tag'

export const GET_BOOKABLES_BY_GUIDE_ID = gql`
  query UserByFirebaseUid($uid: String!) {
    userByFirebaseUid(uid: $uid) {
      assignedBookableTrips {
        id
        tripId
        status
        startDate
        endDate
        bookingIds
        assignedGuideId
        reports {
          id
          title
          date
          description
          guideId
          bookableTripId
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
        trip {
          name
          description
          bannerImageUrl
          headerImageUrl
        }
      }
    }
  }
`

export const CREATE_REPORT_MUTATION = gql`
  mutation CreateReport($createReportInput: CreateReportInput!) {
    createReport(createReportInput: $createReportInput) {
      title
      date
      description
      guideId
      bookableTripId
    }
  }
`

export const UPDATE_REPORT_MUTATION = gql`
  mutation UpdateReport($updateReportInput: UpdateReportInput!) {
    updateReport(updateReportInput: $updateReportInput) {
      id
      title
      date
      description
      guideId
      bookableTripId
    }
  }
`

export const DELETE_REPORT_MUTATION = gql`
  mutation RemoveReport($id: String!) {
    removeReport(id: $id)
  }
`
