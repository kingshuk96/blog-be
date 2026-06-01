import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

/**
 * registerEnumType tells GraphQL that `Role` is an enum.
 * Without this, GraphQL would not know how to serialize/deserialize it.
 *
 * name: 'Role'  → the name that appears in the GraphQL schema
 */
registerEnumType(Role, {
  name: 'Role',
  description: 'The role of the user in the system',
});

/**
 * @ObjectType() marks this class as a GraphQL Object Type.
 *
 * In REST you have a JSON response shape.
 * In GraphQL, you declare that shape using @ObjectType() classes.
 *
 * Every @Field() inside becomes a queryable field.
 * If you don't add @Field(), that property is invisible to GraphQL.
 *
 * Think of this as the "contract" between your API and the client.
 */
@ObjectType({ description: 'Represents a user in the system' })
export class UserModel {
  /**
   * ID is a special GraphQL scalar for unique identifiers.
   * () => ID  means: "this field is of type ID in GraphQL"
   */
  @Field(() => ID, { description: 'MongoDB ObjectId' })
  id: string;

  @Field(() => String, { description: 'Stable public UUID for the user' })
  uuid: string;

  @Field(() => String, { description: 'First name' })
  fName: string;

  @Field(() => String, { description: 'Last name' })
  lName: string;

  @Field(() => String, { description: 'Email address' })
  email: string;

  @Field(() => Role, { description: 'User role: admin or user' })
  role: Role;

  @Field(() => Boolean, { description: 'Whether the account is active' })
  isActive: boolean;

  @Field(() => Date, { description: 'When the account was created' })
  createdAt: Date;

  /**
   * nullable: true means this field can be null in the GraphQL response.
   * We expose lastLogin but it may not be set yet.
   */
  @Field(() => Date, {
    nullable: true,
    description: 'Timestamp of the last login',
  })
  lastLogin?: Date | null;

  // NOTE: password is intentionally NOT exposed as a @Field
  // It will never appear in any GraphQL response — security best practice.
}
