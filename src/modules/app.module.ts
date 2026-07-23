import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HealthController } from '../health.controller';
import { dbConfig } from '../config/db.config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    MongooseModule.forRootAsync(dbConfig), // existing Mongoose connection
    PrismaModule, // global Prisma client
    AuthModule, // POST /auth/signup, /auth/login, etc.

    /**
     * GraphQLModule.forRoot() initialises the GraphQL engine.
     *
     * driver: ApolloDriver
     *   → We use Apollo Server as the underlying GraphQL engine.
     *   → NestJS supports Apollo and Mercurius; Apollo is the most common.
     *
     * autoSchemaFile: join(process.cwd(), 'src/schema.gql')
     *   → CODE-FIRST approach: NestJS generates the GraphQL schema (.gql file)
     *     automatically from your @ObjectType() / @Query() / @Mutation() decorators.
     *   → The file is written to src/schema.gql every time the app starts.
     *   → Alternative is SCHEMA-FIRST: you write the .gql file by hand and NestJS
     *     generates TypeScript types from it. Code-first is simpler for TypeScript projects.
     *
     * sortSchema: true
     *   → Sorts fields alphabetically in the generated schema — easier to read.
     *
     * playground: true
     *   → Enables GraphQL Playground at /graphql — a browser IDE to test queries.
     *   → You can turn this off in production.
     */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      path: 'api/v1/graphql',
    }),

    UserModule, // getUsers, getUser, me, updateUser, deactivateUser
    BlogModule, // createPost
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
