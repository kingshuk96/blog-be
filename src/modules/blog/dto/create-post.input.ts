import { Field, InputType } from '@nestjs/graphql';

/**
 * CreatePostInput — the GraphQL @InputType for the createPost mutation.
 *
 * WHY @InputType AND NOT @ObjectType?
 * ─────────────────────────────────────
 * @ObjectType → used for output (what the API returns)
 * @InputType  → used for input (what the client sends in a mutation)
 *
 * Client call:
 *   mutation {
 *     createPost(input: { title: "My Post", tags: ["tech"] }) { id title }
 *   }
 *
 * EXCLUDED FIELDS (set automatically by the server):
 *   - authorId   → resolved from the Bearer JWT (current user's id)
 *   - isPublished → defaults to false — use a separate publishPost mutation
 *   - isDeleted   → defaults to false — internal/admin field
 *   - createdAt / updatedAt → managed by Prisma
 */
@InputType({ description: 'Fields required to create a new blog post' })
export class CreatePostInput {
  @Field(() => String, { description: 'Title of the post' })
  title: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Optional tags for the post',
    defaultValue: [],
  })
  tags?: string[];
}
