import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserGatewayService } from '../src/auth-user-gateway/user-gateway/user-gateway.service';

describe('UserGatewayController (e2e)', () => {
    let app: INestApplication;
    const mockUserGatewayService = {
        deleteUserByEmail: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(UserGatewayService)
            .useValue(mockUserGatewayService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/user/:email (DELETE)', () => {
        const email = 'test@example.com';
        mockUserGatewayService.deleteUserByEmail.mockResolvedValue(undefined);

        return request(app.getHttpServer())
            .delete(`/user/${email}`)
            .expect(204);
    });
});
