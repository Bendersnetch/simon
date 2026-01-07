import { Test, TestingModule } from '@nestjs/testing';
import { AuthGatewayModule } from './auth-gateway.module';
import { AuthGatewayService } from './auth-gateway.service';
import { AuthGatewayController } from './auth-gateway.controller';
import { HttpService } from '@nestjs/axios';

describe('AuthGatewayModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AuthGatewayModule],
        })
            .overrideProvider(HttpService)
            .useValue({
                post: jest.fn(),
            })
            .compile();
    });

    it('should compile the module', async () => {
        expect(module).toBeDefined();
        expect(module.get(AuthGatewayService)).toBeDefined();
        expect(module.get(AuthGatewayController)).toBeDefined();
    });
});
