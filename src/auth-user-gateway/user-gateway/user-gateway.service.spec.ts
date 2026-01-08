import { Test, TestingModule } from '@nestjs/testing';
import { UserGatewayService } from './auth-gateway.service';

describe('UserGatewayService', () => {
  let service: UserGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGatewayService],
    }).compile();

    service = module.get<UserGatewayService>(UserGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
