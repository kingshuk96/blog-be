import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Swagger request-body example for the `createPost` GraphQL mutation.
 *
 * Actual wire call:
 *   POST /api/v1/graphql
 *   Authorization: Bearer <jwt>
 *   Content-Type: application/json
 *
 *   {
 *     "query": "mutation CreatePost($input: CreatePostInput!) { ... }",
 *     "variables": { "input": { "title": "My Post", "tags": ["tech"] } }
 *   }
 *
 * The authorId is resolved from the Bearer JWT — no authorId argument needed.
 * The post is created as a draft (isPublished: false) by default.
 */
export class CreatePostMutationDto {
  @ApiProperty({
    description:
      'GraphQL mutation — creates a new blog post for the authenticated user.',
    example:
      'mutation CreatePost($input: CreatePostInput!) {\n' +
      '  createPost(input: $input) {\n' +
      '    id\n' +
      '    title\n' +
      '    tags\n' +
      '    authorId\n' +
      '    isPublished\n' +
      '    isDeleted\n' +
      '    createdAt\n' +
      '    updatedAt\n' +
      '  }\n' +
      '}',
  })
  query: string;

  @ApiProperty({
    description:
      'Variables object — title is required, tags is optional (defaults to []).',
    example: {
      input: {
        title: 'My First Post',
        tags: ['tech', 'nestjs'],
      },
    },
    type: 'object',
    additionalProperties: true,
  })
  variables: { input: { title: string; tags?: string[] } };

  @ApiPropertyOptional({ example: 'CreatePost', nullable: true })
  operationName?: string | null;
}
