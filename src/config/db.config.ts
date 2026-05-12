import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ENV } from './env.config';

export const dbConfig: MongooseModuleAsyncOptions = {
  useFactory: async () => ({
    uri: ENV.MONGO_URI,
    connectionFactory: (connection: Connection) => {
      connection.on('connected', () => {
        console.log('\n✅ MongoDB connected successfully\n');
      });
      connection.on('error', (err: Error) => {
        console.error(`\n❌ MongoDB connection error: ${err.message}\n`);
      });
      connection.on('disconnected', () => {
        console.warn('\n⚠️  MongoDB disconnected\n');
      });
      return connection;
    },
  }),
};
