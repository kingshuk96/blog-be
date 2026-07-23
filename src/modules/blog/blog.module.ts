import { Module } from '@nestjs/common';
import { BlogResolver } from './blog.resolver';
import { BlogService } from './blog.service';
import { BlogGraphqlController } from './blog-graphql.controller';

/**
 * BlogModule groups all post-related pieces together.
 *
 * Pattern mirrors UserModule:
 *   - providers   → BlogResolver (GraphQL) + BlogService (business logic)
 *   - controllers → BlogGraphqlController (Swagger documentation stub only)
 *
 * WHY NO PrismaModule import?
 *   PrismaModule is declared @Global() — available everywhere automatically.
 *
 * WHY NO AuthModule import?
 *   GqlJwtAuthGuard uses Passport's 'jwt' strategy registered in AuthModule.
 *   Because PassportModule is already bootstrapped globally, Passport can
 *   find the strategy without re-importing AuthModule here.
 */
@Module({
  controllers: [
    BlogGraphqlController, // Swagger documentation stub — not a real REST controller
  ],
  providers: [
    BlogResolver, // registers GraphQL mutations defined in BlogResolver
    BlogService, // business logic — injected into BlogResolver
  ],
})
export class BlogModule {}
