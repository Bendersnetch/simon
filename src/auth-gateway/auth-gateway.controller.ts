import { Controller, Post, Body} from '@nestjs/common';
import { AuthGatewayService } from './auth-gateway.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly authGatewayService: AuthGatewayService) {}

  @Post("/register")
  async register(@Body() createUserDto : CreateUserDto): Promise<UserResponseDto> {
    return this.authGatewayService.register(createUserDto);
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto): Promise<{token: string}> {
    return this.authGatewayService.login(loginDto);
  }
}
