import { z } from 'zod';

/**
 * Zod schema that defines the exact shape and rules
 * for the signup request body.
 *
 * If any field fails validation, the ZodValidationPipe
 * will automatically return a 400 Bad Request before
 * the controller ever runs.
 */
export const SignupSchema = z.object({
  fName: z.string().min(1, 'First name is required'),
  lName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * TypeScript type inferred directly from the Zod schema.
 * No need to define it separately — Zod generates it for us.
 */
export type SignupDto = z.infer<typeof SignupSchema>;
