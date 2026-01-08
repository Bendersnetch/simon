import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataGatewayController } from './sensor-data-gateway.controller';
import { SensorDataGatewayService } from './sensor-data-gateway.service';

describe('SensorDataGatewayController', () => {
  let controller: SensorDataGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorDataGatewayController],
      providers: [
        {
          provide: SensorDataGatewayService,
          useValue: {
            getRecent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SensorDataGatewayController>(SensorDataGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
