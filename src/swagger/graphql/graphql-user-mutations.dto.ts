import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Swagger request-body example for the `updateUser` GraphQL mutation.
 *
 * Actual wire call:
 *   POST /api/v1/graphql
 *   Authorization: Bearer <jwt>
 *   Content-Type: application/json
 *
 *   {
 *     "query": "mutation UpdateUser($input: UpdateUserInput!) { ... }",
 *     "variables": { "input": { "fName": "Jane" } }
 *   }
 *
 * The user UUID is resolved from the Bearer JWT — no uuid argument needed.
 * Only the fields you want to change need to be included in `input`.
 */
export class UpdateUserMutationDto {
  @ApiProperty({
    description:
      'GraphQL mutation — updates the profile of the authenticated user.',
    example:
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
      '}',
  })
  query: string;

  @ApiProperty({
    description:
      'Variables object — include only the fields you want to update. All fields are optional.',
    example: {
      input: {
        fName: 'Jane',
        lName: 'Smith',
      },
    },
    type: 'object',
    additionalProperties: true,
  })
  variables: { input: { fName?: string; lName?: string } };

  @ApiPropertyOptional({ example: 'UpdateUser', nullable: true })
  operationName?: string | null;
}

/**
 * Swagger request-body example for the `deactivateUser` GraphQL mutation.
 *
 * Actual wire call:
 *   POST /api/v1/graphql
 *   Authorization: Bearer <jwt>
 *   Content-Type: application/json
 *
 *   {
 *     "query": "mutation DeactivateUser { deactivateUser { ... } }",
 *     "operationName": "DeactivateUser"
 *   }
 *
 * The user UUID is resolved from the Bearer JWT — no uuid argument needed.
 * IMPORTANT: The name in `operationName` MUST match the name in the `query` string.
 */
export class DeactivateUserMutationDto {
  @ApiProperty({
    description:
      'GraphQL mutation — deactivates the account of the currently authenticated user. ' +
      'Identity comes from the Bearer JWT — no UUID argument needed.',
    example:
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
      '}',
  })
  query: string;

  @ApiPropertyOptional({ example: 'DeactivateUser', nullable: true })
  operationName?: string | null;
}
