import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';

// ─────────────────────────────────────────────────────────────────────────────
// LINE-BY-LINE EXPLANATION
// ─────────────────────────────────────────────────────────────────────────────
//
// Line 1: Test, TestingModule
//   @nestjs/testing lets us spin up a NestJS DI container for unit tests
//   without starting a real HTTP server.
//   → Test.createTestingModule()  builds an isolated mini-module
//   → TestingModule               is the type of what it produces
//
// Line 2: NotFoundException
//   The NestJS exception our service throws when a uuid doesn't exist.
//   We import it so we can assert: .rejects.toThrow(NotFoundException)
//
// Line 3: UserService
//   The class we are testing. We need the real class so NestJS can
//   instantiate it — but we'll inject a *fake* PrismaService into it.
//
// Line 4: PrismaService
//   We import PrismaService so we can use it as the DI *token* when
//   telling NestJS "use this mock instead of the real thing".
//   We never call any real Prisma/DB code in unit tests.
//
// Line 5: UpdateUserInput
//   The GraphQL @InputType we created. We import it so we can build
//   strongly-typed test payloads (TypeScript checks our test data).
// ─────────────────────────────────────────────────────────────────────────────

describe('UserService', () => {
  // ── describe() ─────────────────────────────────────────────────────────────
  // describe() groups related tests into a named block.
  // Jest prints this name as a header in the test output.
  // You can nest describe() blocks for more granular grouping.

  let service: UserService;
  // 'service' will hold the real UserService instance after the module compiles.
  // We declare it here (outside beforeEach) so every test in this describe()
  // block can access it.

  // ── Mock PrismaService ──────────────────────────────────────────────────────
  //
  // WHY DO WE MOCK PRISMA?
  //   Unit tests must be fast and deterministic. A real Prisma call would:
  //     1. Need a live MongoDB connection
  //     2. Be slow (network I/O)
  //     3. Pollute the real database
  //   Instead we create a plain JS object that looks like PrismaService
  //   but every method is a jest.fn() — a fake function we control.
  //
  // jest.fn()
  //   Creates a "spy" function that:
  //     - Records how many times it was called
  //     - Records what arguments it received
  //     - Returns undefined by default (we override this per-test with .mockResolvedValue)
  const mockPrismaService = {
    users: {
      findMany: jest.fn(), // used by getUsers()
      findUnique: jest.fn(), // used by getUserById(), getCurrentUser(), updateUser()
      update: jest.fn(), // used by updateUser()
    },
  };

  // ── Shared fixtures ─────────────────────────────────────────────────────────
  //
  // A "fixture" is test data shared across multiple tests.
  // Defining it once here avoids repetition and makes tests easier to read.

  const mockUser = {
    // This is what Prisma's users.findUnique() / users.update() would return.
    // It must include every field the service returns.
    id: 'mongo-object-id-abc123',
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    fName: 'John',
    lName: 'Doe',
    email: 'john@example.com',
    password: 'hashed-password', // present in DB but never returned by the API
    role: 'user',
    isActive: true,
    deletedAt: null,
    lastLogin: null,
    createdAt: new Date('2024-01-15T08:00:00.000Z'),
    updatedAt: new Date('2024-01-15T08:00:00.000Z'),
  };

  // ── beforeEach ─────────────────────────────────────────────────────────────
  //
  // beforeEach runs BEFORE EVERY single it() test in this describe() block.
  // Its job here:
  //   1. Build a fresh mini NestJS module for each test
  //   2. Get the real UserService instance from that module
  //   3. Clear all mock call history so tests don't bleed into each other
  //
  // WHY re-create the module every test?
  //   Isolation. If test A changes some state on the service, test B must
  //   start clean. beforeEach guarantees a blank slate every time.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // providers[] is equivalent to @Module({ providers: [...] })
      // We list every class this module needs to instantiate.
      providers: [
        UserService,
        // { provide: TOKEN, useValue: REPLACEMENT }
        // Tells NestJS DI: "whenever someone asks for PrismaService,
        // give them mockPrismaService instead of the real class."
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    // .compile() triggers NestJS to wire all the providers together.
    // After this, UserService has been instantiated with mockPrismaService injected.

    service = module.get<UserService>(UserService);
    // module.get<T>(Token) retrieves the singleton instance of T from the
    // module's DI container. This is our real UserService — just with a fake Prisma.

    jest.clearAllMocks();
    // Resets all mock state: call count, call arguments, return values.
    // Must run AFTER module.get() so the module itself isn't affected.
  });

  // ════════════════════════════════════════════════════════════════════════════
  // getUsers()
  // ════════════════════════════════════════════════════════════════════════════
  describe('getUsers()', () => {
    it('should return all active users ordered by createdAt desc', async () => {
      // ── ARRANGE ─────────────────────────────────────────────────────────────
      // Tell the mock what to return when prisma.users.findMany() is called.
      // .mockResolvedValue() makes the jest.fn() return a Promise that resolves
      // to the given value — because findMany() is an async function.
      mockPrismaService.users.findMany.mockResolvedValue([mockUser]);

      // ── ACT ──────────────────────────────────────────────────────────────────
      // Call the real service method. It will internally call prisma.users.findMany()
      // which is our mock — no real DB call happens.
      const result = await service.getUsers();

      // ── ASSERT ───────────────────────────────────────────────────────────────
      // 1. The return value is what Prisma gave us (passed straight through)
      expect(result).toEqual([mockUser]);

      // 2. The service called findMany with the right filter & sort arguments.
      //    This proves the service doesn't ignore those options.
      expect(mockPrismaService.users.findMany).toHaveBeenCalledWith({
        where: { isActive: true }, // only active users
        orderBy: { createdAt: 'desc' }, // newest first
      });

      // 3. findMany was called exactly once — not twice, not zero times.
      expect(mockPrismaService.users.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no active users exist', async () => {
      // ARRANGE: DB has no active users
      mockPrismaService.users.findMany.mockResolvedValue([]);

      // ACT
      const result = await service.getUsers();

      // ASSERT: service doesn't crash — it just returns an empty array
      expect(result).toEqual([]);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // getUserById()
  // ════════════════════════════════════════════════════════════════════════════
  describe('getUserById()', () => {
    it('should return the user when found by uuid', async () => {
      // ARRANGE: Prisma finds the user
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      // ACT
      const result = await service.getUserById(mockUser.uuid);

      // ASSERT
      expect(result).toEqual(mockUser);
      // Verify the service queried by the correct uuid
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { uuid: mockUser.uuid },
      });
    });

    it('should return null when uuid does not exist', async () => {
      // ARRANGE: Prisma returns null (record not found)
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      // ACT
      const result = await service.getUserById('nonexistent-uuid');

      // ASSERT: service passes null straight through (no exception thrown)
      expect(result).toBeNull();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // updateUser()  ← NEW
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateUser()', () => {
    // The input a client would send in the mutation
    const updateInput: UpdateUserInput = {
      fName: 'Jane',
      lName: 'Smith',
    };

    // What Prisma returns after a successful update
    const updatedUser = {
      ...mockUser, // spread all existing fields
      fName: 'Jane', // overwrite with the new values
      lName: 'Smith',
      updatedAt: new Date(), // Prisma updates this automatically
    };

    // ── Happy path ─────────────────────────────────────────────────────────────
    it('should update and return the user when uuid exists', async () => {
      // ARRANGE: Prisma.update() returns the updated document
      mockPrismaService.users.update.mockResolvedValue(updatedUser);

      // ACT
      const result = await service.updateUser(mockUser.uuid, updateInput);

      // ASSERT 1: The returned value is the updated document Prisma gave us
      expect(result).toEqual(updatedUser);
      expect(result.fName).toBe('Jane');
      expect(result.lName).toBe('Smith');

      // ASSERT 2: The service called Prisma.update() with the exact right args.
      //   - where: { uuid }  → targets the correct user
      //   - data             → passes the input unchanged (no extra fields added)
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { uuid: mockUser.uuid },
        data: updateInput,
      });
    });

    it('should apply a partial update when only fName is supplied', async () => {
      // ARRANGE: client only sends fName, leaves lName unchanged
      const partialInput: UpdateUserInput = { fName: 'UpdatedFirst' };
      const partiallyUpdatedUser = { ...mockUser, fName: 'UpdatedFirst' };

      mockPrismaService.users.update.mockResolvedValue(partiallyUpdatedUser);

      // ACT
      const result = await service.updateUser(mockUser.uuid, partialInput);

      // ASSERT: only the supplied field is in the update payload
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { uuid: mockUser.uuid },
        data: partialInput, // { fName: 'UpdatedFirst' } — no lName key at all
      });
      expect(result.fName).toBe('UpdatedFirst');
      expect(result.lName).toBe('Doe'); // original lName is untouched
    });

    it('should apply a partial update when only lName is supplied', async () => {
      // Same pattern — verifying each field independently
      const partialInput: UpdateUserInput = { lName: 'UpdatedLast' };
      const partiallyUpdatedUser = { ...mockUser, lName: 'UpdatedLast' };

      mockPrismaService.users.update.mockResolvedValue(partiallyUpdatedUser);

      const result = await service.updateUser(mockUser.uuid, partialInput);

      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { uuid: mockUser.uuid },
        data: { lName: 'UpdatedLast' },
      });
      expect(result.lName).toBe('UpdatedLast');
      expect(result.fName).toBe('John'); // original fName untouched
    });

    // ── Error path ─────────────────────────────────────────────────────────────
    it('should propagate an error if Prisma update throws (e.g. uuid not found)', async () => {
      // ARRANGE: Prisma throws when the record doesn't exist.
      // In MongoDB with Prisma, updating a non-existent record throws
      // a "Record to update not found" error.
      // .mockRejectedValue() makes the jest.fn() return a rejected Promise.
      mockPrismaService.users.update.mockRejectedValue(
        new Error('Record to update not found')
      );

      // ASSERT: the service does NOT swallow the error — it bubbles up.
      // await expect(...).rejects.toThrow() is how you test async exceptions.
      await expect(
        service.updateUser('nonexistent-uuid', updateInput)
      ).rejects.toThrow('Record to update not found');
    });
  });
});
