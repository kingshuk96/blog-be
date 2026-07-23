import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostInput } from './dto/create-post.input';

/**
 * BlogService contains all Post-related business logic.
 *
 * @Injectable() makes it available for NestJS Dependency Injection (DI).
 * NestJS will automatically create one instance and inject it wherever needed.
 *
 * PrismaModule is @Global() so we don't need to import it again in BlogModule.
 */
@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new blog post owned by the authenticated user.
   *
   * WHY do we look up the user first?
   *   The JWT payload carries `uuid` (not the MongoDB ObjectId).
   *   Prisma's relation `author: { connect: { id } }` needs the ObjectId.
   *   So we resolve uuid → id here before creating the post.
   *
   * @param uuid  - The user's public UUID (resolved from the Bearer JWT).
   * @param input - The title and optional tags from the client.
   * @returns     The newly created Post document.
   */
  async createPost(uuid: string, input: CreatePostInput) {
    // Resolve the user's MongoDB ObjectId from their public UUID
    const author = await this.prisma.users.findUnique({ where: { uuid } });
    if (!author) {
      throw new UnauthorizedException('User not found');
    }

    return this.prisma.post.create({
      data: {
        title: input.title,
        tags: input.tags ?? [],
        author: { connect: { id: author.id } },
      },
    });
  }
}
