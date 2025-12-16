import { Test, TestingModule } from '@nestjs/testing';
import { AuthGatewayService } from './auth-gateway.service';

describe('AuthGatewayService', () => {
  let service: AuthGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGatewayService],
    }).compile();

    service = module.get<AuthGatewayService>(AuthGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
