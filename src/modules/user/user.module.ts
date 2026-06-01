import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

/**
 * UserModule groups all user-related pieces together.
 *
 * NestJS uses modules as the unit of organization:
 *   - providers   → services, resolvers — things NestJS creates & manages
 *   - controllers → REST controllers (we have none here, only a GraphQL resolver)
 *   - imports     → other modules this module depends on
 *   - exports     → providers that other modules can use
 *
 * WHY NO PrismaModule import here?
 *   PrismaModule is declared @Global() so it's already available
 *   everywhere in the app — no need to re-import.
 *
 * WHY NO AuthModule import here?
 *   GqlJwtAuthGuard uses Passport's AuthGuard('jwt') strategy.
 *   JwtStrategy is registered in AuthModule and because PassportModule
 *   is already bootstrapped, Passport can find the 'jwt' strategy globally.
 */
@Module({
  providers: [
    UserResolver, // registers the GraphQL queries defined in UserResolver
    UserService, // business logic — injected into UserResolver
  ],
})
export class UserModule {}
