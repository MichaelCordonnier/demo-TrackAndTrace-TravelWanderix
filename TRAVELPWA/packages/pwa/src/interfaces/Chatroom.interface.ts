import type { BookableTrip } from './bookableTrip.interface'
import type { EmbeddedMessage } from './EmbeddedMessage.interface'
import type { User } from './user.interface'

export interface Chatroom {
  id: string
  name: string
  messages: EmbeddedMessage[] | null
  createdAt: Date
  bookableTripId?: string
  bookkableTrip: BookableTrip
  usersIds: string[]
  users: User[]
  status: string
  lastMessage?: EmbeddedMessage
}
