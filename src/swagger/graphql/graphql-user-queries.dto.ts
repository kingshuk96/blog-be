import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ---------------------------------------------------------------------------
// getUsers
// ---------------------------------------------------------------------------

/**
 * Swagger request-body example for the `getUsers` GraphQL query.
 *
 * Actual wire call:
 *   POST /graphql
 *   Authorization: Bearer <jwt>
 *   Content-Type: application/json
 *
 *   {
 *     "query": "query GetUsers { getUsers { id uuid fName lName email role isActive createdAt lastLogin } }"
 *   }
 */
export class GetUsersQueryDto {
  @ApiProperty({
    description: 'GraphQL query — returns all active users.',
    example:
      'query GetUsers {\n  getUsers {\n    id\n    uuid\n    fName\n    lName\n    email\n    role\n    isActive\n    createdAt\n    lastLogin\n  }\n}',
  })
  query: string;

  @ApiPropertyOptional({
    description: 'No variables required for this query.',
    example: {},
    type: 'object',
    additionalProperties: true,
  })
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'GetUsers', nullable: true })
  operationName?: string | null;
}

// ---------------------------------------------------------------------------
// getUserById
// ---------------------------------------------------------------------------

/**
 * Swagger request-body example for the `getUserById` GraphQL query.
 *
 * Required variable: `$uuid` (String!)
 */
export class GetUserByIdQueryDto {
  @ApiProperty({
    description: 'GraphQL query — returns a single user by their public UUID.',
    example:
      'query GetUserById($uuid: String!) {\n  getUserById(uuid: $uuid) {\n    id\n    uuid\n    fName\n    lName\n    email\n    role\n    isActive\n    createdAt\n    lastLogin\n  }\n}',
  })
  query: string;

  @ApiProperty({
    description: 'Variables object — supply the target user UUID.',
    example: { uuid: '550e8400-e29b-41d4-a716-446655440000' },
    type: 'object',
    additionalProperties: true,
  })
  variables: { uuid: string };

  @ApiPropertyOptional({ example: 'GetUserById', nullable: true })
  operationName?: string | null;
}

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------

/**
 * Swagger request-body example for the `getProfile` GraphQL query.
 *
 * The user is identified from the Bearer JWT — no variables needed.
 */
export class GetProfileQueryDto {
  @ApiProperty({
    description:
      'GraphQL query — returns the profile of the currently authenticated user (identified from the JWT).',
    example:
      'query GetProfile {\n  getProfile {\n    id\n    uuid\n    fName\n    lName\n    email\n    role\n    isActive\n    createdAt\n    lastLogin\n  }\n}',
  })
  query: string;

  @ApiPropertyOptional({
    description: 'No variables required — identity comes from the JWT.',
    example: {},
    type: 'object',
    additionalProperties: true,
  })
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'GetProfile', nullable: true })
  operationName?: string | null;
}
