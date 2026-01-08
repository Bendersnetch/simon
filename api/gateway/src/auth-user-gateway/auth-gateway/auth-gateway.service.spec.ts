import { Test, TestingModule } from '@nestjs/testing';
import { AuthGatewayService } from './auth-gateway.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';

describe('AuthGatewayService', () => {
  let service: AuthGatewayService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGatewayService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<AuthGatewayService>(AuthGatewayService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should call httpService.post and return data', async () => {
      const createUserDto: CreateUserDto = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password',
      };
      const userResponse: UserResponseDto = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      const axiosResponse = {
        data: userResponse,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {},
      };

      mockHttpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.register(createUserDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://localhost:3002/api/v1/auth/register',
        createUserDto
      );
      expect(result).toEqual(userResponse);
    });
  });

  describe('login', () => {
    it('should call httpService.post and return token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const tokenResponse = { token: 'jwt-token' };

      const axiosResponse = {
        data: tokenResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      mockHttpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.login(loginDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://localhost:3002/api/v1/auth/login',
        loginDto
      );
      expect(result).toEqual(tokenResponse);
    });
  });
});
