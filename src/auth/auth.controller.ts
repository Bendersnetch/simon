import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  async register(@Body() createUserDto : CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto): Promise<{token: string}> {
    return this.authService.login(loginDto);
  }
}
