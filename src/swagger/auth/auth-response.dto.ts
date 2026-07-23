import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents the user object returned in auth responses.
 */
export class UserResponseDto {
  @ApiProperty({
    example: '6630d1e2a4b2c000123abc01',
    description: 'MongoDB ObjectId of the user',
  })
  id: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Universally unique identifier (UUID) for the user',
  })
  uuid: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  fName: string;

  @ApiProperty({ example: 'Sahu', description: 'Last name' })
  lName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    example: 'USER',
    description: 'Role assigned to the user',
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  })
  role: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the account was created',
    format: 'date-time',
  })
  createdAt: string;
}

/**
 * Shape of the response returned by both /auth/signup and /auth/login.
 */
export class AuthResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'JWT access token — include as `Authorization: Bearer <token>`',
  })
  access_token: string;
}
