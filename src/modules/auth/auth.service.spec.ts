import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

/**
 * UNIT TEST — AuthService
 *
 * We test AuthService in complete isolation.
 * PrismaService and JwtService are replaced with mocks.
 * No real MongoDB connection or JWT secret is needed.
 */
describe('AuthService', () => {
  let service: AuthService;

  // ── Mocks ────────────────────────────────────────────────────────────────

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  // JwtService mock — sign() just returns a predictable fake token
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  // ── Shared fixtures ───────────────────────────────────────────────────────

  const signupDto: SignupDto = {
    fName: 'John',
    lName: 'Doe',
    email: 'john@example.com',
    password: 'Secret123',
  };

  // Shape that Prisma returns after users.create()
  const mockCreatedUser = {
    id: 'fake-mongo-id',
    uuid: 'fake-uuid',
    fName: 'John',
    lName: 'Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: 'user',
    isActive: true,
    deletedAt: null,
    lastLogin: null,
    createdAt: new Date('2024-01-15T08:00:00.000Z'),
    updatedAt: new Date('2024-01-15T08:00:00.000Z'),
  };

  // ── Test setup ────────────────────────────────────────────────────────────

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();

    // Restore the default sign() return after clearAllMocks
    mockJwtService.sign.mockReturnValue('mock-jwt-token');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // signup()
  // ──────────────────────────────────────────────────────────────────────────

  describe('signup()', () => {
    it('should create a user and return safe user data + access token', async () => {
      // ARRANGE: email not taken, create succeeds
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue(mockCreatedUser);

      // ACT
      const result = await service.signup(signupDto);

      // ASSERT — response shape matches current AuthService implementation
      expect(result).toEqual({
        user: {
          id: mockCreatedUser.id,
          uuid: mockCreatedUser.uuid,
          fName: mockCreatedUser.fName,
          lName: mockCreatedUser.lName,
          email: mockCreatedUser.email,
          role: mockCreatedUser.role,
          createdAt: mockCreatedUser.createdAt,
        },
        access_token: 'mock-jwt-token',
      });

      // Password must NEVER appear in the response
      expect(result.user).not.toHaveProperty('password');
    });

    it('should hash the password before saving to the database', async () => {
      // ARRANGE
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue(mockCreatedUser);

      const hashSpy = jest.spyOn(bcrypt, 'hash');

      // ACT
      await service.signup(signupDto);

      // ASSERT: bcrypt.hash called with plain password and 10 salt rounds
      expect(hashSpy).toHaveBeenCalledWith(signupDto.password, 10);

      // ASSERT: the plain password was NOT stored
      const createCall = mockPrismaService.users.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(signupDto.password);
    });

    it('should sign a JWT with the correct payload after creation', async () => {
      // ARRANGE
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue(mockCreatedUser);

      // ACT
      await service.signup(signupDto);

      // ASSERT: jwtService.sign was called with user identifiers (no password)
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockCreatedUser.uuid,
        email: mockCreatedUser.email,
        role: mockCreatedUser.role,
      });
    });

    it('should throw ConflictException (409) if email already exists', async () => {
      // ARRANGE: simulate email already in DB
      mockPrismaService.users.findUnique.mockResolvedValue(mockCreatedUser);

      // ASSERT
      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        'An account with this email already exists'
      );

      // Prisma create should never be called
      expect(mockPrismaService.users.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException (500) if Prisma create fails', async () => {
      // ARRANGE: email is free but DB insert throws
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockRejectedValue(new Error('DB error'));

      // ASSERT
      await expect(service.signup(signupDto)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // login()
  // ──────────────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should return user data + access token on valid credentials', async () => {
      // ARRANGE: user exists and password matches
      const plainPassword = 'Secret123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      mockPrismaService.users.findUnique.mockResolvedValue({
        ...mockCreatedUser,
        password: hashedPassword,
      });

      // ACT
      const result = await service.login(mockCreatedUser.email, plainPassword);

      // ASSERT
      expect(result).toMatchObject({
        user: {
          email: mockCreatedUser.email,
          fName: mockCreatedUser.fName,
        },
        access_token: 'mock-jwt-token',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException if the email is not registered', async () => {
      // ARRANGE: user not found
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      // ASSERT
      await expect(
        service.login('nobody@example.com', 'Secret123')
      ).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException if the password is wrong', async () => {
      // ARRANGE: user exists but password doesn't match
      const hashedPassword = await bcrypt.hash('CorrectPassword1', 10);
      mockPrismaService.users.findUnique.mockResolvedValue({
        ...mockCreatedUser,
        password: hashedPassword,
      });

      // ASSERT
      await expect(
        service.login(mockCreatedUser.email, 'WrongPassword1')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // refreshToken()
  // ──────────────────────────────────────────────────────────────────────────

  describe('refreshToken()', () => {
    const jwtPayload = {
      sub: mockCreatedUser.uuid,
      email: mockCreatedUser.email,
      role: mockCreatedUser.role,
    };

    it('should return a new access token for a valid user', async () => {
      // ARRANGE: user still exists in DB
      mockPrismaService.users.findUnique.mockResolvedValue(mockCreatedUser);

      // ACT
      const result = await service.refreshToken(jwtPayload);

      // ASSERT
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith(jwtPayload);
    });

    it('should throw UnauthorizedException if the user no longer exists', async () => {
      // ARRANGE: user was deleted
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      // ASSERT
      await expect(service.refreshToken(jwtPayload)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshToken(jwtPayload)).rejects.toThrow(
        'User account no longer exists'
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getUser()
  // ──────────────────────────────────────────────────────────────────────────

  describe('getUser()', () => {
    it('should return a safe user profile for a valid userId', async () => {
      // ARRANGE
      mockPrismaService.users.findUnique.mockResolvedValue(mockCreatedUser);

      // ACT
      const result = await service.getUser(mockCreatedUser.uuid);

      // ASSERT: returns profile without password
      expect(result).toEqual({
        id: mockCreatedUser.id,
        uuid: mockCreatedUser.uuid,
        fName: mockCreatedUser.fName,
        lName: mockCreatedUser.lName,
        email: mockCreatedUser.email,
        role: mockCreatedUser.role,
        createdAt: mockCreatedUser.createdAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if the userId does not exist', async () => {
      // ARRANGE
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      // ASSERT
      await expect(service.getUser('nonexistent-uuid')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
