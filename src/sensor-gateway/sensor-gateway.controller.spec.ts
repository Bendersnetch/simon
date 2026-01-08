import { Test, TestingModule } from '@nestjs/testing';
import { SensorGatewayController } from './sensor-gateway.controller';

describe('SensorGatewayController', () => {
  let controller: SensorGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorGatewayController],
    }).compile();

    controller = module.get<SensorGatewayController>(SensorGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
