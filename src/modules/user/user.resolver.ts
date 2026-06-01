import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserModel } from './models/user.model';
import { UserService } from './user.service';
import { GqlJwtAuthGuard } from '../../guards/gql-jwt-auth.guard';

/**
 * UserResolver — the GraphQL equivalent of a REST Controller.
 *
 * HOW GRAPHQL RESOLVERS WORK:
 * ────────────────────────────
 * In REST:
 *   @Controller('users')   → base path
 *   @Get()                 → GET /users
 *   getUsers()             → calls service, returns JSON
 *
 * In GraphQL:
 *   @Resolver(() => UserModel)   → "this resolver handles UserModel fields"
 *   @Query(() => [UserModel])    → registers a query in the GraphQL schema
 *   getUsers()                   → calls service, returns array of UserModel
 *
 * The resolver does NOT define URLs.
 * Instead it maps operations (Query/Mutation) to service methods.
 *
 * @Resolver(() => UserModel) is required so NestJS knows which
 * ObjectType this resolver is "responsible for".
 */
@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * @Query(() => [UserModel]) registers this method as a GraphQL Query.
   *
   * () => [UserModel]  → the return type: an array of UserModel objects
   * name: 'getUsers'   → optional; defaults to the method name if omitted
   * description        → shows up in GraphQL Playground / schema introspection
   *
   * @UseGuards(GqlJwtAuthGuard) protects this query — the client must
   * send a valid Bearer JWT in the Authorization header.
   *
   * After this, a client can run:
   *   query {
   *     getUsers {
   *       id
   *       fName
   *       email
   *       role
   *     }
   *   }
   */
  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [UserModel], {
    name: 'getUsers',
    description: 'Returns all active users. Requires a valid JWT.',
  })
  getUsers() {
    return this.userService.getUsers();
  }
}
