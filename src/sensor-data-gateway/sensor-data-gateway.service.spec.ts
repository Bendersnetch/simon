import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataGatewayService } from './sensor-data-gateway.service';

describe('SensorDataGatewayService', () => {
  let service: SensorDataGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorDataGatewayService],
    }).compile();

    service = module.get<SensorDataGatewayService>(SensorDataGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
