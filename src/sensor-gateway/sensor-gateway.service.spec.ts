import { Test, TestingModule } from '@nestjs/testing';
import { SensorGatewayService } from './sensor-gateway.service';

describe('SensorGatewayService', () => {
  let service: SensorGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorGatewayService],
    }).compile();

    service = module.get<SensorGatewayService>(SensorGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
