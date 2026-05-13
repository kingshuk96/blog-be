import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

/**
 * AuthService contains all authentication business logic.
 *
 * @Injectable() marks this class as a NestJS Provider,
 * meaning it can be injected into controllers or other services
 * via the constructor.
 */
@Injectable()
export class AuthService {
  // NestJS automatically injects PrismaService here
  // because PrismaModule is marked @Global()
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: SignupDto) {
    // 1. Check if email already exists
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      // 409 Conflict — email taken
      throw new ConflictException('An account with this email already exists');
    }

    // 2. Hash the password — NEVER store plain text passwords
    //    bcrypt salt rounds = 10 (higher = slower but more secure)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create the user in MongoDB via Prisma
    let user: Awaited<ReturnType<typeof this.prisma.users.create>>;
    try {
      user = await this.prisma.users.create({
        data: {
          fName: dto.fName,
          lName: dto.lName,
          email: dto.email,
          password: hashedPassword,
        },
      });
    } catch {
      throw new InternalServerErrorException('Could not create user');
    }

    // 4. Return a safe response — NEVER return the password
    return {
      id: user.id,
      uuid: user.uuid,
      fName: user.fName,
      lName: user.lName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
