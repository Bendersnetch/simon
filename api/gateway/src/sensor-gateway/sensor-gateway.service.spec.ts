import { Test, TestingModule } from '@nestjs/testing';
import { SensorGatewayService } from './sensor-gateway.service';
import { HttpService } from '@nestjs/axios';

describe('SensorGatewayService', () => {
  let service: SensorGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorGatewayService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SensorGatewayService>(SensorGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
