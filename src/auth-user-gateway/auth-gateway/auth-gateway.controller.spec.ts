import { Test, TestingModule } from '@nestjs/testing';
import { AuthGatewayController } from './auth-gateway.controller';
import { AuthGatewayService } from './auth-gateway.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthGatewayController', () => {
  let controller: AuthGatewayController;
  let authGatewayService: AuthGatewayService;

  const mockAuthGatewayService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthGatewayController],
      providers: [
        {
          provide: AuthGatewayService,
          useValue: mockAuthGatewayService,
        },
      ],
    }).compile();

    controller = module.get<AuthGatewayController>(AuthGatewayController);
    authGatewayService = module.get<AuthGatewayService>(AuthGatewayService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authGatewayService.register and return the result', async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const userResponseDto: UserResponseDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      };

      mockAuthGatewayService.register.mockResolvedValue(userResponseDto);

      const result = await controller.register(createUserDto);

      expect(mockAuthGatewayService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(userResponseDto);
    });
  });

  describe('login', () => {
    it('should call authGatewayService.login and return the result', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };
      const tokenResponse = { token: 'some-jwt-token' };

      mockAuthGatewayService.login.mockResolvedValue(tokenResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthGatewayService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(tokenResponse);
    });
  });
});
