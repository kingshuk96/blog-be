import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps PrismaClient and hooks into NestJS lifecycle.
 * - onModuleInit  → connects to MongoDB when the app starts
 * - onModuleDestroy → cleanly disconnects when the app shuts down
 *
 * By making it @Injectable(), any service can receive it via constructor injection.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
