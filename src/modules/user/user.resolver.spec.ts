import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UpdateUserInput } from './dto/update-user.input';

// ─────────────────────────────────────────────────────────────────────────────
// LINE-BY-LINE EXPLANATION
// ─────────────────────────────────────────────────────────────────────────────
//
// WHY TEST THE RESOLVER SEPARATELY FROM THE SERVICE?
//   The resolver is the GraphQL "controller" — its job is:
//     1. Extract arguments from the GQL context (@Args, @Context)
//     2. Call the correct service method with those arguments
//     3. Return the service result
//   It does NOT contain business logic — UserService does.
//   So we mock UserService and only verify the resolver's wiring.
//
// Line 3: UserResolver   — the class under test
// Line 4: UserService    — imported as a DI token for mocking
// Line 5: UpdateUserInput — typed test data for the mutation argument
// ─────────────────────────────────────────────────────────────────────────────

describe('UserResolver', () => {
  let resolver: UserResolver;

  // ── Mock UserService ────────────────────────────────────────────────────────
  //
  // We replace the real UserService with a plain object whose methods
  // are all jest.fn() spies. This means:
  //   - No real DB calls happen
  //   - We control what each method returns per-test
  //   - We can assert that the resolver called the right method with the right args
  const mockUserService = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    getCurrentUser: jest.fn(),
    updateUser: jest.fn(),
  };

  // ── Shared fixture ──────────────────────────────────────────────────────────
  //
  // A fake user object that mimics what Prisma returns.
  // We reuse this across tests so we only define it once.
  const mockUser = {
    id: 'mongo-id-abc',
    uuid: 'test-uuid-1234',
    fName: 'John',
    lName: 'Sahu',
    email: 'john@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-15T08:00:00.000Z'),
    lastLogin: null,
  };

  // ── beforeEach ──────────────────────────────────────────────────────────────
  //
  // Runs before every it() test:
  //   1. Creates an isolated NestJS test module
  //   2. Provides the real UserResolver class (we want to test it for real)
  //   3. Replaces UserService with the mock
  //   4. Retrieves the UserResolver instance
  //   5. Clears all mock state from the previous test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
        // NOTE: We do NOT provide GqlJwtAuthGuard here.
        // In unit tests we don't go through the NestJS middleware pipeline,
        // so guards are never executed — the resolver methods are called directly.
        // Guards are tested at the e2e level where a real HTTP request is made.
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    jest.clearAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // getUsers()
  // ════════════════════════════════════════════════════════════════════════════
  describe('getUsers()', () => {
    it('should call userService.getUsers() and return its result', async () => {
      // ARRANGE
      // .mockResolvedValue([mockUser]) makes getUsers() return Promise<[mockUser]>
      mockUserService.getUsers.mockResolvedValue([mockUser]);

      // ACT
      // We call resolver.getUsers() directly — no HTTP, no GraphQL engine.
      // The resolver just calls this.userService.getUsers() and returns the result.
      const result = await resolver.getUsers();

      // ASSERT 1: The resolver returned whatever the service returned
      expect(result).toEqual([mockUser]);

      // ASSERT 2: The service was called exactly once with no arguments
      // (getUsers takes no parameters)
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // getUserById()
  // ════════════════════════════════════════════════════════════════════════════
  describe('getUserById()', () => {
    it('should pass the uuid argument through to userService.getUserById()', async () => {
      // ARRANGE
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // ACT
      // In a real GraphQL request, @Args('uuid') extracts the uuid from the
      // query arguments. In a unit test we just pass it directly.
      const result = await resolver.getUserById('test-uuid-1234');

      // ASSERT 1: Correct return value
      expect(result).toEqual(mockUser);

      // ASSERT 2: The service received exactly the uuid we passed
      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        'test-uuid-1234'
      );
    });

    it('should return null when userService.getUserById() returns null', async () => {
      // ARRANGE: service returns null (user not found)
      mockUserService.getUserById.mockResolvedValue(null);

      // ACT
      const result = await resolver.getUserById('unknown-uuid');

      // ASSERT: resolver passes null through — it doesn't throw or transform it
      expect(result).toBeNull();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // getProfile()
  // ════════════════════════════════════════════════════════════════════════════
  describe('getProfile()', () => {
    // getProfile() uses @Context() to read req.user.userId from the JWT payload.
    // In a real GraphQL request, Apollo + Passport populate context.req.user.
    // In a unit test we create a fake context object that mimics this shape.

    const fakeContext = {
      req: {
        user: {
          userId: mockUser.uuid, // this is what JwtStrategy.validate() puts in req.user
        },
      },
    };

    it('should extract userId from context and call userService.getCurrentUser()', async () => {
      // ARRANGE
      mockUserService.getCurrentUser.mockResolvedValue(mockUser);

      // ACT
      // We pass our fake context directly to the resolver method.
      // Normally this is injected by @Context() from the GraphQL execution context.
      const result = await resolver.getProfile(fakeContext);

      // ASSERT 1: Return value is what the service returned
      expect(result).toEqual(mockUser);

      // ASSERT 2: The resolver extracted userId correctly from the context
      //           and passed it to the service
      expect(mockUserService.getCurrentUser).toHaveBeenCalledWith(
        mockUser.uuid
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // updateUser()  ← NEW
  // ════════════════════════════════════════════════════════════════════════════
  describe('updateUser()', () => {
    // The mutation input the client sends
    const updateInput: UpdateUserInput = {
      fName: 'Kingshuk',
      lName: 'Smith',
    };

    // The updated user Prisma would return
    const updatedUser = { ...mockUser, fName: 'Kingshuk', lName: 'Smith' };

    // The fake GQL context that carries the JWT payload.
    // In a real request, GqlJwtAuthGuard runs JwtStrategy.validate() which
    // attaches { userId, email, role } to req.user.
    // Here we simulate that manually.
    const fakeContext = {
      req: {
        user: {
          userId: mockUser.uuid, // ← userId comes from the JWT sub claim
        },
      },
    };

    // ── Happy path ─────────────────────────────────────────────────────────────
    it('should extract userId from JWT context and call userService.updateUser()', async () => {
      // ARRANGE: service returns the updated document
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      // ACT
      // We call the resolver method directly with:
      //   - input: the mutation's @Args('input') argument
      //   - fakeContext: simulates @Context() — the GQL execution context
      const result = await resolver.updateUser(updateInput, fakeContext);

      // ASSERT 1: The result is whatever the service returned
      expect(result).toEqual(updatedUser);
      expect(result.fName).toBe('Kingshuk');
      expect(result.lName).toBe('Smith');

      // ASSERT 2: The resolver passed BOTH the userId (from JWT) AND the input
      //           to the service correctly.
      //
      // This is the critical test for the self-update security model:
      //   - userId comes from the JWT (context), NOT from the client's input
      //   - The client cannot supply a different uuid to update someone else's profile
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        mockUser.uuid, // ← from context.req.user.userId (JWT)
        updateInput // ← from @Args('input')
      );
    });

    it('should use the JWT userId, not anything from the input', async () => {
      // This test specifically verifies the self-update security guarantee.
      // Even if someone tampers with the client, the resolver always
      // uses the userId from the verified JWT — never from user-supplied data.
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await resolver.updateUser(updateInput, fakeContext);

      // The first argument to updateUser must ALWAYS be the JWT userId
      const [calledWithUuid] = mockUserService.updateUser.mock.calls[0];
      // .mock.calls is an array of all calls made to the mock.
      // .mock.calls[0] is the arguments of the first call: [uuid, input]
      // [calledWithUuid] destructures to get the first argument

      expect(calledWithUuid).toBe(mockUser.uuid);
      // If this fails, the resolver is reading the uuid from somewhere
      // other than the JWT context — a security bug.
    });

    it('should propagate errors thrown by userService.updateUser()', async () => {
      // ARRANGE: service throws (e.g. uuid not found in DB)
      mockUserService.updateUser.mockRejectedValue(
        new Error('Record to update not found')
      );

      // ASSERT: resolver does not swallow or transform the error
      await expect(
        resolver.updateUser(updateInput, fakeContext)
      ).rejects.toThrow('Record to update not found');
    });

    it('should work with a partial input containing only fName', async () => {
      // ARRANGE: client only wants to change their first name
      const partialInput: UpdateUserInput = { fName: 'OnlyFirst' };
      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        fName: 'OnlyFirst',
      });

      // ACT
      await resolver.updateUser(partialInput, fakeContext);

      // ASSERT: the partial input is forwarded as-is (not mutated or padded)
      expect(mockUserService.updateUser).toHaveBeenCalledWith(mockUser.uuid, {
        fName: 'OnlyFirst',
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THESE TESTS DON'T COVER (BY DESIGN)
// ─────────────────────────────────────────────────────────────────────────────
//
// ❌ Authentication/guard enforcement
//    GqlJwtAuthGuard is never executed in unit tests because we call
//    resolver methods directly. Guard tests belong at the e2e level
//    where a real HTTP request travels through the full middleware stack.
//
// ❌ Schema registration
//    We don't verify that @Mutation, @Query, @Args, @Resolver decorators
//    produce the correct GraphQL schema. NestJS handles this — we trust it.
//    The auto-generated src/schema.gql file is the source of truth for that.
//
// ❌ Real database behaviour
//    No real Prisma calls, no real MongoDB. That's the job of e2e tests.
// ─────────────────────────────────────────────────────────────────────────────
