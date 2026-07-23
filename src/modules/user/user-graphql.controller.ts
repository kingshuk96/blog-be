import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetProfileQueryDto,
  GetUserByIdQueryDto,
  GetUsersQueryDto,
} from '../../swagger/graphql/graphql-user-queries.dto';
import {
  DeactivateUserMutationDto,
  UpdateUserMutationDto,
} from '../../swagger/graphql/graphql-user-mutations.dto';

/**
 * UserGraphqlController — Swagger documentation shim for GraphQL user queries.
 *
 * ⚠️  THIS CONTROLLER EXISTS PURELY FOR API DOCUMENTATION.
 *
 * GraphQL does not use REST routes. All real GraphQL requests must be sent to:
 *   POST /graphql
 * with a JSON body of the form: { query, variables?, operationName? }
 *
 * Because the Swagger UI can only document HTTP endpoints, this controller
 * registers three "virtual" POST routes — one per GraphQL operation — so that
 * consumers can discover the exact query strings, variable shapes, and
 * authentication requirements directly from Swagger.
 *
 * The "Try it out" feature in Swagger UI will NOT work against these paths
 * because they are stubs. To test live, copy the example body and send it to:
 *   POST /graphql
 *
 * This pattern is used by major GraphQL-over-HTTP APIs (e.g. GitHub) to bridge
 * the gap between GraphQL introspection and REST-style API documentation portals.
 */
@ApiTags('GraphQL — Users')
@ApiBearerAuth('JWT')
@Controller('graphql-docs/users')
export class UserGraphqlController {
  // ─── getUsers ─────────────────────────────────────────────────────────────

