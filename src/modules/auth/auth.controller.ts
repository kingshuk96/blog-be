import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, SignupSchema } from './dto/signup.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

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
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({
    schema: {
      example: {
        fName: 'John',
        lName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Secret123',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  signup(@Body(new ZodValidationPipe(SignupSchema)) dto: SignupDto) {
    return this.authService.signup(dto);
  }
}
