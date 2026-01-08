import { Test, TestingModule } from '@nestjs/testing';
import { SensorGatewayController } from './sensor-gateway.controller';
import { SensorGatewayService } from './sensor-gateway.service';

describe('SensorGatewayController', () => {
  let controller: SensorGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorGatewayController],
      providers: [
        {
          provide: SensorGatewayService,
          useValue: {
            createSensor: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SensorGatewayController>(SensorGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
