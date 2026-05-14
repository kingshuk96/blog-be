import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { jwtConfig } from '../../config/jwt.config';

/**
 * AuthModule groups all auth-related pieces together.
 *
 * - PassportModule: registers Passport in the NestJS DI container
 * - JwtModule:      configures the JWT secret and expiry globally for this module
 * - JwtStrategy:    validates incoming Bearer tokens
 */
@Module({
  imports: [PassportModule, JwtModule.register(jwtConfig)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Export JwtModule so other modules can inject JwtService if needed
  exports: [JwtModule],
})
export class AuthModule {}
