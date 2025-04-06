import type { User } from './user.interface'

export interface EmbeddedMessage {
  type?: string
  content: string
  createdAt?: Date
  userId: string
  user?: User
}
