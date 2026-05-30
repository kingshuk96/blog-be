import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SignupSchema } from './dto/signup.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { LoginDto } from './dto/login.dto';
import { SignupRequestDto } from '../../swagger/auth/signup-request.dto';
import { LoginRequestDto } from '../../swagger/auth/login-request.dto';
import { AuthResponseDto } from '../../swagger/auth/auth-response.dto';

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
}
