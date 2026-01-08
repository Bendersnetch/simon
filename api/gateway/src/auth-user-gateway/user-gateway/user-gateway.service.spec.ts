import { Test, TestingModule } from '@nestjs/testing';
import { UserGatewayService } from './user-gateway.service';
import { HttpService } from '@nestjs/axios';

describe('UserGatewayService', () => {
  let service: UserGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGatewayService,
        {
          provide: HttpService,
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserGatewayService>(UserGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
