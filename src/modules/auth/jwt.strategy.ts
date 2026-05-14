import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../config/jwt.config';

/**
 * Shape of the JWT payload we sign when issuing tokens.
 * Keep this in sync with what AuthService.signup() puts inside the token.
 */
export interface JwtPayload {
  sub: string; // user UUID
  email: string;
  role: string;
}

/**
 * JwtStrategy validates every incoming Bearer token.
 *
 * Passport calls validate() after the signature check passes.
 * Whatever this method returns gets attached to req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extract token from the Authorization: Bearer <token> header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject expired tokens
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret as string,
    });
  }

  /**
   * Called automatically by Passport after the token signature is verified.
   * The decoded payload is passed in as `payload`.
   * Return value is assigned to req.user.
   */
  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
