import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserModel } from './models/user.model';
import { UserService } from './user.service';
import { GqlJwtAuthGuard } from '../../guards/gql-jwt-auth.guard';
import { UpdateUserInput } from './dto/update-user.input';

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

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => UserModel, {
    name: 'getUserById',
    nullable: true,
    description:
      'Returns the profile of the user with the given ID. Requires a valid JWT.',
  })
  getUserById(@Args('uuid', { type: () => String }) uuid: string) {
    return this.userService.getUserById(uuid);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => UserModel, {
    name: 'getProfile',
    nullable: true,
    description:
      'Returns the profile of the logged-in user. Requires a valid JWT.',
  })
  getProfile(@Context() context: { req: { user: { userId: string } } }) {
    const userId = context.req.user.userId;
    return this.userService.getCurrentUser(userId);
  }

  /**
   * @Mutation registers this method as a GraphQL Mutation.
   *
   * A Mutation is used for write operations (create / update / delete),
   * just like POST/PUT/PATCH/DELETE in REST.
   *
   * SELF-UPDATE PATTERN:
   * The caller's UUID is extracted from the JWT context — NOT from the
   * mutation arguments. This guarantees a user can only ever update
   * their own profile, even if they try to pass a different uuid.
   *
   * Example client call:
   *   mutation {
   *     updateUser(input: { fName: "Jane", lName: "Smith" }) {
   *       uuid
   *       fName
   *       lName
   *     }
   *   }
   */
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => UserModel, {
    name: 'updateUser',
    description:
      'Updates the profile of the currently authenticated user (fName, lName). ' +
      'The user is identified from the Bearer JWT — you cannot update another user. ' +
      'Requires a valid JWT.',
  })
  updateUser(
    @Args('input') input: UpdateUserInput,
    @Context() context: { req: { user: { userId: string } } }
  ) {
    const userId = context.req.user.userId;
    return this.userService.updateUser(userId, input);
  }
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => UserModel, {
    name: 'deactivateUser',
    description:
      'Deactivates the account of the currently authenticated user. ' +
      'The user is identified from the Bearer JWT — no UUID argument needed. ' +
      'Requires a valid JWT.',
  })
  deactivateUser(@Context() context: { req: { user: { userId: string } } }) {
    const userId = context.req.user.userId;
    return this.userService.deactivateUser(userId);
  }
}
