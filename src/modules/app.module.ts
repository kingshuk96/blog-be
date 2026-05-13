import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from '../health.controller';
import { dbConfig } from '../config/db.config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRootAsync(dbConfig), // existing Mongoose connection
    PrismaModule, // global Prisma client
    AuthModule, // POST /auth/signup
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
