import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostModel } from './models/post.model';
import { BlogService } from './blog.service';
import { GqlJwtAuthGuard } from '../../guards/gql-jwt-auth.guard';
import { CreatePostInput } from './dto/create-post.input';

/**
 * BlogResolver — the GraphQL resolver for Post operations.
 *
 * @Resolver(() => PostModel) tells NestJS this resolver handles PostModel.
 *
 * Pattern matches UserResolver:
 *   - @UseGuards(GqlJwtAuthGuard) protects every operation with a valid JWT
 *   - authorId is extracted from context.req.user.userId (the JWT payload)
 *     so the client cannot fake authorship
 */
@Resolver(() => PostModel)
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}

  /**
   * createPost mutation — creates a new blog post for the authenticated user.
   *
   * The author is resolved from the Bearer JWT — the client only provides
   * the post content (title, tags). This prevents one user from creating
   * posts on behalf of another.
   *
   * Example client call:
   *   mutation CreatePost($input: CreatePostInput!) {
   *     createPost(input: $input) {
   *       id
   *       title
   *       tags
   *       isPublished
   *       createdAt
   *     }
   *   }
   *
   * Variables:
   *   { "input": { "title": "My First Post", "tags": ["tech", "nestjs"] } }
   */
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PostModel, {
    name: 'createPost',
    description:
      'Creates a new blog post for the currently authenticated user. ' +
      'The author is resolved from the Bearer JWT — no authorId argument needed. ' +
      'The post is created as a draft (isPublished: false) by default. ' +
      'Requires a valid JWT.',
  })
  createPost(
    @Args('input') input: CreatePostInput,
    @Context() context: { req: { user: { userId: string } } }
  ) {
    const authorId = context.req.user.userId;
    return this.blogService.createPost(authorId, input);
  }
}
