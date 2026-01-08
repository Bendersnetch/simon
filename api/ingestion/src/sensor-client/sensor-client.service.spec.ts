import { Test, TestingModule } from '@nestjs/testing';
import { SensorClientService } from './sensor-client.service';

describe('SensorClientService', () => {
  let service: SensorClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorClientService],
    }).compile();

    service = module.get<SensorClientService>(SensorClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