  /**
   * Documentation stub for the `getUsers` GraphQL query.
   *
   * Real call:  POST /graphql  { "query": "query GetUsers { getUsers { ... } }" }
   */
  @Post('get-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'getUsers — Fetch all active users',
    description:
      '**GraphQL operation: `getUsers`**\n\n' +
      'Returns a list of all active users in the system.\n\n' +
      '**⚠️ Documentation only** — send the request body shown below to `POST /graphql`, ' +
      'not to this path.\n\n' +
      '```graphql\n' +
      'query GetUsers {\n' +
      '  getUsers {\n' +
      '    id\n' +
      '    uuid\n' +
      '    fName\n' +
      '    lName\n' +
      '    email\n' +
      '    role\n' +
      '    isActive\n' +
      '    createdAt\n' +
      '    lastLogin\n' +
      '  }\n' +
      '}\n' +
      '```\n\n' +
      '**Required:** `Authorization: Bearer <jwt>` header.',
  })
  @ApiBody({ type: GetUsersQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Array of UserModel objects.',
    schema: {
      example: {
        data: {
          getUsers: [
            {
              id: '507f1f77bcf86cd799439011',
              uuid: '550e8400-e29b-41d4-a716-446655440000',
              fName: 'Kingshuk',
              lName: 'Sahu',
              email: 'king@gmail.com',
              role: 'user',
              isActive: true,
              createdAt: '2024-01-15T08:30:00.000Z',
              lastLogin: '2024-06-01T12:00:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  getUsers(): void {
    // Documentation stub — no implementation.
  }

  // ─── getUserById ───────────────────────────────────────────────────────────

  /**
   * Documentation stub for the `getUserById` GraphQL query.
   *
   * Real call:  POST /graphql  { "query": "...", "variables": { "uuid": "..." } }
   */
  @Post('get-user-by-id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'getUserById — Fetch a user by UUID',
    description:
      '**GraphQL operation: `getUserById`**\n\n' +
      'Returns the profile of the user identified by the supplied `uuid`.\n\n' +
      '**⚠️ Documentation only** — send the request body shown below to `POST /graphql`, ' +
      'not to this path.\n\n' +
      '```graphql\n' +
      'query GetUserById($uuid: String!) {\n' +
      '  getUserById(uuid: $uuid) {\n' +
      '    id\n' +
      '    uuid\n' +
      '    fName\n' +
      '    lName\n' +
      '    email\n' +
      '    role\n' +
      '    isActive\n' +
      '    createdAt\n' +
      '    lastLogin\n' +
      '  }\n' +
      '}\n' +
      '```\n\n' +
      '**Variables:** `{ "uuid": "<target-user-uuid>" }`\n\n' +
      '**Required:** `Authorization: Bearer <jwt>` header.',
  })
  @ApiBody({ type: GetUserByIdQueryDto })
  @ApiResponse({
    status: 200,
    description: 'UserModel object, or `null` if not found.',
    schema: {
      example: {
        data: {
          getUserById: {
            id: '507f1f77bcf86cd799439011',
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            fName: 'Kingshuk',
            lName: 'Sahu',
            email: 'king@gmail.com',
            role: 'user',
            isActive: true,
            createdAt: '2024-01-15T08:30:00.000Z',
            lastLogin: '2024-06-01T12:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  getUserById(): void {
    // Documentation stub — no implementation.
  }

  // ─── getProfile ────────────────────────────────────────────────────────────

  /**
   * Documentation stub for the `getProfile` GraphQL query.
   *
   * Real call:  POST /graphql  { "query": "query GetProfile { getProfile { ... } }" }
   * Identity is resolved from the Bearer JWT — no variables needed.
   */
  @Post('get-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "getProfile — Fetch the authenticated user's profile",
    description:
      '**GraphQL operation: `getProfile`**\n\n' +
      'Returns the profile of the currently authenticated user. ' +
      'Identity is resolved from the Bearer JWT — no input variables are needed.\n\n' +
      '**⚠️ Documentation only** — send the request body shown below to `POST /graphql`, ' +
      'not to this path.\n\n' +
      '```graphql\n' +
      'query GetProfile {\n' +
      '  getProfile {\n' +
      '    id\n' +
      '    uuid\n' +
      '    fName\n' +
      '    lName\n' +
      '    email\n' +
      '    role\n' +
      '    isActive\n' +
      '    createdAt\n' +
      '    lastLogin\n' +
      '  }\n' +
      '}\n' +
      '```\n\n' +
      '**Required:** `Authorization: Bearer <jwt>` header.',
  })
  @ApiBody({ type: GetProfileQueryDto })
  @ApiResponse({
    status: 200,
    description: 'UserModel object of the authenticated user, or `null`.',
    schema: {
      example: {
        data: {
          getProfile: {
            id: '507f1f77bcf86cd799439011',
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            fName: 'Kingshuk',
            lName: 'Sahu',
            email: 'king@gmail.com',
            role: 'admin',
            isActive: true,
            createdAt: '2024-01-15T08:30:00.000Z',
            lastLogin: '2024-06-03T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  getProfile(): void {
    // Documentation stub — no implementation.
  }

  // ─── updateUser ────────────────────────────────────────────────────────────

  /**
   * Documentation stub for the `updateUser` GraphQL mutation.
   *
   * Real call:  POST /graphql  { "query": "mutation UpdateUser(...) { ... }", "variables": { ... } }
   * Identity (uuid) is resolved from the Bearer JWT — no uuid argument needed.
   */
  @Post('update-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "updateUser — Update the authenticated user's profile",
    description:
      '**GraphQL operation: `updateUser`**\n\n' +
      'Updates `fName` and/or `lName` of the currently authenticated user. ' +
      'The user UUID is taken from the Bearer JWT — you cannot update another user.\n\n' +
      '**⚠️ Documentation only** — send the request body shown below to `POST /graphql`, ' +
      'not to this path.\n\n' +
      '```graphql\n' +
      'mutation UpdateUser($input: UpdateUserInput!) {\n' +
      '  updateUser(input: $input) {\n' +
      '    id\n' +
      '    uuid\n' +
      '    fName\n' +
      '    lName\n' +
      '    email\n' +
      '    role\n' +
      '    isActive\n' +
      '    createdAt\n' +
      '    lastLogin\n' +
      '  }\n' +
      '}\n' +
      '```\n\n' +
      '**Variables:** `{ "input": { "fName": "Kingshuk", "lName": "Smith" } }` — all fields optional.\n\n' +
      '**Required:** `Authorization: Bearer <jwt>` header.',
  })
  @ApiBody({ type: UpdateUserMutationDto })
  @ApiResponse({
    status: 200,
    description: 'Updated UserModel of the authenticated user.',
    schema: {
      example: {
        data: {
          updateUser: {
            id: '507f1f77bcf86cd799439011',
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            fName: 'Kingshuk',
            lName: 'Smith',
            email: 'king@gmail.com',
            role: 'user',
            isActive: true,
            createdAt: '2024-01-15T08:30:00.000Z',
            lastLogin: '2024-06-03T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  @ApiResponse({
    status: 404,
    description: 'User not found (account was deleted).',
  })
  updateUser(): void {
    // Documentation stub — no implementation.
  }

  // ─── deactivateUser ────────────────────────────────────────────────────────

  /**
   * Documentation stub for the `deactivateUser` GraphQL mutation.
   *
   * Real call:  POST /graphql  { "query": "mutation DeactivateUser { deactivateUser { ... } }" }
   * Identity (uuid) is resolved from the Bearer JWT — no arguments needed.
   */
  @Post('deactivate-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "deactivateUser — Deactivate the authenticated user's account",
    description:
      '**GraphQL operation: `deactivateUser`**\n\n' +
      'Sets `isActive: false` on the currently authenticated user. ' +
      'The user UUID is taken from the Bearer JWT — no argument is needed.\n\n' +
      '**⚠️ Documentation only** — send the request body shown below to `POST /graphql`, ' +
      'not to this path.\n\n' +
      '```graphql\n' +
      'mutation DeactivateUser {\n' +
      '  deactivateUser {\n' +
      '    id\n' +
      '    uuid\n' +
      '    fName\n' +
      '    lName\n' +
      '    email\n' +
      '    role\n' +
      '    isActive\n' +
      '  }\n' +
      '}\n' +
      '```\n\n' +
      '**Required:** `Authorization: Bearer <jwt>` header.',
  })
  @ApiBody({ type: DeactivateUserMutationDto })
  @ApiResponse({
    status: 200,
    description: 'The deactivated UserModel (isActive will be false).',
    schema: {
      example: {
        data: {
          deactivateUser: {
            id: '507f1f77bcf86cd799439011',
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            fName: 'Kingshuk',
            lName: 'Sahu',
            email: 'king@gmail.com',
            role: 'user',
            isActive: false,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  deactivateUser(): void {
    // Documentation stub — no implementation.
  }
}
