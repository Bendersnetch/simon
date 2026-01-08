import { Test, TestingModule } from '@nestjs/testing';
import { UserGatewayController } from './user-gateway.controller';
import { UserGatewayService } from './user-gateway.service';

describe('UserGatewayController', () => {
  let controller: AuthGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGatewayController],
      providers: [
        {
          provide: UserGatewayService,
          useValue: {
            deleteUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserGatewayController>(UserGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});