import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload } from './jwt.strategy';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

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

    // 4. Sign a JWT — payload contains non-sensitive identifiers only
    const payload = { sub: user.uuid, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // 5. Return user info + token — NEVER return the password
    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      access_token,
    };
  }

  async login(email: string, password: string) {
    const existing = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existing.password as string
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: existing.uuid,
      email: existing.email,
      role: existing.role,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: existing.id,
        uuid: existing.uuid,
        fName: existing.fName,
        lName: existing.lName,
        email: existing.email,
        role: existing.role,
        createdAt: existing.createdAt,
      },
      access_token,
    };
  }

  /**
   * Issues a fresh access token for an already-authenticated user.
   *
   * The caller must present a valid (non-expired) Bearer token.
   * JwtAuthGuard validates the token before this method is invoked,
   * and attaches the decoded payload to req.user.
   *
   * We re-fetch the user from the DB to ensure the account still exists
   * and to pick up any role changes that happened since the last token was issued.
   *
   * @param payload - Decoded JWT payload supplied by JwtAuthGuard via req.user
   * @returns A fresh access_token
   */
  async refreshToken(payload: JwtPayload) {
    // Re-fetch user to confirm account still exists and get up-to-date role
    const user = await this.prisma.users.findUnique({
      where: { uuid: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    const newPayload: JwtPayload = {
      sub: user.uuid,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(newPayload),
    };
  }

  /**
   * Returns the profile of the currently authenticated user.
   *
   * The caller must present a valid (non-expired) Bearer token.
   * JwtAuthGuard validates the token before this method is invoked,
   * and attaches the decoded payload to req.user.
   *
   * We re-fetch the user from the DB to ensure the account still exists
   * and to pick up any role changes that happened since the last token was issued.
   *
   * @param userId - The UUID of the user to retrieve
   * @returns The profile of the user
   */
  async getUser(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { uuid: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }
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
