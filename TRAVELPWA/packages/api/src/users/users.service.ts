import { Injectable } from '@nestjs/common'
import { CreateUserInput } from './dto/create-user.input'
import { Role, User } from './entities/user.entity'
import { MongoRepository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ObjectId } from 'mongodb'
import { UpdateUserInput } from './dto/update-user.input'
import * as admin from 'firebase-admin'

// go to firebase emulator suite
// http://127.0.0.1:4000/auth

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    // If the user already exists, throw an error
    if (await this.findOneByFirebaseUid(createUserInput.uid)) {
      throw new Error(
        'User not authorized to create this user. A Firebase user is already connected to an account.',
      )
    }

    const newCustomUser = new User()
    if (createUserInput.locale) {
      newCustomUser.locale = createUserInput.locale
    }

    if (createUserInput.gender) {
      newCustomUser.gender = createUserInput.gender
    }

    newCustomUser.email = createUserInput.email

    newCustomUser.role = Role.USER // This is a security feature. We only allow users to create users with the role "user"
    newCustomUser.uid = createUserInput.uid // Firebase UID is saved in the user entity
    return this.userRepository.save(newCustomUser)
  }

  async createSeedingVariant(createUserInput: CreateUserInput) {
    // If the user already exists, throw an error
    if (await this.findOneByFirebaseUid(createUserInput.uid)) {
      throw new Error(
        'User not authorized to create this user. A Firebase user is already connected to an account.',
      )
    }

    // check if user is already in firebase auth if not add it to firebase auth NASTY
    try {
      await admin.auth().getUser(createUserInput.uid)
    } catch {
      await admin.auth().createUser({
        uid: createUserInput.uid,
        email: createUserInput.email,
      })
    }

    const newCustomUser = new User()
    if (createUserInput.locale) {
      newCustomUser.locale = createUserInput.locale
    }

    if (createUserInput.gender) {
      newCustomUser.gender = createUserInput.gender
    }

    newCustomUser.email = createUserInput.email

    newCustomUser.role = Role.USER // This is a security feature. We only allow users to create users with the role "user"
    newCustomUser.uid = createUserInput.uid // Firebase UID is saved in the user entity
    return await this.userRepository.save(newCustomUser)
  }

  async createAdmin(createUserInput: CreateUserInput) {
    // If the user already exists, throw an error
    if (await this.findOneByFirebaseUid(createUserInput.uid)) {
      throw new Error(
        'User not authorized to create this user. A Firebase user is already connected to an account.',
      )
    }

    // check if user is already in firebase auth if not add it to firebase auth NASTY
    // this is for seeding/emulate purpose
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      await admin.auth().createUser({
        uid: createUserInput.uid,
        email: createUserInput.email,
        password: 'testing123',
      })
    }

    const newCustomUser = new User()
    if (createUserInput.locale) {
      newCustomUser.locale = createUserInput.locale
    }

    if (createUserInput.gender) {
      newCustomUser.gender = createUserInput.gender
    }

    newCustomUser.email = createUserInput.email

    newCustomUser.role = createUserInput.role // This is a security feature. We only allow users to create users with the role "admin" THIS SERVICE can never be reused again only for seeding purpose!

    newCustomUser.uid = createUserInput.uid // Firebase UID is saved in the user entity

    return this.userRepository.save(newCustomUser)
  }

  findOneByFirebaseUid(uid: string) {
    return this.userRepository.findOneBy({ where: { uid: uid } })
  }

  async findOneById(id: string) {
    const objId = new ObjectId(id)
    return this.userRepository.findOneBy({ _id: objId })
  }

  async findOneByIdAlsoResolveFirebase(id: string) {
    const user = await this.findOneById(id)
    if (!user) {
      return null
    }
    console.log('user', user)

    const fireBaseUser = await admin.auth().getUser(user.uid)

    user.username = fireBaseUser.displayName
    user.imageUrl = fireBaseUser.photoURL
    return user
  }

  async findMultipleByIds(ids: string[]) {
    const objIds = ids.map(id => new ObjectId(id))
    const users = await this.userRepository.find({ _id: { $in: objIds } })
    return users.filter(user => user !== null && user !== undefined)
  }
  async updateLocale(uid: string, locale: string) {
    const user = await this.userRepository.findOneBy({
      where: { uid: uid },
    })
    if (!user) {
      throw new Error('User not found')
    }

    if (locale) {
      user.locale = locale
    }

    return this.userRepository.save(user)
  }

  async findById(id: string) {
    const objId = new ObjectId(id)
    //('objId', objId)
    return this.userRepository.findOneBy({ _id: objId })
  }

  async updateUser(updateUserInput: UpdateUserInput) {
    // first get the user from fireauth

    // console.log('#94 User.Service updateUserInput', updateUserInput)

    const fireAuthUser = await admin.auth().getUser(updateUserInput.uid)

    // console.log('#100 Proceeding... ')
    // now compare the imageurl from the user and the one from firebase
    if (
      updateUserInput.imageUrl &&
      fireAuthUser.photoURL !== updateUserInput.imageUrl
    ) {
      //  if it is different update the firebase user
      await admin.auth().updateUser(fireAuthUser.uid, {
        photoURL: updateUserInput.imageUrl,
      })
    }

    // now compare the username from the user and the one from firebase
    if (
      updateUserInput.username &&
      fireAuthUser.displayName !== updateUserInput.username
    ) {
      //  if it is different update the firebase user
      await admin.auth().updateUser(fireAuthUser.uid, {
        displayName: updateUserInput.username,
      })
    }

    // remove the field imageUrl and username from the updateUserInput we dont save this in the db
    delete updateUserInput.imageUrl
    delete updateUserInput.username

    console.log('#172 Proceeding... ')
    console.log('#173 updateUserInput', updateUserInput)
    // update the user in the db

    // const existingUser = await this.findById(updateUserInput.id)
    // if (!existingUser) {
    //   throw new Error(`User with id ${updateUserInput.id} not found`)
    // }
    // // Merge the existing user data with the new data

    // console.log('#174 User.service.ts existingUser:', existingUser)
    // console.log('#175 User.service.ts updateUserInput:', updateUserInput)

    // const updatedUserData = { ...existingUser, ...updateUserInput }

    await this.userRepository.update(updateUserInput.id, updateUserInput)

    console.log('#178 proceeding....')
    const res = await this.findById(updateUserInput.id)

    console.log('#181 res:', res)
    return res
  }

  async findAllGuides() {
    return this.userRepository.find({ role: Role.GUIDE })
  }

  async getAllFireBaseUsers() {
    const listUsers = await admin.auth().listUsers()
    return listUsers.users
  }

  async deleteFireBaseUser(uid: string) {
    await admin.auth().deleteUser(uid)
  }

  // get all users with their mail and uid
  async findAll() {
    return this.userRepository.find()
  }

  async addBookingToUser(fireBaseId: string, bookingId: string) {
    const user = await this.findOneByFirebaseUid(fireBaseId)
    if (!user) {
      throw new Error('User not found')
    }

    // first check if array is initialized
    if (!user.bookingIds) {
      user.bookingIds = []
    }

    user.bookingIds.push(bookingId)
    return this.userRepository.update(user.id, user)
  }

  async removeBookingFromUser(userId: string, bookingId: string) {
    const user = await this.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    user.bookingIds = user.bookingIds.filter(id => id !== bookingId)
    return this.userRepository.update(user.id, user)
  }
}
