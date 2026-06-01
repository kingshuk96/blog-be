import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * GqlJwtAuthGuard — JWT guard adapted for GraphQL.
 *
 * WHY DO WE NEED A SEPARATE GUARD FOR GRAPHQL?
 * ─────────────────────────────────────────────
 * In REST (HTTP), Passport extracts the request from Express's `req` object.
 * In GraphQL, the request is nested inside the GraphQL execution context.
 *
 * The default JwtAuthGuard (which extends AuthGuard('jwt')) looks for:
 *   context.switchToHttp().getRequest()
 *
 * But in GraphQL, there is no HTTP context — instead there's a GQL context.
 * So we override `getRequest()` to pull the request from the GQL context instead.
 *
 * HOW IT WORKS:
 *   1. NestJS calls canActivate() → which calls Passport's authenticate()
 *   2. Passport calls getRequest() to get the raw HTTP request
 *   3. We override getRequest() to extract `req` from GraphQL context
 *   4. Passport reads the Authorization header from that `req` object
 *   5. JwtStrategy.validate() runs and attaches `req.user`
 */
@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override the ExecutionContext to pull the request
   * from the GraphQL context rather than the HTTP context.
   */
  getRequest(context: ExecutionContext) {
    // GqlExecutionContext.create() wraps the NestJS ExecutionContext
    // and gives us GraphQL-specific helpers
    const ctx = GqlExecutionContext.create(context);

    // ctx.getContext() returns the GraphQL context object.
    // In Apollo Server + NestJS, `req` is the raw Express request
    // that contains headers (including Authorization: Bearer <token>)
    return ctx.getContext<{ req: Request }>().req;
  }
}
