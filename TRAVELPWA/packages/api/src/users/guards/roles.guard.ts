import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UsersService } from '../users.service'
import { Role } from '../entities/user.entity'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      console.log('no AllowedRoles() decorator found, so no roles required')
      //if you want to allow access to everyone if the decorator  MyRoles() is not set, you can RETURN TRUE here instead of throwing an error
      //however, I think it's better to throw an error, because it forces you to think about the roles
      throw new Error('no AllowedRoles() decorator found, so no roles required')
    }

    const ctx = GqlExecutionContext.create(context)
    const { user } = ctx.getContext().req
    console.log('🚪 checking the role of the user')
    console.log('🙋‍♂️user', user)
    const { role } = await this.usersService.findOneByFirebaseUid(user.uid)
    console.log(
      'This request requires one of the following roles: ',
      requiredRoles,
    )
    console.log('🚪 The role of this user is ', role)
    console.log(
      'Is the role of the user sufficient for this request',
      requiredRoles.includes(role),
    )
    return requiredRoles.includes(role)
  }
}
