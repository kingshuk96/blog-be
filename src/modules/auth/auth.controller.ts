import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SignupSchema } from './dto/signup.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { LoginDto } from './dto/login.dto';
import { SignupRequestDto } from '../../swagger/auth/signup-request.dto';
import { LoginRequestDto } from '../../swagger/auth/login-request.dto';
import { AuthResponseDto } from '../../swagger/auth/auth-response.dto';
import { RefreshTokenResponseDto } from '../../swagger/auth/refresh-token-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Request } from 'express';

/**
 * Shape of req.user set by JwtStrategy.validate().
 * Maps JWT payload fields to their controller-facing names.
 */
interface AuthenticatedUser {
  userId: string; // ← payload.sub
  email: string;
  role: string;
}

/**
 * AuthController maps HTTP routes to AuthService methods.
 *
 * @Controller('auth') sets the base path → all routes here start with /auth
 * @ApiTags('Auth')    groups this controller under "Auth" in Swagger UI
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // NestJS injects AuthService automatically
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   *
   * @Body(new ZodValidationPipe(SignupSchema))
   *   → The pipe runs FIRST, validates the body against SignupSchema.
   *   → If validation passes, `dto` is fully typed as SignupDto.
   *   → If validation fails, pipe throws 400 automatically.
   *
   * @HttpCode(HttpStatus.CREATED) → returns 201 on success (default for POST is 200)
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user with the provided details. Returns a JWT access token and user profile on success.',
  })
  @ApiBody({ type: SignupRequestDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed — check request body against schema',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already in use — use a different email address',
  })
  signup(@Body(new ZodValidationPipe(SignupSchema)) dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login to an existing user account',
    description:
      'Authenticates the user with email and password. Returns a JWT access token and user profile on success.',
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials — wrong email or password',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  /**
   * POST /auth/refresh-token
   *
   * Requires a valid (non-expired) Bearer token in the Authorization header.
   * JwtAuthGuard validates the token and attaches the decoded payload to req.user.
   * The service re-fetches the user from DB and returns a freshly signed token.
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Refresh the JWT access token',
    description:
      'Accepts a valid (non-expired) Bearer token and returns a new access token with a refreshed expiry. The current token must be included in the Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token issued successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired Bearer token',
  })
  refreshToken(@Req() req: Request & { user: AuthenticatedUser }) {
    // Re-map from the shape JwtStrategy.validate() returns back to JwtPayload
    return this.authService.refreshToken({
      sub: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    });
  }

  /**
   * GET /auth/profile
   *
   * Requires a valid (non-expired) Bearer token in the Authorization header.
   * JwtAuthGuard validates the token and attaches the decoded payload to req.user.
   * The service re-fetches the user from DB and returns their profile.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile of the currently authenticated user. The user is identified via the valid (non-expired) Bearer token in the Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired Bearer token',
  })
  getProfile(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.getUser(req.user.userId);
  }
}
