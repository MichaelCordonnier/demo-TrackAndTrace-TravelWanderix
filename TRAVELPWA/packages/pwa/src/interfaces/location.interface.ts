import type { Point } from 'geojson'

export interface Location {
  id: string
  name?: string
  geolocation?: Point
}

export interface CreateLocationInput {
  name?: string
  geolocation?: Point
}
