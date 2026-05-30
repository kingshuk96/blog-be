import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger-annotated DTO class for the POST /auth/login request body.
 * Used purely for OpenAPI documentation — validation is still handled by Zod.
 */
export class LoginRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Registered email address',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    example: 'Secret123',
    description: 'Account password',
    format: 'password',
    minLength: 8,
  })
  password: string;
}
