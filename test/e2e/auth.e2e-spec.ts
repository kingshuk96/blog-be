import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/modules/app.module';

/**
 * E2E TEST — Auth Routes
 *
 * Boots the FULL NestJS application and fires real HTTP requests.
 * Uses supertest to send requests without needing a live server port.
 *
 * ⚠️  These tests hit the REAL MongoDB Atlas database.
 *     Use a separate test database in production setups.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  // A unique email per test run so we don't collide with previous runs
  const uniqueEmail = `test_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Boot the entire app — same as production startup
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Cleanly shut down the app after all tests finish
    await app.close();
  });

  // ──────────────────────────────────────────────────────
  // ✅ Happy path
  // ──────────────────────────────────────────────────────

  describe('POST /auth/signup', () => {
    it('should return 201 and a safe user object for a valid signup', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        fName: 'John',
        lName: 'Doe',
        email: uniqueEmail,
        password: 'Secret123',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        fName: 'John',
        lName: 'Doe',
        email: uniqueEmail,
        role: 'user',
      });

      // Password must NEVER be returned
      expect(res.body).not.toHaveProperty('password');
      // ID and createdAt should be present
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('createdAt');
    });

    // ──────────────────────────────────────────────────────
    // ❌ Validation failures (ZodValidationPipe → 400)
    // ──────────────────────────────────────────────────────

    it('should return 400 if email is invalid', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        fName: 'John',
        lName: 'Doe',
        email: 'not-an-email', // ← invalid
        password: 'Secret123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should return 400 if password is too short (< 8 chars)', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        fName: 'John',
        lName: 'Doe',
        email: 'john2@example.com',
        password: 'Hi1', // ← too short
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('password');
    });

    it('should return 400 if password has no uppercase letter', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        fName: 'John',
        lName: 'Doe',
        email: 'john3@example.com',
        password: 'secret123', // ← no uppercase
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('password');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        email: 'john4@example.com',
        password: 'Secret123',
        // fName and lName are missing
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    // ──────────────────────────────────────────────────────
    // ❌ Business logic failures
    // ──────────────────────────────────────────────────────

    it('should return 409 if email is already registered', async () => {
      // uniqueEmail was created in the first test above
      const res = await request(app.getHttpServer()).post('/auth/signup').send({
        fName: 'Jane',
        lName: 'Doe',
        email: uniqueEmail, // ← same email as first test
        password: 'Secret123',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        'An account with this email already exists'
      );
    });
  });
});
