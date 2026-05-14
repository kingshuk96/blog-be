import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard protects routes that require a valid JWT.
 *
 * Usage on a controller method:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@Request() req) { return req.user; }
 *
 * Returns 401 Unauthorized automatically if the token is
 * missing, expired, or has an invalid signature.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
