import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger-annotated DTO class for the POST /auth/signup request body.
 * Used purely for OpenAPI documentation — validation is still handled by Zod.
 */
export class SignupRequestDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
    minLength: 1,
  })
  fName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    minLength: 1,
  })
  lName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'A valid, unique email address',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    example: 'Secret123',
    description:
      'Password (min 8 chars, at least one uppercase letter and one number)',
    minLength: 8,
    format: 'password',
  })
  password: string;
}
