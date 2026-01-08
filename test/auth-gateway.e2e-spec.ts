import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthGatewayService } from '../src/auth-user-gateway/auth-gateway/auth-gateway.service';

describe('AuthGatewayController (e2e)', () => {
    let app: INestApplication;
    const mockAuthGatewayService = {
        register: jest.fn(),
        login: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(AuthGatewayService)
            .useValue(mockAuthGatewayService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/auth/register (POST)', async () => {
        const createUserDto = {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@example.com',
            password: 'password123',
        };
        const userResponse = {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@example.com',
            createdAt: new Date().toISOString()
        };
        mockAuthGatewayService.register.mockResolvedValue(userResponse);

        return request(app.getHttpServer())
            .post('/auth/register')
            .send(createUserDto)
            .expect(201)
            .expect(userResponse);
    });

    it('/auth/login (POST)', async () => {
        const loginDto = {
            email: 'john@example.com',
            password: 'password123',
        };
        const tokenResponse = { token: 'mock-jwt-token' };
        mockAuthGatewayService.login.mockResolvedValue(tokenResponse);

        return request(app.getHttpServer())
            .post('/auth/login')
            .send(loginDto)
            .expect(201) // NestJS Post default return 201
            .expect(tokenResponse);
    });
});
