import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePostMutationDto } from '../../swagger/graphql/graphql-blog-mutations.dto';

/**
 * BlogGraphqlController — Swagger documentation shim for GraphQL blog mutations.
 *
 * ⚠️  THIS CONTROLLER EXISTS PURELY FOR API DOCUMENTATION.
 *
 * All real GraphQL requests must be sent to:
 *   POST /api/v1/graphql
 * with a JSON body of the form: { query, variables?, operationName? }
 *
 * The "Try it out" feature in Swagger UI will NOT work against these paths.
 * To test live, copy the example body and send it to POST /api/v1/graphql.
 */
@ApiTags('GraphQL — Blog')
@ApiBearerAuth('JWT')
@Controller('graphql-docs/blog')
export class BlogGraphqlController {
  // ─── createPost ────────────────────────────────────────────────────────────

  /**
   * Documentation stub for the `createPost` GraphQL mutation.
   *
   * Real call:  POST /graphql  { "query": "mutation CreatePost(...) { ... }", "variables": { ... } }
   * The author is resolved from the Bearer JWT — no authorId argument needed.
   */
  @Post('create-post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'createPost — Create a new blog post',
    description:
      '**GraphQL operation: `createPost`**\n\n' +
      'Creates a new blog post owned by the currently authenticated user. ' +
      'The author is resolved from the Bearer JWT — the client only provides title and tags. ' +
      'The post is created as a draft (`isPublished: false`) by default.\n\n' +
      '**⚠️ Documentation only** — send the request body shown below to `POST /graphql`, ' +
      'not to this path.\n\n' +
      '```graphql\n' +
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
      '}\n' +
      '```\n\n' +
      '**Variables:** `{ "input": { "title": "My Post", "tags": ["tech"] } }` — tags optional.\n\n' +
      '**Required:** `Authorization: Bearer <jwt>` header.',
  })
  @ApiBody({ type: CreatePostMutationDto })
  @ApiResponse({
    status: 200,
    description: 'The newly created PostModel (draft, isPublished: false).',
    schema: {
      example: {
        data: {
          createPost: {
            id: '507f1f77bcf86cd799439012',
            title: 'My First Post',
            tags: ['tech', 'nestjs'],
            authorId: '507f1f77bcf86cd799439011',
            isPublished: false,
            isDeleted: false,
            createdAt: '2024-06-01T10:00:00.000Z',
            updatedAt: '2024-06-01T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
  createPost(): void {
    // Documentation stub — no implementation.
  }
}
