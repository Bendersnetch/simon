import { Test, TestingModule } from '@nestjs/testing';
import { SensorDataGatewayController } from './sensor-data-gateway.controller';

describe('SensorDataGatewayController', () => {
  let controller: SensorDataGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorDataGatewayController],
    }).compile();

    controller = module.get<SensorDataGatewayController>(SensorDataGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
