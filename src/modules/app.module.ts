import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from '../health.controller';
import { dbConfig } from '../config/db.config';

@Module({
  imports: [MongooseModule.forRootAsync(dbConfig)],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
