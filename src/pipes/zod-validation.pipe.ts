import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * ZodValidationPipe is a custom NestJS Pipe.
 *
 * A Pipe runs BEFORE the controller method.
 * It receives the raw request value and either:
 *   ✅ Returns the validated/transformed value → controller runs normally
 *   ❌ Throws BadRequestException (400) → controller never runs
 *
 * Usage in a controller:
 *   @Body(new ZodValidationPipe(SignupSchema)) dto: SignupDto
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      // Extract human-readable error messages from ZodError
      // Note: Zod v4 uses .issues instead of .errors
      const errors = (result.error as ZodError).issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    // Return the parsed (and type-safe) value
    return result.data;
  }
}
