import { ApiProperty } from '@nestjs/swagger';

/**
 * Shape of the response returned by POST /auth/refresh-token.
 */
export class RefreshTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Freshly issued JWT access token — include as `Authorization: Bearer <token>`',
  })
  access_token: string;
}
