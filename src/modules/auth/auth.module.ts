import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * AuthModule groups all auth-related pieces together.
 *
 * - controllers: [AuthController] → registers the /auth routes
 * - providers:   [AuthService]    → makes AuthService injectable
 *
 * Note: We don't need to import PrismaModule here because
 * it is marked @Global() — it's available everywhere automatically.
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
