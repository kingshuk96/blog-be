import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * UserService contains all USER-related business logic.
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

  async getUsers() {
    return this.prisma.users.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(uuid: string) {
    console.log(uuid);
    return this.prisma.users.findUnique({ where: { uuid } });
  }

  async getCurrentUser(uuid: string) {
    return this.prisma.users.findUnique({ where: { uuid } });
  }
}
