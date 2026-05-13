import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

/**
 * UNIT TEST — AuthService
 *
 * We test AuthService in complete isolation.
 * PrismaService is replaced with a mock (fake object).
 * No real MongoDB connection is needed.
 */
describe('AuthService', () => {
  let service: AuthService;

  // This is our fake PrismaService — we control what every method returns
  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  // A valid signup DTO we reuse across tests
  const signupDto: SignupDto = {
    fName: 'John',
    lName: 'Doe',
    email: 'john@example.com',
    password: 'Secret123',
  };

  // A fake DB user that Prisma would return after creation
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // beforeEach → runs before EVERY test to give a fresh module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // Replace the real PrismaService with our mock
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mock call history before each test
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────
  // ✅ Happy path
  // ──────────────────────────────────────────────────────

  describe('signup()', () => {
    it('should create a user and return safe user data (no password)', async () => {
      // ARRANGE: email not taken, create succeeds
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue(mockCreatedUser);

      // ACT
      const result = await service.signup(signupDto);

      // ASSERT
      expect(result).toEqual({
        id: mockCreatedUser.id,
        uuid: mockCreatedUser.uuid,
        fName: mockCreatedUser.fName,
        lName: mockCreatedUser.lName,
        email: mockCreatedUser.email,
        role: mockCreatedUser.role,
        createdAt: mockCreatedUser.createdAt,
      });

      // Password must NOT be in the response
      expect(result).not.toHaveProperty('password');
    });

    it('should hash the password before saving to the database', async () => {
      // ARRANGE
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue(mockCreatedUser);

      // Spy on bcrypt.hash to check it was called
      const hashSpy = jest.spyOn(bcrypt, 'hash');

      // ACT
      await service.signup(signupDto);

      // ASSERT: bcrypt.hash was called with the plain password and 10 salt rounds
      expect(hashSpy).toHaveBeenCalledWith(signupDto.password, 10);

      // ASSERT: the plain password was NOT saved
      const createCall = mockPrismaService.users.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(signupDto.password);
    });

    // ──────────────────────────────────────────────────────
    // ❌ Error cases
    // ──────────────────────────────────────────────────────

    it('should throw ConflictException (409) if email already exists', async () => {
      // ARRANGE: simulate email already in DB
      mockPrismaService.users.findUnique.mockResolvedValue(mockCreatedUser);

      // ASSERT: calling signup should reject with ConflictException
      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        'An account with this email already exists'
      );

      // Prisma create should never have been called
      expect(mockPrismaService.users.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException (500) if Prisma create fails', async () => {
      // ARRANGE: email is free but DB insert blows up
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockPrismaService.users.create.mockRejectedValue(new Error('DB error'));

      // ASSERT
      await expect(service.signup(signupDto)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
