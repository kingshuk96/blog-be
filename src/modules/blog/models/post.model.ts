import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * PostModel — the GraphQL @ObjectType for a blog post.
 *
 * Only fields declared with @Field() are exposed to GraphQL clients.
 * Relations (author, content, images, comments, likes) are intentionally
 * omitted here — they can be added as nested resolvers later.
 */
@ObjectType({ description: 'Represents a blog post' })
export class PostModel {
  @Field(() => ID, { description: 'MongoDB ObjectId' })
  id: string;

  @Field(() => String, { description: 'Post title' })
  title: string;

  @Field(() => [String], { description: 'Tags associated with the post' })
  tags: string[];

  @Field(() => String, { description: "Author's MongoDB ObjectId" })
  authorId: string;

  @Field(() => Boolean, { description: 'Whether the post is published' })
  isPublished: boolean;

  @Field(() => Boolean, { description: 'Whether the post is soft-deleted' })
  isDeleted: boolean;

  @Field(() => Date, { description: 'When the post was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the post was last updated' })
  updatedAt: Date;
}
