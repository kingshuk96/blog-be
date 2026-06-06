import { Field, InputType } from '@nestjs/graphql';

/**
 * UpdateUserInput — the GraphQL @InputType for the updateUser mutation.
 *
 * WHY @InputType AND NOT @ObjectType?
 * ─────────────────────────────────────
 * In GraphQL there are two kinds of complex types:
 *   - @ObjectType  → used for output (what the API returns)
 *   - @InputType   → used for input (what the client sends in a mutation)
 *
 * This class defines the shape of the `input` argument clients send:
 *   mutation {
 *     updateUser(input: { fName: "Jane" }) { ... }
 *   }
 *
 * PARTIAL UPDATE:
 * All fields are nullable (optional). The client only needs to send
 * the fields they want to change — unchanged fields are left as-is.
 *
 * EXCLUDED FIELDS:
 *   - email    → requires a dedicated re-verification flow
 *   - password → requires current-password confirmation (own mutation)
 *   - role     → admin-only operation
 *   - isActive → internal/admin field
 */
@InputType({
  description: 'Fields that can be updated on the current user profile',
})
export class UpdateUserInput {
  @Field(() => String, {
    nullable: true,
    description: 'New first name',
  })
  fName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'New last name',
  })
  lName?: string;
}
