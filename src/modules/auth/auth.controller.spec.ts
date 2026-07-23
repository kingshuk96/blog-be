import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

/**
 * UNIT TEST — AuthController
 *
 * Controllers are thin — they just receive validated input
 * and delegate to the service. So we mock AuthService
 * and verify the controller calls it correctly.
 */
describe('AuthController', () => {
  let controller: AuthController;

  // Fake AuthService — we only care that the controller calls it
  const mockAuthService = {
    signup: jest.fn(),
  };

  const signupDto: SignupDto = {
    fName: 'John',
    lName: 'Sahu',
    email: 'john@example.com',
    password: 'Secret123',
  };

  const mockServiceResponse = {
    id: 'fake-mongo-id',
    uuid: 'fake-uuid',
    fName: 'John',
    lName: 'Sahu',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // Replace real AuthService with mock
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('signup()', () => {
    it('should call authService.signup() with the provided DTO', async () => {
      // ARRANGE
      mockAuthService.signup.mockResolvedValue(mockServiceResponse);

      // ACT
      await controller.signup(signupDto);

      // ASSERT: service was called exactly once with the right data
      expect(mockAuthService.signup).toHaveBeenCalledTimes(1);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
    });

    it('should return whatever authService.signup() returns', async () => {
      // ARRANGE
      mockAuthService.signup.mockResolvedValue(mockServiceResponse);

      // ACT
      const result = await controller.signup(signupDto);

      // ASSERT: controller passes the service result straight through
      expect(result).toEqual(mockServiceResponse);
    });

    it('should propagate exceptions thrown by authService', async () => {
      // ARRANGE: service throws (e.g., ConflictException)
      const error = new Error('An account with this email already exists');
      mockAuthService.signup.mockRejectedValue(error);

      // ASSERT: controller doesn't swallow exceptions
      await expect(controller.signup(signupDto)).rejects.toThrow(
        'An account with this email already exists'
      );
    });
  });
});
