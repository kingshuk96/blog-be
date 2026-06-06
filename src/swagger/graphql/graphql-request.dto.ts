import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Generic shape of every GraphQL HTTP request body.
 *
 * All GraphQL operations — queries, mutations and subscriptions — are
 * sent as a POST to /graphql with this JSON body:
 *
 *   { "query": "...", "variables": { ... }, "operationName": "..." }
 *
 * This DTO is used as the base for all operation-specific Swagger examples.
 */
export class GraphqlRequestDto {
  @ApiProperty({
    description: 'The GraphQL query / mutation string.',
    example: '{ __typename }',
  })
  query: string;

  @ApiPropertyOptional({
    description:
      'A key-value map of variable values referenced inside the query via $varName.',
    example: {},
    type: 'object',
    additionalProperties: true,
  })
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'When the query string contains multiple named operations, use this field to select which one to execute.',
    example: null,
    nullable: true,
  })
  operationName?: string | null;
}
