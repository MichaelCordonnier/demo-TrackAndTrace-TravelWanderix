import { SetMetadata } from '@nestjs/common'
import { Role } from '../entities/user.entity'

export const ROLES_KEY = 'roles'

export const AllowedRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

// later kan je dan protected routes maken die enkel toegankelijk zijn voor bepaalde roles
// EXAMPLE:
// @AllowedRoles(Role.ADMIN, Role.USER)
// @UseGuards(FirebaseGuard, RolesGuard)
// @Query(() => [Bird], { name: 'birds' })
// getBirds() {
//   return this.birdsService.findAll()
