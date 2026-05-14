import { JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { ENV } from './env.config';

/**
 * Centralised JWT configuration.
 *
 * Consumed by:
 *  - AuthModule  → JwtModule.register(jwtConfig)
 *  - JwtStrategy → secretOrKey: jwtConfig.secret
 */
export const jwtConfig: JwtModuleOptions = {
  secret: ENV.JWT_SECRET,
  signOptions: {
    // Cast needed: expiresIn expects StringValue (branded ms type), not plain string
    expiresIn: ENV.JWT_EXPIRES_IN as StringValue,
  },
};
