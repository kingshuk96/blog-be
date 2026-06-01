import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * UserService contains all USER-related business logic.
 *
 * It is separate from AuthService on purpose:
 *   - AuthService  → handles login / signup / token logic
 *   - UserService  → handles querying, updating, deactivating users
 *
 * @Injectable() makes it available for NestJS Dependency Injection (DI).
 * NestJS will automatically create one instance and inject it wherever needed.
 */
@Injectable()
export class UserService {
  /**
   * PrismaService is injected via the constructor.
   * Because PrismaModule is @Global(), we don't need to import it again in UserModule.
   *
   * `private readonly` means:
   *   - private  → only accessible inside this class
   *   - readonly → cannot be reassigned after construction
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * getUsers — fetches ALL active users from the database.
   *
   * We intentionally:
   *   1. Filter isActive: true  → skip deactivated accounts
   *   2. Omit `password` via `select` or by not selecting it
   *      (here we return the full object and the GraphQL model handles exclusion)
   *
   * Returns: Array of Users (password field exists on object but is NOT exposed by GraphQL)
   */
  async getUsers() {
    return this.prisma.users.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }, // newest first
    });
  }
}
